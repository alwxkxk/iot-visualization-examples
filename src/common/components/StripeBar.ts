import * as Selection from "d3-selection";
import * as Interpolators from "d3-interpolate";
import * as Transition from "d3-transition";
import * as uuid from "uuid";
import {colorRGBA} from "./common";
import "./common.css"

interface Ioptions{
  twinkle?: boolean; // true: set the last twinkle
}

class StripeBar {
  readonly element:Element;
  id:string;
  containerSelection:any;
  svgSelection:any;
  options:any;
  parentClientWidth:number;
  constructor(element:Element,value?:number, options?:Ioptions) {
    // if(element.clientWidth === 0 || element.clientHeight === 0){
    //   console.error("element should had width and height before init.");
    // }
    this .element = element;
    this .id ="stripe-bar"+uuid();
    this .options = options || {};
    this .init();
    this .setValue(value || 10);
  }

  init(){
    this .parentClientWidth = this .element.parentElement.clientWidth
    this .containerSelection = Selection.select(this .element)
    // .append("div")
    // .attr("id", this .id)
    // .style("position", "relavite");
  }

  setValue(value:number){
    let v;
    const parentElement = Selection.select(this .element.parentElement)
    
    if(value < 0 || value > 100){
      console.warn("value should between 0 ~ 100.",value);
      v = 10; 
    }
    

    // remove old svg element in container
    if(this .svgSelection){
      this .svgSelection.remove();
    }

    // resize parent element width.
    parentElement.style("width",`${value * this.parentClientWidth/100}px`)



    this .containerSelection
    .style("height", "100%")
    .style("width", "100%");

    this .svgSelection = this .containerSelection
    .append("svg")
    .attr("viewBox", "0 0 100% 10%")
    .style("height","100%")
    .style("width","100%");


    const svgSelection = this .svgSelection;
    // 100% -- 40 stripes -- 100/40 = 2.5 interval
    // 20% -- 8 stripes -- 100/8 = 12.5 interval
    // value% -- (value*2/5) stripes --  (250/value) interval
    const fullStripes = 40;
    const stripes = value * 2 / 5 ;
    const interval = 250 / value;
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
    
    let lastRect:any ;
    for(let i = 0;i<stripes;i++){
      const v = i*interval;
      lastRect = svgSelection
      .append("rect")
      .attr("x", `${v}%`)
      .attr("width", `${width}%`)
      .attr("height", "100%")
      .attr("fill", getColor(i*100/fullStripes));
    }

    if(lastRect && this .options.twinkle){
      lastRect.attr("class","twinkle");
    }

  }
}

export default StripeBar;