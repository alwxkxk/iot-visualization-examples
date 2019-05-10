import * as $ from "jquery";
import * as THREE from "three";
import 'popper.js';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import { Object3D, Mesh, Group } from "three";
import Controller from "./Controller";

// PWA
// if('serviceWorker' in navigator) {
// 	navigator.serviceWorker.register('/sw.js');
// }

// ts type global declare
declare global {
  interface ICallback {
    ( error: Error, result?: number ) : void;
  }

  interface windowEx extends Window{
    $: any;
    jquery:any;
    THREE:any;
    selectedThing:Objects;// for Inspector debug select thing.
  }

  interface $controller{
    $controller:Controller;
  }
  interface Object3dEx extends Object3D, $controller{}

  interface MeshEx extends Mesh, $controller{}

  interface GroupEx extends Group, $controller{}

  type Objects = MeshEx | Object3dEx | GroupEx;
}

(< windowEx>window).$ = (< windowEx>window).jquery = $;
(< windowEx>window).THREE = THREE;
