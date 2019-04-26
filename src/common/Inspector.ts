// @ts-ignore
import Stats from "./stats.js"; //can not import Stats from "THREE/examples/js/libs/stats.min.js"

class Inspector{
  stats:StatsInterface;
  animateAction:Function;
  raycasterEvent:any;
  constructor(element:Element){
    const stats = this.stats = new Stats();
    element.appendChild(stats.dom);
    this.animateAction = this._animateAction()

    this.raycasterEvent={
      click:(intersects:any[])=>{
        if(intersects.length === 0){
          return ;
        }
        console.log(intersects[0].object,intersects)
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