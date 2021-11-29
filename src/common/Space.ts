import {easeCubicInOut} from "d3-ease";
import * as Selection from "d3-selection";
import "three/examples/js/controls/OrbitControls.js";
import "three/examples/js/loaders/GLTFLoader.js";
import Heatmap from "./base/Heatmap";
import Inspector from "./base/Inspector";
import ProgressBar from "./components/ProgressBar";
import Controller from "./Controller";

// outline
import "three/examples/js/postprocessing/EffectComposer.js";
import "three/examples/js/postprocessing/RenderPass.js";
import "three/examples/js/postprocessing/ShaderPass.js";
import "three/examples/js/shaders/CopyShader.js";
import "three/examples/js/shaders/FXAAShader.js";
import "./base/outlinepass.js";

// bloom
import "three/examples/js/shaders/LuminosityHighPassShader.js";
import "./base/UnrealBloomPass.js";

import { interpolateNumber } from "d3-interpolate";
import { isNumber, throttle } from "lodash";
// @ts-ignore
import mitt from "mitt";
import { IObject3d, ISpaceOptions, Objects } from "../type";
import Events from "./base/Events";

const THREE = window.THREE;
const box = new THREE.Box3();
const delta = new THREE.Vector3();
const center = new THREE.Vector3();
const sphere = new THREE.Sphere();

class Space {
  public bloomPass: any;
  public box3: any;
  public camera: any;
  public composer: any;
  public controllerIdList: Map<string, Controller>;
  public readonly element: Element;
  public innerHeight: number;
  public innerWidth: number;
  public inspector: Inspector;
  public heatmap: Heatmap;
  public mouse: any;
  public offset: {
    top: number;
    left: number;
  };
  public readonly options: ISpaceOptions;
  public orbit: any;
  // outlinePass:any;
  public outlinePassMap: Map< string, any>;
  public progressBar: ProgressBar;
  public raycaster: THREE.Raycaster;
  public raycasterEventMap: Map< string, Function>;
  public raycasterObjects: IObject3d[];
  public raycasterRecursive: boolean;
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public stopComposer: boolean; // antialias : renderer > composer with FXAAShader > composer without FXAAShader
  public updateRaycasterObjects: Function;
  public emitter: mitt.Emitter;
  public animationId: number;
  private eventList: any;

  constructor(element: Element, options?: ISpaceOptions) {
    this .element = element;
    this .options = options;
    this .init();
    return this ;
  }

  public focus(target: IObject3d) {
    let distance;
    box.setFromObject( target );

    if ( box.isEmpty() === false ) {

      box.getCenter( center );
      distance = box.getBoundingSphere( sphere ).radius;

    } else {

      // Focusing on an Group, AmbientLight, etc

      center.setFromMatrixPosition( target.matrixWorld );
      distance = 0.1;

    }

    delta.set( 0, 0, 1 );
    delta.applyQuaternion( this.camera.quaternion );
    delta.multiplyScalar( distance * 4 );

    const start = this.camera.position.clone();
    const end = center.add( delta );
    const scope = this;

    // @ts-ignore
    Selection.select({}).transition().duration(2000).ease(easeCubicInOut).tween("camera-focus-move", () => {
      const ix = interpolateNumber(start.x, end.x);
      const iy = interpolateNumber(start.y, end.y);
      const iz = interpolateNumber(start.z, end.z);

      let tix: Function;
      let tiy: Function;
      let tiz: Function;
      if (scope.orbit) {
        const ot = scope.orbit.target.clone();
        tix = interpolateNumber(ot.x, target.position.x);
        tiy = interpolateNumber(ot.y, target.position.y);
        tiz = interpolateNumber(ot.z, target.position.z);
        // console.log("target:",target)
      }

      return (t: any) => {
        scope.camera.position.set(ix(t), iy(t), iz(t));

        if (scope.orbit) {
          scope.orbit.target.set(tix(t), tiy(t), tiz(t));
          scope.orbit.update();
        }
      };
    });
  }

  public getControllerById(id: string): Controller {
    return this .controllerIdList.get(id);
  }

  /**
   * get controllers by name which include key value.
   *
   * @param {string} key the sub string of name
   * @returns {Controller[]}
   * @memberof Space
   */
  public getControllersByName(key: string): Controller[] {
    const result: Controller[] = [];
    this.scene.traverse((o: IObject3d) => {
      if (o.$controller && o.$controller.name.includes(key)) {
        result.push(o.$controller);
      }
    });
    return result;
  }

  public getControllersByTags(key: string): Controller[] {
    const result: Controller[] = [];
    this.scene.traverse((o: IObject3d) => {
      if (o.$controller && o.$controller.tags.includes(key)) {
        result.push(o.$controller);
      }
    });
    return result;
  }

