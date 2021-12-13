import "./common/global_setting";

import {
  Modal,
  Tooltip
} from 'bootstrap';


import {
  updateChart1,
  updateChart2,
  updateChart3
} from './index-chart'

import Controller from "./common/Controller";
import Space from "./common/Space";

import { IObject3d } from "./type";

const THREE = window.THREE
const openDoorLocation = {
  ry: 120,
};
const popServerLocation = {
  t: 700,
  x: 0.35,
};

const moveOutlineKey = "move";
const lockServerOutlineKey = "lockServer";

const element = document.getElementById('3d-space')
const space = new Space(element, {
  orbit: true,
  outline: true,
});

// for orbit reset
let main: Controller;

// for reset action
let racks: Controller[];
let servers: Controller[];

//  for lock outline
let lockRack: Controller;
let lockServer: Controller;

// @ts-ignore
window.debugSpace = space;
let capacityFlag = false;
let temperatureFlag = false;
let oldRaycasterObjects: IObject3d[];

const leftArrowButtonEle = document.getElementById('left-arrow-button')

const updatePopoverContent = (() => {
  let oldName: string;
  const popoverEle = document.getElementById('popover-content')
  const popoverTextEle = document.getElementById('popover-text')
  return (name: string) => {
    const event = space.mouse.mousemoveEvent;
    if (name) {
      popoverEle.classList.remove('hidden')
      popoverEle.style.top = `${event.clientY + 10}px`
      popoverEle.style.left = `${event.clientX + 10}px`
      if (popoverTextEle.innerText !== name) {
        popoverTextEle.innerText = name
      }
    } else {
      popoverEle.classList.add('hidden')
    }

    if (oldName !== name) {
      updateChart1();
      oldName = name;
    }

  };
})();

const updateRightInfo = (() => {
  let oldRack: Controller;
  let oldServer: Controller;
  const rackCardEle = document.getElementById('rackCard')
  const rackNameEle = document.getElementById('rackName')
  const serverCardEle = document.getElementById('serverCard')
  const serverNameEle = document.getElementById('serverName')
  return (rack: Controller, server?: Controller) => {
    if (rack) {
      rackCardEle.classList.remove('hidden')
      rackNameEle.innerText = rack.name
      if (rack !== oldRack) {
        updateChart2();
        oldRack = rack;
      }
    } else {
      rackCardEle.classList.add('hidden')
    }

    if (server) {
      serverCardEle.classList.remove('hidden')
      serverNameEle.innerText = server.name
      if (server !== oldServer) {
        updateChart3();
        oldServer = server;
      }
    } else {
      serverCardEle.classList.add('hidden')
    }
  };

})();

function clickServer(results: any[]) {
  if (results.length > 0) {
    const server = results[0].object.$controller.raycasterRedirect;
    lockServer = server;
    // reset other
    servers.forEach((c) => {
      c.resetAction();
    });
    server.executeAction("popServer", popServerLocation);
    console.log("clickServer", server.name);
    space.setOutline([lockServer.showingObject3d], lockServerOutlineKey);
    updateRightInfo(lockRack, server);
  }
}

function mousemoveServer(results: any[]) {
  if (results.length > 0) {
    const server = results[0].object.$controller.raycasterRedirect;
    updatePopoverContent(server.name);
    if (server !== lockServer) {
      space.setOutline([server.showingObject3d], moveOutlineKey);
    }
  } else {
    updatePopoverContent(null);
    space.setOutline([], moveOutlineKey);
  }
}

function showServerModel(rack: Controller) {
  console.log("showServerModel");

  leftArrowButtonEle.classList.remove('hidden')
  servers = rack.getControllersByName("server");
  space.focus(rack.showingObject3d);
  oldRaycasterObjects = space.raycasterObjects;
  space.raycasterObjects = [];
  servers.forEach((c: Controller) => {
    space.raycasterObjects.push(c.getRaycasterObject());
  });
  space.setRaycasterEventMap({ mousemove: mousemoveServer, click: clickServer });
}

function showRackModel() {
  console.log("showRackModel");
  updateRightInfo(null, null);
  space.setRaycasterEventMap({ click: clickRack, dblclick: dblclickRack, mousemove: moveRack });
  space.raycasterObjects = oldRaycasterObjects;

  racks.forEach((c) => {
    c.resetAction();
  });

  space.setOutline([]);
  space.setOutline([], moveOutlineKey);
  space.setOutline([], lockServerOutlineKey);

  lockRack = null;
  lockServer = null;
}

