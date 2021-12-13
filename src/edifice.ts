import "./common/global_setting";
import {
  Modal,
  Tooltip
} from 'bootstrap';
import Space from "./common/Space";

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

const element = document.getElementById('3d-space');
const space = new Space(element, {
  orbit:true,
  outline:true
});

// @ts-ignore
window.debugSpace =space;
const THREE = window.THREE;

const popoverTestEle = document.getElementById('popover-test');
// mousemove popover
function mousemoveHandle(intersections:any[]) {
  if(!intersections.length ){
    popoverTestEle.classList.add('hidden')
    
    return ;
  }
  const object = intersections[0].object;
  const controller:Controller = object.$controller || object.parent.$controller
  const event = space.mouse.mousemoveEvent;

  if(!controller.userData.popover){
    popoverTestEle.classList.add('hidden')
    return ;
  }
  // const offset = controller.getViewOffset({x:0});
  space.setOutline([object]);
  popoverTestEle.classList.remove('hidden')
  popoverTestEle.style.top = `${event.clientY+10}px`
  popoverTestEle.style.left = `${event.clientX+10}px`
  popoverTestEle.innerText = controller.userData.popover
  console.log("mousemove",intersections)
}
space.setRaycasterEventMap({
  mousemove:throttle(mousemoveHandle,100) 
})


// add icon list 
const p = element.parentElement
const f4IconList = document.createElement('div')
const f8IconList = document.createElement('div')
const f12IconList = document.createElement('div')
p.appendChild(f4IconList)
p.appendChild(f8IconList)
p.appendChild(f12IconList)

f4IconList.id = 'f4-icon-list'
f8IconList.id = 'f8-icon-list'
f12IconList.id = 'f12-icon-list'

f4IconList.classList.add('absolute','flex')
f8IconList.classList.add('absolute','flex')
f12IconList.classList.add('absolute','flex')

const warnIconEle = document.createElement('img')
warnIconEle.setAttribute('src','./static/images/warn.svg')
warnIconEle.setAttribute('data-toggle','popover')
warnIconEle.setAttribute('data-trigger','hover')
warnIconEle.setAttribute('title','warn')
warnIconEle.setAttribute('data-content','Device exception.')
warnIconEle.classList.add('icon-3d','twinkle')
f4IconList.appendChild(warnIconEle)

const dangerIconEle = document.createElement('img')
dangerIconEle.setAttribute('src','./static/images/danger.svg')
dangerIconEle.setAttribute('data-toggle','popover')
dangerIconEle.setAttribute('data-trigger','hover')
dangerIconEle.setAttribute('title','danger')
dangerIconEle.setAttribute('data-content','Check for fire immediately!')
dangerIconEle.classList.add('icon-3d','twinkle')
f8IconList.appendChild(dangerIconEle)

const smokeIconEle = document.createElement('img')
smokeIconEle.setAttribute('src','./static/images/smoking.svg')
smokeIconEle.setAttribute('data-toggle','popover')
smokeIconEle.setAttribute('data-trigger','hover')
smokeIconEle.setAttribute('title','danger')
smokeIconEle.setAttribute('data-content','Check for smoking!')
smokeIconEle.classList.add('icon-3d','twinkle')
f8IconList.appendChild(smokeIconEle)

const waterIconEle = document.createElement('img')
waterIconEle.setAttribute('src','./static/images/water.svg')
waterIconEle.setAttribute('data-toggle','popover')
waterIconEle.setAttribute('data-trigger','hover')
waterIconEle.setAttribute('title','danger')
waterIconEle.setAttribute('data-content','Excessive water consumption.')
waterIconEle.classList.add('icon-3d','twinkle')
f12IconList.appendChild(waterIconEle)

const repairIconEle = document.createElement('img')
repairIconEle.setAttribute('src','./static/images/repair.svg')
repairIconEle.setAttribute('data-toggle','popover')
repairIconEle.setAttribute('data-trigger','hover')
repairIconEle.setAttribute('title','danger')
repairIconEle.setAttribute('data-content','Excessive water consumption.')
repairIconEle.classList.add('icon-3d','twinkle')
f12IconList.appendChild(repairIconEle)



function updateIconListPosition() {
  const f4Position =  space.getControllerById("F4").getViewOffset({x:0.2});
  const f8Position =  space.getControllerById("F8").getViewOffset({x:0.2});
  const f12Position = space.getControllerById("F12").getViewOffset({x:0.2});

  f4IconList.style.top = `${f4Position.y}px`
  f4IconList.style.left = `${f4Position.x}px`

  f8IconList.style.top = `${f8Position.y}px`
  f8IconList.style.left = `${f8Position.x}px`

  f12IconList.style.top = `${f12Position.y}px`
  f12IconList.style.left = `${f12Position.x}px`

}

// load 3d model.
space.load("./static/3d/edifice-0624.glb")
// space.load("./static/3d/change-model-test.glb")
.then(()=>{
  setInterval(updateIconListPosition,100);
})
.catch((err)=>{
  console.error(err);
})

new StripeBar(document.getElementById('stripe-bar1'), 30);
new StripeBar(document.getElementById('stripe-bar2'), 85,{twinkle:true});
new StripeBar(document.getElementById('stripe-bar3'), 100,{twinkle:true});



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


// enable modal
const myModal = new Modal(document.getElementById('exampleModal'))
Array.from(document.getElementsByClassName('icon-3d')).forEach(ele=>{
  ele.addEventListener('click',()=>{
    myModal.toggle()
  })
})

Array.from(document.getElementsByClassName('modal-close')).forEach(element => {
  element.addEventListener('click', () => {
    myModal.hide()
  })
});

// enable tooltips
const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl:Element) {
  return new Tooltip(tooltipTriggerEl)
})


