import Space from "./common/Space";
import { Scene } from "three";
import Curve from "./common/base/Curve";

const THREE = (<windowEx>window).THREE;
const element = $("#3d-space")[0];
const space = new Space(element,{
  inspector:true,
  orbit:true
});


space.load("./static/3d/simple_scene.glb")
.then(()=>{
  space.autoRotate(true);

})

// space.createEmptyScene();
// space.curveConnect(new THREE.Vector3( -1, 0, 0 ),new THREE.Vector3( 1, 0, 0 ));



// @ts-ignore
window.debugSpace=space;

