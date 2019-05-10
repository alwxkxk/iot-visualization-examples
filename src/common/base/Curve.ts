import { Vector3, CubicBezierCurve3 } from "three";
import "d3-transition";
import * as Selection from "d3-selection";
import Space from "../Space";

const THREE = (< windowEx>window).THREE;

interface curveOptions{
  controlPoint?:Vector3;
  color?:any;
}

class Curve{
  startPoint:Vector3;
  color:any;
  controlPoint:Vector3;
  curve:CubicBezierCurve3;
  endPoint:Vector3;
  object3d:MeshEx;
  points:Vector3[];
  space:Space;

  constructor(space:Space, startPoint:Vector3, endPoint:Vector3, options?:curveOptions){
    const opt = options || {};
    this .startPoint = startPoint;
    this .endPoint = endPoint;
    this .controlPoint = opt.controlPoint || this .calculateControlPoint();
    this .color = opt.color || 0xC71585;
    this .space = space;
    this .init();
    // console.log(this.controlPoint);
  }

  calculateControlPoint():Vector3{
    const result = new THREE.Vector3(0, 0, 0);
    result.addVectors(this .startPoint, this .endPoint);
    result.multiplyScalar(0.9);
    result.y = this .endPoint.distanceTo(this .startPoint);
    return result;
  }

  init():Curve{
    const curve = this .curve = new THREE.QuadraticBezierCurve3(
      this .startPoint,
      this .controlPoint,
      this .endPoint
    );
    const geometry = new THREE.TubeGeometry(curve, 64, 0.03);
    const material = new THREE.MeshBasicMaterial({ color :this .color} );
    const curveObject = new THREE.Mesh( geometry, material );
    this .points = curve.getPoints( 60 );
    this .object3d = curveObject;
    this .initOutline();
    return this ;
  }

  initOutline(){
    const space = this .space;
    if(!space.outlinePassMap.has('curve')){
      space.setOutlinePass('curve', {
        edgeStrength:5,
        edgeGlow:1,
        pulsePeriod: 2,
        visibleEdgeColor:0xffffff,
        hiddenEdgeColor:0xffffff
      });
    }
    let outlineArray = space.getOutlineArray('curve');
    outlineArray.push(this .object3d)
  }

  getPoint(t:number){
    // t : [0-1]
    if(t>1 || t< 0){
      console.error("t should between 0 and 1.But t is ", t);
      return null;
    }
    let num = Number((t*60).toFixed(0));
    return this .points[num];
  }

  addPointEasing(){
    const scope = this ;
    // select a empty object to avoid running multiple transitions concurrently on the same elements
    // @ts-ignore
    Selection.select({}).transition().duration(1500).tween("point-easing", ()=>{
      const geo = new THREE.SphereGeometry( 0.08, 12, 12 );
      const mat = new THREE.LineBasicMaterial({ color: 0xffffff});
      const sphere = new THREE.Mesh( geo, mat );
      this .space.scene.add(sphere);

      return (t:any)=>{
        let position = scope.getPoint(t);
        sphere.position.copy(position);
        if(t >= 1){
          scope.space.scene.remove(sphere);
        }
      }
    })
  }

}

export default Curve;
