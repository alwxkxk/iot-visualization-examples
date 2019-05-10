import Space from "./common/Space";
import { Scene } from "three";
import Curve from "./common/base/Curve";
import {interpolateHsl} from "d3-interpolate";

const THREE = (< windowEx>window).THREE;
const element = $("#3d-space")[0];
const space = new Space(element, {
  inspector:true,
  orbit:true
});

// space.load("./static/3d/simple_scene.glb")
// .then(()=>{
// 	space.autoRotate(true);

// })

// space.createEmptyScene();
// space.curveConnect(new THREE.Vector3( -1, 0, 0 ),new THREE.Vector3( 1, 0, 0 ));

space.createEmptyScene();
var geometry = new THREE.BufferGeometry();
var vertices = new Float32Array( [
  -1.0, -1.0,  1.0,
   1.0, -1.0,  1.0,
   1.0,  1.0,  1.0,

   1.0,  1.0,  1.0,
  -1.0,  1.0,  1.0,
  -1.0, -1.0,  1.0
] );

// itemSize = 3 because there are 3 values (components) per vertex
geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
let colorArray = []
let len = geometry.attributes.position.array.length
for(let i = 0;i < len;i++){
  let rgb = interpolateHsl("red", "blue")((i+1)/len);
  let rgbValue = rgb.match(/\d+/g);
  console.log(rgb, i, len, (i+1)/len)
  colorArray[3*i] =  Number(rgbValue[0])/255;
  colorArray[3*i +1] =  Number(rgbValue[1])/255;
  colorArray[3*i +2] =  Number(rgbValue[2])/255;
}
geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colorArray, 3 ) );
var material = new THREE.MeshBasicMaterial( {vertexColors: THREE.VertexColors} );
var cube = new THREE.Mesh( geometry, material );
console.log(cube)
space.scene.add( cube );

// @ts-ignore
window.debugSpace=space;
