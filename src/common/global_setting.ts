import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import * as $ from "jquery";
import "popper.js";
import * as THREE from "three";

import { Group, Mesh, Object3D } from "three";
import Controller from "./Controller";

// ts type global declare
declare global {
  type ICallback = ( error: Error, result?: number )  => void;

  interface IWindow extends Window {
    $: any;
    jquery: any;
    THREE: any;
    selectedThing: Objects; // for Inspector debug select thing.
    debugSpace: any; // for debug.
  }

  interface IController {
    $controller: Controller;
  }
  interface IObject3d extends Object3D, IController {}

  interface IMesh extends Mesh, IController {}

  interface IGroup extends Group, IController {}

  type Objects = IMesh | IObject3d | IGroup;
}

( window as IWindow).$ = ( window as IWindow).jquery = $;
( window as IWindow).THREE = THREE;