function showCapacityModel() {
  racks.forEach((c) => {
    c.changeToCapacityModel();
    c.setCapacity(Math.random() * 100);
  });
}

function showNormalModel() {
  showRackModel();
  racks.forEach((c) => {
    c.changeToNormalModel();
  });
}

leftArrowButtonEle.addEventListener('click', () => {
  showRackModel();
  leftArrowButtonEle.classList.add('hidden')
  space.focus(main.showingObject3d);
})

document.getElementById('capacity-button').addEventListener('click', () => {
  capacityFlag = !capacityFlag;
  if (capacityFlag) {
    showCapacityModel();
  } else {
    showNormalModel();
  }
})

document.getElementById('temperature-button').addEventListener('click', () => {
  temperatureFlag = !temperatureFlag;
  space.heatmap.visible(temperatureFlag);
})

function moveRack(results: any[]) {
  if (results.length > 0) {
    const rack = results[0].object.$controller.raycasterRedirect;
    updatePopoverContent(rack.name);
    if (rack !== lockRack) {
      space.setOutline([rack.showingObject3d], moveOutlineKey);
    }
  } else {
    updatePopoverContent(null);
    space.setOutline([], moveOutlineKey);
  }
}

function clickRack(results: any[]) {
  if (results.length > 0) {
    window.selectedThing = results[0].object;
    console.log(results);
    // reset other rack
    racks.forEach((c) => {
      c.resetAction();
    });

    const rack = results[0].object.$controller.raycasterRedirect;
    const door = rack.getControllersByName("door")[0];
    door.executeAction("openDoor", openDoorLocation);

    space.setOutline([rack.showingObject3d]);
    updateRightInfo(rack);
  }
}

function dblclickRack(results: any[]) {
  if (results.length > 0) {
    lockRack = results[0].object.$controller.raycasterRedirect;
    showServerModel(lockRack);
    space.setOutline([lockRack.showingObject3d]);
  }
}

// add icon list
const p = document.getElementById('3d-space').parentElement
const iconList = document.createElement('div')
iconList.classList.add('absolute', 'flex')

p.appendChild(iconList)

// icon : warn
const imgEle = document.createElement('img')
imgEle.src = './static/images/warn.svg'
imgEle.classList.add('icon', 'twinkle')
imgEle.style.backgroundColor = 'rgba(20,50,200,0.4)'
iconList.appendChild(imgEle)





function updateIconListPosition() {
  const screenPosition = space.getControllersByName("screen")[0].getViewOffset({ y: 2 });
  iconList.style.top = `${screenPosition.y}px`
  iconList.style.left = `${screenPosition.x}px`
}


// load 3d model.
space.load("./static/3d/datacenter-0715.glb")
  .then(() => {

    space.orbit.minPolarAngle = Math.PI * 0.2;
    space.orbit.maxPolarAngle = Math.PI * 0.65;
    space.setRaycasterEventMap({ click: clickRack, dblclick: dblclickRack, mousemove: moveRack });
    racks = space.getControllersByName("rack");
    main = space.getControllersByTags("main")[0];

    space.setOutlinePass(moveOutlineKey, {
      edgeGlow: 1,
      edgeStrength: 3,
      hiddenEdgeColor: 0xffffff,
      pulsePeriod: 0,
      visibleEdgeColor: 0xffffff,
    });

    space.setOutlinePass(lockServerOutlineKey);

    setInterval(updateIconListPosition, 50);

    // heatmap
    const floor = space.getControllersByName("floor")[0];
    space.showHeatmap(floor.showingObject3d);
    space.heatmap.setMax(10);
    // @ts-ignore
    const datas = [];
    racks = space.getControllersByName("rack");

    racks.forEach((r) => {
      const position = new THREE.Vector3();
      position.setFromMatrixPosition(r.showingObject3d.matrixWorld);
      datas.push({
        value: Math.min(Math.random() * 10 + 2, 10),
        x: position.x,
        y: position.z,
      });
    });
    // @ts-ignore
    space.heatmap.setDatas(datas);
    space.heatmap.visible(temperatureFlag);

    // test();

    // console.log("racks",racks)
  })
  .catch((err) => {
    console.error(err);
  });


// enable modal
const myModal = new Modal(document.getElementById('exampleModal'))
iconList.addEventListener('click', () => {
  // console.log('click event')
  myModal.toggle()
})
Array.from(document.getElementsByClassName('modal-close')).forEach(ele => {
  ele.addEventListener('click', () => {
    myModal.hide()
  })
});

// enable tooltips
const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl:Element) {
  return new Tooltip(tooltipTriggerEl)
})