// @ts-ignore
import Stats from "./stats.js"; //can not import Stats from "THREE/examples/js/libs/stats.min.js"
import Space from "./Space.js";

class Inspector{
  stats:StatsInterface;
  animateAction:Function;
  raycasterEvent:any;
  space:Space;
  constructor(space:Space){
    this.space = space;
    const stats = this.stats = new Stats();
    space.element.appendChild(stats.dom);
    this.animateAction = this._animateAction()

    this.raycasterEvent={
      click:(intersects:any[])=>{
        if(intersects.length === 0){
          return ;
        }
        console.log(intersects[0].object,intersects);
        space.setOutline([intersects[0].object])
        
      }
    };
    return this;
  }

  private _animateAction():Function{
    const stats = this.stats;
    return ()=>{
      stats.update();
    }
  }



}

export default Inspector;