  public getViewOffset(object: THREE.Object3D) {
    const vector = new THREE.Vector3();
    const result: any = {};
    const widthHalf = this .innerWidth / 2;
    const heightHalf = this . innerHeight / 2;

    vector.setFromMatrixPosition(object.matrixWorld);
    vector.project(this.camera);
    result.x = vector.x * widthHalf + widthHalf + this .offset.left;
    result.y = -(vector.y * heightHalf) + heightHalf + this .offset.top;
    return result;
  }

  public getPositionByPercent(x: number, y: number, z: number): THREE.Vector3 {
    if (!this .box3) {
      this .getBox();
    }
    const max = this .box3.max;
    const min = this .box3.min;
    return new THREE.Vector3(
      (max.x - min.x) * x / 100 + min.x,
      (max.y - min.y) * y / 100 + min.y,
      (max.z - min.z) * z / 100 + min.z,
    );
  }

  public afterLoaded(gltf: any): Space {
    const e = this .element;

    const scene = this .scene = gltf.scene;
    const camera = this .camera = new THREE.PerspectiveCamera( 20, e.clientWidth / e.clientHeight, 0.1, 1000 );
    this .setPerspectiveCamera(camera, scene.userData);
    scene.add(camera);
    scene.add( new THREE.HemisphereLight( 0xffffff, 0xffffff, 1 ) );

    this .scene.traverse((object3d: IObject3d) => {
      if (object3d.type !== "Scene") {
        // tslint:disable-next-line: no-unused-expression
        const control = new Controller(this , object3d);
      }
    });

    Array.from(this .scene.children).forEach((v: Objects) => {
      if (v.$controller) {
        v.$controller.applyUserData();
      }
    });

    // all object is raycaster by default.
    this .updateRaycasterObjects();

    // click: outline the object by default.
    if (!this .raycasterEventMap) {
      this .setRaycasterEventMap({
        click: (intersects: any) => {
          if (intersects.length > 0) {
            this .setOutline([intersects[0].object]);
          }
        },
      });
    }
    e.addEventListener("click", this .eventList.updateMouse);
    e.addEventListener("dblclick", this .eventList.updateMouse);
    e.addEventListener("mousemove", this .eventList.updateMouse);
    if (this .options.outline) {
      this .initOutline();
    }
    this .animate();
    return this ;
  }
  public animate(): Space {

    this.emit(Events.animate, null);

    if (this .bloomPass && !this .stopComposer) {
      // bloom : object3.layers.enable(1)
      this .renderer.autoClear = false;
      this .renderer.clear();
      this .camera.layers.set(1);
      this .composer.render();
      this .renderer.clearDepth();
      this .camera.layers.set(0);
      this .renderer.render(this .scene, this .camera);
    } else if (this .composer && !this .stopComposer) {
      // outline
      this .composer.render();
    } else {
      this .renderer.render( this .scene, this .camera );
    }

    this.animationId = requestAnimationFrame( this .animate.bind(this ) );
    return this ;
  }

  public createEmptyScene() {
    const gltf: any = {};
    gltf.scene = new THREE.Scene();
    this .afterLoaded(gltf);
  }

  public dispose() {
    const e = this .element;

    cancelAnimationFrame(this.animationId);
    // TODO: dispose Materials,Geometries,Textures,Render Targets

    // @ts-ignore : scene has dispose method.
    this .scene.dispose();

    window.removeEventListener("resize", this .eventList.resize);
    e.removeEventListener("click", this .eventList.updateMouse);
    e.removeEventListener("dblclick", this .eventList.updateMouse);
    e.removeEventListener("mousemove", this .eventList.updateMouse);
    this .eventList = null;
  }

  public deleteOutlinePass(key: string) {
    this .outlinePassMap.delete(key);
  }

  public getOutlineArray(key: string) {
    let result = [];
    if (this .outlinePassMap.get(key)) {
      result = this .outlinePassMap.get(key).selectedObjects;
    }
    return result;
  }

