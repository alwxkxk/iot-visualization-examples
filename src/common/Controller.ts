import { Euler, Group, Vector3 } from "three";
import Space from "./Space";

const THREE = (window as IWindow).THREE;

class Controller {
  lineObject3d: IGroup;
  name: string;
  object3d: Objects;
  originalPosition: Vector3;
  originalRotation: Euler;
  originalScale: Vector3;
  position: Vector3;
  rotation: Euler;
  userData: any;
  scale: Vector3;
  showingObject3d: Objects;
  showingModel: string;
  space: Space;

  constructor(space: Space, object3d: Objects, options?: any) {
    this .space = space;
    this .object3d = object3d;
    object3d.$controller = this ;

    this .init();
  }

  init(): Controller {
    const object3d = this .object3d;

    this .name = object3d.name;
    this .userData = object3d.userData;

    this .originalPosition = this .position = object3d.position.clone();
    this .originalRotation = this .rotation = object3d.rotation.clone();
    this .originalScale = this .scale = object3d.scale.clone();

    this .showingModel = "normal";
    this .showingObject3d = object3d;

    if(this .userData["renderOrder"]){
      object3d.renderOrder = this .userData["renderOrder"]
    }

    return this ;
  }

  initLineModel(color?: any): Controller {
    const object3d = this .object3d;
    const group = this .lineObject3d = new THREE.Group();
    const lineMaterial = new THREE.LineBasicMaterial({color: color || 0x00FFFF});
    const boxMaterial = new THREE.LineBasicMaterial({
      depthTest: false,
      depthWrite: false,
      opacity: 0 ,
      side: THREE.BackSide,
      transparent: true,
    });
    group.name = this .name + "_lineObject3d";
    group.$controller = this ;

    const children = Array.from(object3d.children);
    children.forEach((v: IMesh) => {
      if (this .hasGeometry(v)) {
        const geo = new THREE.EdgesGeometry(v.geometry);
        const line = new THREE.LineSegments( geo , lineMaterial);
        // add transparent box to avoid picking difficult by raycaster.
        const box = new THREE.Mesh(geo, boxMaterial);

        this
        .copyCoordinate(v, line)
        .copyCoordinate(v, box);

        group
        .add(line)
        .add(box);

      }
    });
    this .lineObject3d = group;
    return this ;
  }

  hasGeometry(obj: Objects): boolean {
    // @ts-ignore
    return !!obj.geometry;
  }

  changeShowingModel(model: string): Controller {
    switch (model) {
      case "line":
        this .changeToLineModel();
        break;
      case "normal":
        this .changeToNormalModel();
        break;

      default:
        console.error("can't change to this model :", model);
        return this ;
    }
    this .showingModel = model;
    return this ;
  }

  changeToNormalModel(): Controller {
    if(this .showingModel === "normal"){
      return;
    }
    this .updateShowingObject3d(this .object3d);
    return this ;
  }

  changeToLineModel(): Controller {
    if(this .showingModel === "line"){
      return;
    }

    if (!this .lineObject3d) {
      this .initLineModel();
    }

    this .updateShowingObject3d(this .lineObject3d);
    return this ;
  }

  copyCoordinate(from: Objects, to: Objects): Controller {
    to.position.copy(from.position.clone());
    to.scale.copy(from.scale.clone());
    to.rotation.copy(from.rotation.clone());
    return this ;
  }

  updateShowingObject3d(newShowingObject3d: Objects): Controller {
    // move children(group) to new showingObject3d(exclude other objects without geometry.)
    const showingObject3d = this .showingObject3d;
    const children = Array.from(showingObject3d.children);
    children.forEach((obj: Objects) => {
      if (!this .hasGeometry(obj)) {
        newShowingObject3d.add(obj);
      }
    });

    const parent = showingObject3d.parent;
    if (parent) {
      // append to parent
      // remove old showingObject3d from parent
      parent
      .add(newShowingObject3d)
      .remove(showingObject3d);
    }
    this .showingObject3d = newShowingObject3d;
    return this ;
  }

}

export default Controller;
