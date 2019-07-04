import * as dat from "dat.gui";
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
  public stats: IStatsInterface;
  constructor(space: Space) {
    this .space = space;
    this .gui = new dat.GUI();
    const stats = this .stats = new Stats();
    space.element.appendChild(stats.dom);
    this .animateAction = this ._animateAction();

    this .raycasterEvent = {
      click: (intersects: any[]) => {
        if (intersects.length === 0) {
          return ;
        }
        const obj = intersects[0].object;
        ( window as IWindow).selectedThing = obj;
        console.log(obj, space.getViewOffset(obj), intersects);
        space.setOutline([obj]);

      },
    };
    return this ;
  }

  private _animateAction(): Function {
    const stats = this .stats;
    return () => {
      stats.update();
    };
  }

}

export default Inspector;
