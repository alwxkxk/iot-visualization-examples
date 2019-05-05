import Space from "./common/Space";
import { Scene } from "three";

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
var curve = new THREE.QuadraticBezierCurve3(
	new THREE.Vector3( -10, 0, 0 ),
	new THREE.Vector3( 20, 15, 0 ),
	new THREE.Vector3( 10, 0, 0 )
);

var points = curve.getPoints( 50 );
var geometry = new THREE.BufferGeometry().setFromPoints( points );

var material = new THREE.LineBasicMaterial( { color : 0xff0000 } );

// Create the final object to add to the scene
var curveObject = new THREE.Line( geometry, material );
space.scene.add(curveObject);

var geometry = new THREE.SphereGeometry( 1, 32, 32 );
var material = new THREE.LineBasicMaterial({ color: 0xffffff });
var sphere = new THREE.Mesh( geometry, material );
space.scene.add(sphere);


var geometry2 = new THREE.Geometry();

geometry2.vertices.push(
  curve.getPoint(0),
  curve.getPoint(0.2),
  curve.getPoint(0.5),
  curve.getPoint(0.7),
  curve.getPoint(1)
);
var pointsObject=new THREE.Points(geometry2,new THREE.PointsMaterial( { color: 0xffffff } ))
pointsObject.material.size=10
space.scene.add(pointsObject);



let interpolate = 0;
let interpolatesAdd=0.02;
var color1 = new THREE.Color( 0xff0000 );
var color2 = new THREE.Color( 0xffffff );

space.addAnimateAction("test",()=>{
  if(interpolate <= 0){
    interpolatesAdd = 0.02;
  }
  else if(interpolate >=1){
    interpolatesAdd = -0.02;
  }
  interpolate+=interpolatesAdd;
  let color = color1.clone()
  pointsObject.material.color = color.lerp(color2,interpolate);

})

// console.log(points);


// @ts-ignore
window.debugSpace=space;

