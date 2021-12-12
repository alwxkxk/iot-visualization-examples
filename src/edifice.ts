import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./common/global_setting";
import Space from "./common/Space";
import { Scene, Vector3 } from "three";
import Curve from "./common/base/Curve";
import * as Selection from "d3-selection";

import "./edifice.css"
import StripeBar from "./common/components/StripeBar";
import Controller from "./common/Controller";
import { throttle } from "lodash-es";

// Import the echarts core module, which provides the necessary interfaces for using echarts.
import * as echarts from 'echarts/core';
// Import bar charts, all suffixed with Chart
import { BarChart } from 'echarts/charts';
// Import the tooltip, title, rectangular coordinate system, dataset and transform components
// all suffixed with Component
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent
} from 'echarts/components';
// Features like Universal Transition and Label Layout
import { LabelLayout, UniversalTransition } from 'echarts/features';
// Import the Canvas renderer
// Note that introducing the CanvasRenderer or SVGRenderer is a required step
import { CanvasRenderer } from 'echarts/renderers';

// Register the required components
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  BarChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
]);

const element = $("#3d-space")[0];
const space = new Space(element, {
  orbit:true,
  outline:true
});

// @ts-ignore
window.debugSpace =space;
const THREE = window.THREE;

// mousemove popover
function mousemoveHandle(intersections:any[]) {
  if(!intersections.length ){
    $("#popover-test").css("display","none");
    return ;
  }
  const object = intersections[0].object;
  const controller:Controller = object.$controller || object.parent.$controller
  const event = space.mouse.mousemoveEvent;

  if(!controller.userData.popover){
    $("#popover-test").css("display","none");
    return ;
  }
  // const offset = controller.getViewOffset({x:0});
  space.setOutline([object]);
  $("#popover-test").css("display","block");
  $("#popover-test").css("top",event.clientY+10)
  $("#popover-test").css("left",event.clientX+10)
  $("#popover-test").text(controller.userData.popover);
  console.log("mousemove",intersections)
}
space.setRaycasterEventMap({
  mousemove:throttle(mousemoveHandle,100) 
})


// add icon list 
const p = $($("#3d-space")[0].parentElement);
const f4IconList = $('<div></div>')
.attr("id","f4-icon-list")
.css("position","absolute")
.css("display","flex");

const f8IconList = $('<div></div>')
.attr("id","f8-icon-list")
.css("position","absolute")
.css("display","flex");

const f12IconList = $('<div></div>')
.attr("id","f12-icon-list")
.css("position","absolute")
.css("display","flex");

f4IconList.appendTo(p);
f8IconList.appendTo(p);
f12IconList.appendTo(p);

// F4 icon : warn 
$('<img></img>')
.appendTo(f4IconList)
.attr("src","./static/images/warn.svg")
.attr("data-toggle","popover")
.attr("data-trigger","hover")
.attr("title","warn")
.attr("data-content","Device exception.")
.addClass("icon-3d")
.addClass("twinkle");

// F8 icon : danger smoke  
$('<img></img>')
.appendTo(f8IconList)
.attr("src","./static/images/danger.svg")
.attr("data-toggle","popover")
.attr("data-trigger","hover")
.attr("title","danger")
.attr("data-content","Check for fire immediately!")
.addClass("icon-3d")
.addClass("twinkle");

$('<img></img>')
.appendTo(f8IconList)
.attr("src","./static/images/smoking.svg")
.attr("data-toggle","popover")
.attr("data-trigger","hover")
.attr("title","smoking")
.attr("data-content","Check for smoking!")
.addClass("icon-3d");

// F12 icon : water power
$('<img></img>')
.appendTo(f12IconList)
.attr("src","./static/images/water.svg")
.attr("data-toggle","popover")
.attr("data-trigger","hover")
.attr("title","water")
.attr("data-content","Excessive water consumption.")
.addClass("icon-3d");

$('<img></img>')
.appendTo(f12IconList)
.attr("src","./static/images/repair.svg")
.attr("data-toggle","popover")
.attr("data-trigger","hover")
.attr("title","repair")
.attr("data-content","Waiting for repair.")
.addClass("icon-3d");

$(".icon-3d").on("click",()=>{
  $('#exampleModal').modal('show');
})

function updateIconListPosition() {
  const f4Position =  space.getControllerById("F4").getViewOffset({x:0.2});
  const f8Position =  space.getControllerById("F8").getViewOffset({x:0.2});
  const f12Position = space.getControllerById("F12").getViewOffset({x:0.2});

  f4IconList
  .css("top",f4Position.y)
  .css("left",f4Position.x);

  f8IconList
  .css("top",f8Position.y)
  .css("left",f8Position.x);

  f12IconList
  .css("top",f12Position.y)
  .css("left",f12Position.x);
}

// load 3d model.
space.load("./static/3d/edifice-0624.glb")
// space.load("./static/3d/change-model-test.glb")
.then(()=>{
  setInterval(updateIconListPosition,100);
  $('[data-toggle="popover"]').popover();
})
.catch((err)=>{
  console.error(err);
})

$.when($.ready).then(()=>{
  new StripeBar($("#stripe-bar1")[0], 30);
  new StripeBar($("#stripe-bar2")[0], 85,{twinkle:true});
  new StripeBar($("#stripe-bar3")[0], 100,{twinkle:true});

  $('[data-toggle="tooltip"]').tooltip()
})
.catch((err)=>{
  console.error(err);
})



const option1 = {
  backgroundColor:'rgba(255,255,255,0)',
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      data: [120, 200, 150, 80, 70, 110, 130],
      type: 'bar'
    }
  ]
};
const chart1 = echarts.init(document.getElementById('chart1'),'dark');
chart1.setOption(option1);


