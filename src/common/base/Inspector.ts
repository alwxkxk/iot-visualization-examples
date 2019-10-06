// import * as dat from "dat.gui";
import * as THREE from "three";
import Space from "../Space";
import Events from "./Events";
// @ts-ignore
import Stats from "./Stats"; // can not import Stats from "THREE/examples/js/libs/stats.min.js"

// https://github.com/mrdoob/stats.js/blob/master/src/Stats.js
interface IStatsInterface {
  dom: Element;
  new(): any;
  update(): any;
}

class Inspector {
  // public animateAction: Function;
  public gui: any;
  public raycasterEvent: any;
  public space: Space;
  public stats: any;
  public statsAnimate: () => void;
  // public stats: IStatsInterface;
  constructor(space: Space) {
    this .space = space;
    // this .gui = new dat.GUI();
    return this ;
  }

  public showAxesHelp(len: number) {
    // The X axis is red. The Y axis is green. The Z axis is blue.
    this.space.scene.add( new THREE.AxesHelper( len || 20 ) );
  }

  public showStats() {
    this .stats = new Stats();
    this.space.element.appendChild(this.stats.dom);

    this.statsAnimate = function statsAnimate() {
      this.stats.update();
    };

    this.space.on(Events.animate, this.statsAnimate);
  }

}

export default Inspector;