  public init(): Space {
    this.emitter = mitt();
    const e = this .element;
    const options = this .options || {};
    const renderer = this .renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});

    if (e.clientWidth === 0 || e.clientHeight === 0) {
      console.error("element should had width and height before init.");
      return this ;
    }

    this .innerWidth =  e.clientWidth;
    this .innerHeight =  e.clientHeight;
    this .controllerIdList = new Map();
    this .offset = $(e).offset();

    renderer.setSize(e.clientWidth, e.clientHeight );
    e.appendChild(renderer.domElement);

    this .raycaster = new THREE.Raycaster();
    this .mouse = new THREE.Vector2();

    this .inspector = new Inspector(this );

    this .eventList = {
      resize: this .resize.bind(this ),
      updateMouse: this .updateMouse.bind(this ),
    };

    window.addEventListener("resize", this .eventList.resize);
    this .initUpdateRaycasterObjects();

    return this ;
  }

  public initBloom() {
    // note: initBloom() should behind initOutline().
    this .initComposer();
    const composer = this .composer;

    const  renderPass = new THREE.RenderPass( this .scene, this .camera);
    composer.addPass( renderPass );

    const bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2( this .innerWidth, this .innerHeight ),
        1.5, 0.4, 0.85,
      );
    bloomPass.threshold = 0;
    bloomPass.strength = 1.5;
    bloomPass.radius = 0;
    bloomPass.renderToScreen = true;
    this .bloomPass = bloomPass;

    composer.addPass( bloomPass );

    const effectFXAA = new THREE.ShaderPass( THREE.FXAAShader );
    const pixelRatio = this .renderer.getPixelRatio();
    effectFXAA.material.uniforms.resolution.value.x = 1 / ( this .innerWidth * pixelRatio );
    effectFXAA.material.uniforms.resolution.value.y = 1 / ( this .innerHeight * pixelRatio );
    composer.addPass( effectFXAA );
  }

  public initOrbit(): Space {
    const options = this .options || {};

    if (options.orbit) {
      const orbit = this .orbit = new THREE.OrbitControls(this .camera, this .renderer.domElement);
      orbit.update();
    }

    return this ;
  }

  public initOutline(): Space {
    this .initComposer();
    const composer = this .composer;

    const  renderPass = new THREE.RenderPass( this .scene, this .camera);
    composer.addPass( renderPass );

    this .outlinePassMap = new Map();
    this .setOutlinePass("space");

    // BUG: this make object3d having a few px black border.
    const effectFXAA = new THREE.ShaderPass( THREE.FXAAShader );
    const pixelRatio = this .renderer.getPixelRatio();
    effectFXAA.material.uniforms.resolution.value.x = 1 / ( this .innerWidth * pixelRatio );
    effectFXAA.material.uniforms.resolution.value.y = 1 / ( this .innerHeight * pixelRatio );
    composer.addPass( effectFXAA );
    return this ;
  }

  public load(file: string): Promise< any> {
    const scope = this ;
    const progressBar = this .progressBar = new ProgressBar(this .element);
    return new Promise((resolve, reject) => {
      const gltfLoader = new THREE.GLTFLoader();
      const loader = new THREE.FileLoader( THREE.DefaultLoadingManager );
      loader.setResponseType( "arraybuffer" );
      progressBar.start();
      loader.load(file,
        function loaded(data: any) {
          const resourcePath = THREE.LoaderUtils.extractUrlBase( file );
          const beginTime = performance.now();
          progressBar.parse();
          gltfLoader.parse(data, resourcePath,
            (gltf: any) => {
              console.log("parse spent:", performance.now() - beginTime);
              console.log(gltf);
              progressBar.dispose();
              scope.afterLoaded(gltf);
              resolve();
            },
            (error: any) => {
              reject(error);
            },
          );
        },
        function progressing(xhr: any) {
          progressBar.progress( xhr.loaded / xhr.total * 100);
          // console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        function loadedError(error: Error) {
          reject(error);
        });
    });
  }

  public raycasterAction(): Space {

    if (this .raycasterEventMap.size === 0) {
      return this ;
    }
    const raycaster = this .raycaster;
    const mouse = this .mouse;
    const eventMap = this .raycasterEventMap;
    let intersects;
    raycaster.setFromCamera(mouse, this .camera);
    intersects = raycaster.intersectObjects(this .raycasterObjects, this .raycasterRecursive);

    // if (intersects.length === 0) {
    //   return this ;
    // }

    // raycasterEventMap callback
    if (eventMap.has(mouse.eventType)) {
      const func = eventMap.get(mouse.eventType);
      if (func) {
        func(intersects);
      }
    }
    // console.log(intersects);

    return this ;
  }

  public resize(): Space {
    const camera = this .camera;
    const e = this .element;
    this .offset = $(e).offset();
    if (e.clientWidth === 0 || e.clientHeight === 0) {
      console.error("resize error:element width and height is error.", e.clientWidth, e.clientHeight);
      return this ;
    }

    console.log("resize:", this .offset);

    if (camera.type === "PerspectiveCamera") {
      camera.aspect = e.clientWidth / e.clientHeight;
      camera.updateProjectionMatrix();
    }
    this .innerHeight = e.clientHeight;
    this .innerWidth = e.clientWidth;
    this .renderer.setSize(e.clientWidth, e.clientHeight);
    return this ;
  }

  public setControllerId(id: string, controller: Controller) {
    const list = this .controllerIdList;
    if (list.has(id)) {
      return console.error("error: same id.", list.get(id), controller);
    }
    list.set(id, controller);
  }

  public setOutline(array: IObject3d[], key?: string) {
    if (! this .outlinePassMap) {
      return console.warn("initOutlinePass() should be invoked first.");
    }
    const outlinePass = this .outlinePassMap.get(key || "space");
    if (outlinePass) {
      outlinePass.selectedObjects = array;
    }
  }

  public setOutlinePass(key: string, options?: any) {
    const outlinePass = new THREE.OutlinePass(
      new THREE.Vector2( this .innerWidth, this .innerHeight ), this .scene, this .camera,
    );
    this .composer.addPass( outlinePass );
    const opt = options || {};
    outlinePass.edgeStrength = isNumber(opt.edgeStrength) ? opt.edgeStrength : 5;
    outlinePass.edgeGlow = isNumber(opt.edgeGlow) ? opt.edgeGlow : 1;
    outlinePass.pulsePeriod = isNumber(opt.pulsePeriod) ? opt.pulsePeriod : 2;
    outlinePass.visibleEdgeColor.set(opt.visibleEdgeColor || "#35f2d1");
    outlinePass.hiddenEdgeColor.set(opt.hiddenEdgeColor || "#00ffff");
    this .outlinePassMap.set(key, outlinePass);

  }

  public setPerspectiveCamera(camera: any, data: any): Space {
    const degToRad  = THREE.Math.degToRad ;
    camera.fov = data.fov || 50;
    camera.position.set(
      isNumber(data.x) ? data.x : 1,
      isNumber(data.y) ? data.y : 1,
      isNumber(data.z) ? data.z : 1,
    );
    camera.rotation.set(
      degToRad(data.rx || 0),
      degToRad(data.ry || 0),
      degToRad(data.rz || 0),
    );
    camera.updateProjectionMatrix();
    this .initOrbit();
    return this ;
  }

  /**
   * set the raycaster callback.
   *
   * @param {Object} eventList
   * @param {Function} [eventList.click] - click event callback function
   * @param {Function} [eventList.dblclick] - dblclick event callback function
   * @param {Function} [eventList.mousemove] - mousemove event callback function
   * @returns {Space}
   * @memberof Space
   */
  public setRaycasterEventMap(eventList: any): Space {
    let eventMap = this .raycasterEventMap;
    if (!eventMap) {
      eventMap = this .raycasterEventMap = new Map();
    }

    eventMap.set("click", eventList.click);
    eventMap.set("dblclick", eventList.dblclick);
    eventMap.set("mousemove", eventList.mousemove);
    return this ;
  }

  public updateMouse(event: MouseEvent): Space {
    const mouse = this .mouse;
    switch (event.type) {
      case "click":
        mouse.eventType = "click";
        mouse.clickEvent = event;
        break;

      case "dblclick":
        mouse.eventType = "dblclick";
        mouse.dblclickEvent = event;
        break;

      case "mousemove":
        mouse.eventType = "mousemove";
        mouse.mousemoveEvent = event;
        break;

      default:
        console.error("updateMouse eventType error:", event);
        return this ;
    }
    // serialize value to -1 ~ +1
    mouse.x = (event.clientX - (this .offset.left)) / this .innerWidth * 2 - 1;
    mouse.y = -((event.clientY - (this .offset.top)) / this .innerHeight) * 2 + 1;
    this .raycasterAction();
    return this ;
  }

  public showHeatmap(mainObj: THREE.Object3D) {
    this.heatmap = new Heatmap(this, mainObj);
  }

  public on(type: string, handler: any) {
    this.emitter.on(type, handler);
  }

  public off(type: string, handler: any) {
    this.emitter.off(type, handler);
  }

  public emit(type: string, evt: any) {
    this.emitter.emit(type, evt);
  }

  private getBox() {
    // set the first objects as global.
    this .box3 = (new THREE.Box3()).setFromObject(this .scene.children[0]);
  }

  private initComposer() {
    if (!this .composer) {
      this .composer = new THREE.EffectComposer( this .renderer );
    }
  }

  private initUpdateRaycasterObjects() {
    function func() {
      this .raycasterObjects = [];
      this .scene.traverse((object3d: IObject3d) => {
        if (object3d.$controller && object3d.$controller.raycasterFlag) {
          this .raycasterObjects.push(object3d.$controller.getRaycasterObject());
        }
      });
      return this .raycasterObjects;
    }
    this .updateRaycasterObjects = throttle(func.bind(this), 500);
  }

}

export default Space;
