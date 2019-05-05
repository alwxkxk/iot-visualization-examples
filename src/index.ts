import Space from "./common/Space";

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

var geometry2 = new THREE.Geometry();

geometry2.vertices.push(
  curve.getPoint(0),
  curve.getPoint(0.2),
  curve.getPoint(0.5),
  curve.getPoint(0.7),
  curve.getPoint(1)
);
var pointsObject=new THREE.Points(geometry2)
space.scene.add(pointsObject);

console.log(points);


// @ts-ignore
window.debugSpace=space;

