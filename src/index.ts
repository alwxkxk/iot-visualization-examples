import Space from "./common/Space";
import { Scene } from "three";
import Curve from "./common/components/Curve";

const THREE = (<windowEx>window).THREE;
const element = $("#3d-space")[0];
const space = new Space(element,{
  inspector:true,
  orbit:true
});

// space.load("./static/3d/simple_scene.glb")
// .then(()=>{
//   space.autoRotate(true);

// })

space.createEmptyScene();
// var curve = new THREE.QuadraticBezierCurve3(
// 	new THREE.Vector3( -10, 0, 0 ),
// 	new THREE.Vector3( 20, 15, 0 ),
// 	new THREE.Vector3( 10, 0, 0 )
// );


// var points = curve.getPoints( 100 );
// var geometry = new THREE.TubeGeometry(curve,64,0.03);

// var material = new THREE.MeshBasicMaterial({ color :0xC71585} );

// // Create the final object to add to the scene
// var curveObject = new THREE.Mesh( geometry, material );
let a = new Curve(new THREE.Vector3( 0, 0, 0 ),new THREE.Vector3( 10, 0, 0 ));
let curveObject = a.object3d
space.scene.add(curveObject);

var geometry2 = new THREE.SphereGeometry( 0.08, 12, 12 );
var material2 = new THREE.LineBasicMaterial({ color: 0xffffff});
var sphere = new THREE.Mesh( geometry2, material2 );
// sphere.position.copy(points[0]);
console.log(sphere);
space.scene.add(sphere);
space.setOutline([curveObject,sphere])



let interpolate = 0;
let interpolatesAdd=0.02;
let i = 0;
var color1 = new THREE.Color( 0x10EBF4 );
var color2 = new THREE.Color( 0xffffff );

space.addAnimateAction("test",()=>{
  // if(interpolate <= 0){
  //   interpolatesAdd = 0.02;
  // }
  // else if(interpolate >=1){
  //   interpolatesAdd = -0.02;
  // }

  if(i>=100){
    i=0;
  }

  // interpolate+=interpolatesAdd;
  // sphere.position.copy(points[i++]);
  // let color = color1.clone()
  // sphere.material.color = color.lerp(color2,interpolate);

})

// console.log(points);


// @ts-ignore
window.debugSpace=space;

