import * as $ from "jquery";
import * as THREE from "three";
import 'popper.js';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import { Object3D, Mesh, Group } from "three";
import Controller from "./Controller";

// ts type global declare
declare global {
  interface ICallback {
    ( error: Error, result?: number ) : void;
  }

  interface IWindow extends Window{
    $: any;
    jquery:any;
    THREE:any;
    selectedThing:Objects;// for Inspector debug select thing.
    debugSpace:any; // for debug.
  }

  interface IController{
    $controller:Controller;
  }
  interface IObject3d extends Object3D, IController{}

  interface IMesh extends Mesh, IController{}

  interface IGroup extends Group, IController{}

  type Objects = IMesh | IObject3d | IGroup;
}

(< IWindow>window).$ = (< IWindow>window).jquery = $;
(< IWindow>window).THREE = THREE;
