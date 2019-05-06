import { Vector3, Color } from "three";

const THREE = (<windowEx>window).THREE;

interface curveOptions{
  controlPoint?:Vector3;
  color?:any;
}

class Curve{
  startPoint:Vector3;
  color:any;
  controlPoint:Vector3;
  endPoint:Vector3;
  object3d:MeshEx;
  points:Vector3[];

  constructor(startPoint:Vector3,endPoint:Vector3,options?:curveOptions){
    const opt = options || {};
    this.startPoint = startPoint;
    this.endPoint = endPoint;
    this.controlPoint = opt.controlPoint || this.calculateControlPoint();
    this.color = opt.color || 0xC71585;
    this.init();
    // console.log(this.controlPoint);
  }

  calculateControlPoint():Vector3{
    const result = new THREE.Vector3(0,0,0);
    result.addVectors(this.startPoint,this.endPoint);
    result.multiplyScalar(0.9);
    if(result.z === 0){
      result.z = this.endPoint.distanceTo(this.startPoint)
    }
    return result;
  }

  init():Curve{
    const curve = new THREE.QuadraticBezierCurve3(
      this.startPoint,
      this.controlPoint,
      this.endPoint
    );
    const geometry = new THREE.TubeGeometry(curve,64,0.03);
    const material = new THREE.MeshBasicMaterial({ color :this.color} );
    const curveObject = new THREE.Mesh( geometry, material );
    this.points = curve.getPoints( 60 );
    this.object3d = curveObject;
    return this;
  }

}

export default Curve;