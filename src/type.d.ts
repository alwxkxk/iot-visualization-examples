import * as THREE from "three";
import Controller from "./common/Controller";

interface ISpaceOptions {
  renderer?: any;
  orbit?: boolean;
  outline?: boolean; // true: initOutline
}

interface ILocation {
  x?: number;
  y?: number;
  z?: number;
  rx?: number;
  ry?: number;
  rz?: number;
  ef?: string; // ease function
  t?: number; // duration time
}

interface IPoint {
  x: number;
  y: number;
  value: number;
}

interface ICurveOptions {
  line?: boolean; // true: make curve become straight line
  controlPoint?: THREE.Vector3; // undefined: auto calculate controlPoint
  pointModel?: boolean; // true: show points instead of line.
  pointSize?: number;// point size
}

type ICallback = ( error: Error, result?: number )  => void;

interface IController {
  $controller: Controller;
}

interface IObject3d extends THREE.Object3D, IController {}

interface IMesh extends THREE.Mesh, IController {}

interface IGroup extends THREE.Group, IController {}

type Objects = IMesh | IObject3d | IGroup;

// ts type global declare
declare global {
  interface Window {
    $: any;
    jquery: any;
    THREE: any;
    selectedThing: Objects; // for Inspector debug select thing.
    debugSpace: any; // for debug.
  }
}