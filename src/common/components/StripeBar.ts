import * as Selection from "d3-selection";
import * as Interpolators from "d3-interpolate";
import * as Transition from "d3-transition";
import * as uuid from "uuid";
import {colorRGBA} from "./common";

class StripeBar {
  readonly element:Element;
  id:string;
  containerSelection:any;
  svgSelection:any;
  constructor(element:Element,value?:number) {
    if(element.clientWidth === 0 || element.clientHeight === 0){
      console.error("element should had width and height before init.");
    }
    this .element = element;
    this .id = "stripe-bar"+uuid();
    this .init();
    this .setValue(value || 10);
  }

  init(){
    this .containerSelection = Selection.select(this .element)
    .append("div")
    .attr("id", this .id)
    .style("position", "relavite");
  }

  setValue(value:number){
    let v;
    if(value < 0 || value > 100){
      console.warn("value should between 0 ~ 100.",value);
      v = 10; 
    }
    // remove old svg element in container
    if(this .svgSelection){
      this .svgSelection.remove();
    }

    this .containerSelection
    .style("height", "100%")
    .style("width", `${value}%`);

    this .svgSelection = this .containerSelection
    .append("svg")
    .attr("viewBox", "0 0 100% 10%")
    .style("height","100%")
    .style("width","100%");


    const svgSelection = this .svgSelection;
    // 100% -- 40 stripe
    // 2.5% -- 1 stripe
    const interval = 2.5
    const total = value / interval;
    const width = interval * 3 / 5;
    function getColor(value:number):String{
      if(value<50){
        return colorRGBA.safe;
      }
      else if(value < 70){
        return colorRGBA.much;
      }
      else if(value < 85){
        return colorRGBA.over;
      }
      else{
        return colorRGBA.dangerous;
      }
    }

    for(let i = 0;i<total;i++){
      const v = i*interval;
      svgSelection
      .append("rect")
      .attr("x", `${v}%`)
      .attr("width", `${width}%`)
      .attr("height", "100%")
      .attr("fill", getColor(v));
    }

    // svgSelection
    // .append("rect")
    // .attr("width", `${value}%`)
    // .attr("height", "100%")
    // .attr("fill", "rgba(20,200,20)");

  }
}

export default StripeBar;