import "three/examples/js/controls/OrbitControls.js";
import "three/examples/js/loaders/GLTFLoader.js";
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

import {
  Raycaster,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import Curve from "./base/Curve";

const THREE = (window as windowEx).THREE;

interface Ioptions {
  renderer?: any;
  inspector?: boolean;
  orbit?: boolean;
}

class Space {
  public animateActionMap: Map< string, Function>;
  public camera: any;
  public composer: any;
  public readonly element: Element;
  public innerHeight: number;
  public innerWidth: number;
  public mouse: any;
  public offset: {
    top: number;
    left: number;
  };
  public readonly options: Ioptions;
  public orbit: any;
  // outlinePass:any;
  public outlinePassMap: Map< string, any>;
  public progressBar: ProgressBar;
  public raycaster: Raycaster;
  public raycasterEventMap: Map< string, Function>;
  public raycasterObjects: Object3dEx[];
  public raycasterRecursive: boolean;
  public renderer: WebGLRenderer;
  public scene: Scene;
  private _eventList: any;

  constructor(element: Element, options?: Ioptions) {
    this .element = element;
    this .options = options;
    this .init();
    return this ;
  }

  public addAnimateAction(key: string, func: Function): Space {
    const map = this .animateActionMap;
    if (map.has(key)) {
      console.warn(`${key} already existed in animateActionMap,and replace by new function.`);
    }
    map.set(key, func);
    return this ;
  }

  public afterLoaded(gltf: any): Space {
    const e = this .element;

    const scene = this .scene = gltf.scene;
    const camera = this .camera = new THREE.PerspectiveCamera( 20, e.clientWidth / e.clientHeight, 0.1, 1000 );
    this .setPerspectiveCamera(camera, scene.userData);
    scene.add(camera);
    scene.add( new THREE.HemisphereLight( 0xffffff, 0xffffff, 1 ) );

    // all object is raycaster by default.
    this .raycasterObjects = [];
    this .scene.traverse((object3d: Object3dEx) => {
      this .raycasterObjects.push(object3d);
      new Controller(this , object3d);

    });
    // click: outline the object by default.
    if (!this .raycasterEventMap) {
      this .setRaycasterEventMap({
        click: (intersects: any) => {
          this .setOutline([intersects[0].object]);
        },
      });
    }
    e.addEventListener("click", this ._eventList.updateMouse);
    e.addEventListener("dblclick", this ._eventList.updateMouse);
    e.addEventListener("mousemove", this ._eventList.updateMouse);
    this .initOutline();
    this .animate();
    return this ;
  }
  public animate(): Space {

    this .animateActionMap.forEach((func: Function) => {
      func();
    });

    if (this .composer) {
      this .composer.render();
    } else {
      this .renderer.render( this .scene, this .camera );
    }

    requestAnimationFrame( this .animate.bind(this ) );
    return this ;
  }

  public autoRotate(flag: boolean, speed?: number) {
    const orbit = this .orbit;
    if (!orbit) {
      return console.error("autoRotate need orbit control");
    }
    orbit.autoRotate = flag;

    if (flag) {
      orbit.autoRotateSpeed = speed || 2;
      this .addAnimateAction("autoRotate", () => {
        orbit.update();
      });
    } else {
      this .removeAnimateAction("autoRotate");
    }
  }

  public createEmptyScene() {
    const gltf: any = {};
    gltf.scene = new THREE.Scene();
    // orbit will abnormal when camera position null.
    gltf.scene.userData = {
      fov: 20,
      x: -10,
      y: 7,
      z: 6,
      rx: -50,
      ry: -54,
      rz: -44,
    };
    this .afterLoaded(gltf);
  }

  public curveConnect(startPoint: Vector3, endPoint: Vector3, options?: any) {
    const curve = new Curve(this , startPoint, endPoint, options);
    this .scene.add(curve.object3d);
    // test add points concurrently.
    setTimeout(() => {
      curve.addPointEasing();
    }, 1000);
    setTimeout(() => {
      curve.addPointEasing();
    }, 1500);
    setTimeout(() => {
      curve.addPointEasing();
    }, 2000);
    return this ;
  }

  public dispose() {
    const e = this .element;
    // TODO: dispose Materials,Geometries,Textures,Render Targets

    // @ts-ignore : scene has dispose method.
    this .scene.dispose();

    window.removeEventListener("resize", this ._eventList.resize);
    e.removeEventListener("click", this ._eventList.updateMouse);
    e.removeEventListener("dblclick", this ._eventList.updateMouse);
    e.removeEventListener("mousemove", this ._eventList.updateMouse);
    this ._eventList = null;
  }

  public deleteOutlinePass(key: string) {
    this .outlinePassMap.delete(key);
  }

  public getOutlineArray(key: string) {
    return this .outlinePassMap.get(key).selectedObjects || [];
  }

  public init(): Space {
    const e = this .element;
    const options = this .options || {};
    const renderer = this .renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});

    if (e.clientWidth === 0 || e.clientHeight === 0) {
      console.error("element should had width and height before init.");
      return this ;
    }

    this .innerWidth =  e.clientWidth;
    this .innerHeight =  e.clientHeight;
    this .animateActionMap = new Map();
    this .offset = $(e).offset();

    renderer.setSize(e.clientWidth, e.clientHeight );
    e.appendChild(renderer.domElement);

    this .raycaster = new THREE.Raycaster();
    this .mouse = new THREE.Vector2();

    if (options.inspector) {
      const inspector = new Inspector(this );
      this .addAnimateAction("inspector", inspector.animateAction);
      this .setRaycasterEventMap(inspector.raycasterEvent);
    }

    this ._eventList = {
      resize: this .resize.bind(this ),
      updateMouse: this .updateMouse.bind(this ),
    };

    window.addEventListener("resize", this ._eventList.resize);

    return this ;
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
    const composer = new THREE.EffectComposer( this .renderer );
    this .composer = composer;

    const  renderPass = new THREE.RenderPass( this .scene, this .camera);
    composer.addPass( renderPass );

    this .outlinePassMap = new Map();
    this .setOutlinePass("space");

    // BUG: this make object3d having a few px black border.
    // const effectFXAA = new THREE.ShaderPass( THREE.FXAAShader );
    // const pixelRatio = this.renderer.getPixelRatio();
    // effectFXAA.material.uniforms[ 'resolution' ].value.x = 1 / ( window.innerWidth * pixelRatio );
    // effectFXAA.material.uniforms[ 'resolution' ].value.y = 1 / ( window.innerHeight * pixelRatio );
    // composer.addPass( effectFXAA );
    return this ;
  }

  public load(file: string): Promise< any> {
    const scope = this ;
    const progressBar = this .progressBar = new ProgressBar(this .element);
    return new Promise((resolve, reject) => {
      // TODO: set and get data first from indexDB
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
              resolve();
              scope.afterLoaded(gltf);
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

  public removeAnimateAction(key: string): Space {
    this .animateActionMap.delete(key);
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

    // console.log(camera,offset);

    if (camera.type === "PerspectiveCamera") {
      camera.aspect = e.clientWidth / e.clientHeight;
      camera.updateProjectionMatrix();
    }

    this .renderer.setSize(e.clientWidth, e.clientHeight);
    return this ;
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

    if (intersects.length === 0) {
      return this ;
    }

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

  public setOutline(array: Object3dEx[], key?: string) {
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
    outlinePass.edgeStrength = opt.edgeStrength || 5;
    outlinePass.edgeGlow = opt.edgeGlow || 1;
    outlinePass.pulsePeriod = opt.pulsePeriod || 2;
    outlinePass.visibleEdgeColor.set(opt.visibleEdgeColor || "#35f2d1");
    outlinePass.hiddenEdgeColor.set(opt.hiddenEdgeColor || "#00ffff");
    this .outlinePassMap.set(key, outlinePass);

  }

  public setPerspectiveCamera(camera: any, data: any): Space {
    const degToRad  = THREE.Math.degToRad ;
    camera.fov = data.fov;
    camera.position.set(data.x || 0, data.y || 0, data.z || 0);
    camera.rotation.set(degToRad(data.rx || 0), degToRad(data.ry || 0), degToRad(data.rz || 0));
    camera.updateProjectionMatrix();
    this .initOrbit();
    return this ;
  }

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
        break;

      case "dblclick":
        mouse.eventType = "dblclick";
        break;

      case "mousemove":
        mouse.eventType = "mousemove";
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

}

export default Space;
