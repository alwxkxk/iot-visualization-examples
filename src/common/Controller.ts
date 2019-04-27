import Space from "./Space";
import { Vector3, Euler, Group } from "THREE";

const THREE = (<windowEx>window).THREE;

class Controller {
  lineModel:Group;
  name:string;
  object3d:meshOrObject3d;
  originalPosition:Vector3;
  originalRotation:Euler;
  originalScale:Vector3;
  position:Vector3;
  rotation:Euler;
  userData:any;
  scale:Vector3;
  space:Space;

  constructor(space:Space,object3d:meshOrObject3d,options?:any) {
    this.space = space;
    this.object3d = object3d;
    object3d.$controller = this;
    
    this.init();
  }

  init():Controller{
    const object3d = this.object3d;

    this.name = object3d.name;
    this.userData = object3d.userData;

    this.originalPosition = this.position = object3d.position.clone();
    this.originalRotation = this.rotation = object3d.rotation.clone();
    this.originalScale = this.scale = object3d.scale.clone();
    
    return this;
  }

  initLineModel(color?:any):Controller{
    const object3d = this.object3d;
    const group = this.lineModel = new THREE.Group();
    const lineGroup = new THREE.Group();
    const outsideGroup = new THREE.Group();
    const lineMaterial = new THREE.LineBasicMaterial({color:color||0x00FFFF});
    const boxMaterial = new THREE.LineBasicMaterial({
      depthWrite: false,
      side: THREE.BackSide,
      transparent: true, 
      opacity: 0 , 
      depthTest: false
    });
    group.name = this.name + "_lineModel";
    group.$controller = this;

    lineGroup.name = group.name + "_line";
    outsideGroup.name = group.name + "_box";
    // object3d or mesh. 
    object3d.traverse((v:MeshEx)=>{
      // group is instance of object3d.Only mesh is valuable.
      if(v.isMesh){
        let geo = new THREE.EdgesGeometry(v.geometry);
        let line = new THREE.LineSegments( geo ,lineMaterial);
        let box = new THREE.Mesh(geo,boxMaterial);
        lineGroup.add(line);
        // add transparent box to avoid picking difficult by raycaster.
        outsideGroup.add(box);
      }
    })
    group.add(lineGroup);
    group.add(outsideGroup);
    return this;
  }


}

export default Controller;