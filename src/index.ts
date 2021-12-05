import "./common/global_setting";
import {
  updateChart1,
  updateChart2,
  updateChart3
} from './index-chart'

import Controller from "./common/Controller";
import Space from "./common/Space";
import "./index.css";
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

const element = $("#3d-space")[0];
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

const updatePopoverContent = (() => {
  let oldName: string;
  return (name: string) => {
    const event = space.mouse.mousemoveEvent;
    if (name) {
      $("#popover-content").removeClass("hide");
      $("#popover-content").css("top", event.clientY + 10);
      $("#popover-content").css("left", event.clientX + 10);
      $("#popover-text").text(name);
    } else {
      $("#popover-content").addClass("hide");
    }

    if (oldName !== name) {
      updateChart1();
      oldName = name;
    }

  };
})();

const updateCollapse = (() => {
  let oldRack: Controller;
  let oldServer: Controller;
  return (rack: Controller, server?: Controller) => {
    if (rack) {
      $("#rackCard").removeClass("hide");
      $("#rackName").text(rack.name);
      if (rack !== oldRack) {
        updateChart2();
        oldRack = rack;
      }
    } else {
      $("#rackCard").addClass("hide");
    }

    if (server) {
      $("#serverCard").removeClass("hide");
      $("#serverName").text(server.name);
      $("#collapseTwo").collapse("show");
      if (server !== oldServer) {
        updateChart3();
        oldServer = server;
      }
    } else {
      $("#serverCard").addClass("hide");
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
    updateCollapse(lockRack, server);
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
  $("#left-arrow-button").removeClass("hide");
  servers = rack.getControllersByName("server");
  space.focus(rack.showingObject3d);
  oldRaycasterObjects = space.raycasterObjects;
  space.raycasterObjects = [];
  servers.forEach( (c: Controller) => {
    space.raycasterObjects.push(c.getRaycasterObject());
  });
  space.setRaycasterEventMap({mousemove: mousemoveServer, click: clickServer});
}

function showRackModel() {
  console.log("showRackModel");
  updateCollapse(null, null);
  space.setRaycasterEventMap({click: clickRack, dblclick: dblclickRack, mousemove: moveRack});
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

$("#left-arrow-button").on("click", () => {
  showRackModel();
  $("#left-arrow-button").addClass("hide");
  space.focus(main.showingObject3d);

});

$("#capacity-button").on("click", () => {
  capacityFlag = !capacityFlag;
  if (capacityFlag) {
    showCapacityModel();
  } else {
    showNormalModel();
  }
});

$("#temperature-button").on("click", () => {
  temperatureFlag = !temperatureFlag;
  space.heatmap.visible(temperatureFlag);
});

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
    updateCollapse(rack);
  }
}

function dblclickRack(results: any[]) {
  if (results.length > 0) {
    lockRack = results[0].object.$controller.raycasterRedirect;
    showServerModel(lockRack);
    space.setOutline([lockRack.showingObject3d]);
  }
}

// load 3d model.
space.load("./static/3d/datacenter-0715.glb")
.then(() => {

  space.orbit.minPolarAngle = Math.PI * 0.2;
  space.orbit.maxPolarAngle = Math.PI * 0.65;
  space.setRaycasterEventMap({click: clickRack, dblclick: dblclickRack, mousemove: moveRack});
  racks = space.getControllersByName("rack");
  main = space.getControllersByTags("main")[0];
  $('[data-toggle="popover"]').popover();

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
    position.setFromMatrixPosition( r.showingObject3d.matrixWorld );
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

$.when($.ready).then(() => {
  $('[data-toggle="tooltip"]').tooltip({placement: "bottom"});
});

// add icon list
const p = $($("#3d-space")[0].parentElement);
const iconList = $("<div></div>")
.attr("id", "icon-list")
.css("position", "absolute")
.css("display", "flex");

iconList.appendTo(p);

// icon : warn
$("<img></img>")
.appendTo(iconList)
.attr("src", "./static/images/warn.svg")
.attr("data-toggle", "popover")
.attr("data-trigger", "hover")
.attr("title", "warn")
.attr("data-content", "Device exception.")
.addClass("icon-3d")
.addClass("twinkle");

$(".icon-3d").on("click", () => {
  $("#exampleModal").modal("show");
});

function updateIconListPosition() {
  const screenPosition =  space.getControllersByName("screen")[0].getViewOffset({y: 2});

  iconList
  .css("top", screenPosition.y)
  .css("left", screenPosition.x);
}


