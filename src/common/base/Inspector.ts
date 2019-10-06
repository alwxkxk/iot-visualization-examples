import * as dat from "dat.gui";
import * as THREE from "three";
import Space from "../Space.js";
// @ts-ignore
import Stats from "./Stats.js"; // can not import Stats from "THREE/examples/js/libs/stats.min.js"

// https://github.com/mrdoob/stats.js/blob/master/src/Stats.js
interface IStatsInterface {
  dom: Element;
  new(): any;
  update(): any;
}

class Inspector {
  public animateAction: Function;
  public gui: any;
  public raycasterEvent: any;
  public space: Space;
  // public stats: IStatsInterface;
  constructor(space: Space) {
    this .space = space;
    // this .gui = new dat.GUI();
    // this .animateAction = this ._animateAction();

    // this .raycasterEvent = {
    //   click: (intersects: any[]) => {
    //     if (intersects.length === 0) {
    //       return ;
    //     }
    //     const obj = intersects[0].object;
    //     ( window as IWindow).selectedThing = obj;
    //     console.log(obj, space.getViewOffset(obj), intersects);
    //     space.setOutline([obj]);

    //   },
    // };
    return this ;
  }

  public axesHelp(len: number) {
    // The X axis is red. The Y axis is green. The Z axis is blue.
    this.space.scene.add( new THREE.AxesHelper( len || 20 ) );
  }

  public stats() {
    const stats = this .stats = new Stats();
    this.space.element.appendChild(stats.dom);
  }

  // private _animateAction(): Function {
  //   const stats = this .stats;
  //   return () => {
  //     stats.update();
  //   };
  // }



}

export default Inspector;
