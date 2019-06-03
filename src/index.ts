import Space from "./common/Space";
import { Scene, Vector3 } from "three";
import Curve from "./common/base/Curve";
import * as Selection from "d3-selection";
import * as G2 from '@antv/g2';

import "./index.css"
import StripeBar from "./common/components/StripeBar";

const element = $("#3d-space")[0];
const space = new Space(element, {
  orbit:true
});

space.load("./static/3d/scene0525.glb")
.then(()=>{
  space.initBloom();
})

$.when($.ready).then(()=>{
  new StripeBar($("#stripe-bar1")[0], 30);
  new StripeBar($("#stripe-bar2")[0], 85,{twinkle:true});
  new StripeBar($("#stripe-bar3")[0], 100,{twinkle:true});
})
.catch((err)=>{
  console.error(err);
})


var data = [{
  time: '03-19',
  type: '+Other',
  value: 320
}, {
  time: '03-19',
  type: '+Repair',
  value: 300
}, {
  time: '03-19',
  type: '+Water',
  value: 270
}, {
  time: '03-19',
  type: 'Power',
  value: 240
}, {
  time: '03-20',
  type: '+Other',
  value: 350
}, {
  time: '03-20',
  type: '+Repair',
  value: 320
}, {
  time: '03-20',
  type: '+Water',
  value: 300
}, {
  time: '03-20',
  type: 'Power',
  value: 270
}, {
  time: '03-21',
  type: '+Other',
  value: 390
}, {
  time: '03-21',
  type: '+Repair',
  value: 370
}, {
  time: '03-21',
  type: '+Water',
  value: 340
}, {
  time: '03-21',
  type: 'Power',
  value: 300
}, {
  time: '03-22',
  type: '+Other',
  value: 440
}, {
  time: '03-22',
  type: '+Repair',
  value: 420
}, {
  time: '03-22',
  type: '+Water',
  value: 380
}, {
  time: '03-22',
  type: 'Power',
  value: 340
}];

const chart = new G2.Chart({
  container: 'c1',
  forceFit: true,
  padding:[40,20,80,50]
});

chart.axis('time', {
  label: {
    textStyle: {
      fill: '#cccccc'
    }
  }
});
chart.axis('value', {
  label: {
    textStyle: {
      fill: '#cccccc'
    }
  }
});

chart.source(data);
chart.interval().position('time*value').color('type', ['#40a9ff', '#1890ff', '#096dd9', '#0050b3']).opacity(1);
chart.render();
