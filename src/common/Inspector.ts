// @ts-ignore
import Stats from "./stats.js"; //can not import Stats from "THREE/examples/js/libs/stats.min.js"

class Inspector{
  stats:StatsInterface;
  constructor(element:Element){
    const stats = this.stats = new Stats();
    element.appendChild(stats.dom);
  }

  animateAction(){
    this.stats.update();
  }
}

export default Inspector;