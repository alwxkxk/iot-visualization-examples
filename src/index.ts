import Space from "./common/Space";
import Controller from "./common/Controller";
import "./index.css"
import { Object3D } from "three";

const openDoorLocation={
  ry:120
}
const popServerLocation={
  x:0.35,
  t:700
}

const moveOutlineKey = "move"
const lockServerOutlineKey = "lockServer"

const element = $("#3d-space")[0];
const space = new Space(element, {
  orbit:true,
  outline:true
});



// for reset action
let racks:Controller[]; 
let servers:Controller[];

//  for lock outline
let lockRack:Controller;
let lockServer:Controller;

// @ts-ignore
window.debugSpace =space;
const THREE = (< IWindow>window).THREE;
let showServerFlag = false;
let oldRaycasterObjects:IObject3d[];


function clickServer(results:any[]) {
  if(results.length >0){
    let server = results[0].object.$controller.raycasterRedirect;
    lockServer = server;
    // reset other
    servers.forEach((c)=>{
      c.resetAction()
    })
    server.executeAction("popServer",popServerLocation);
    console.log("clickServer",server.name)
    space.setOutline([lockServer.showingObject3d],lockServerOutlineKey)
  }
}

function mousemoveServer(results:any[]) {
  if(results.length >0){
    let server = results[0].object.$controller.raycasterRedirect;
    if(server !== lockServer){
      space.setOutline([server.showingObject3d],moveOutlineKey);
    }
  }
}

function showServerModel(rack:Controller){
  console.log("showServerModel")
  showServerFlag = true;
  servers = rack.getControllersByName("server");
  space.focus(rack.showingObject3d)
  oldRaycasterObjects = space.raycasterObjects;
  space.raycasterObjects = []
  servers.forEach( (c:Controller) => {
    space.raycasterObjects.push(c.getRaycasterObject())
  });
  space.setRaycasterEventMap({mousemove:mousemoveServer,click:clickServer});
}

function showRackModel(){
  console.log("showRackModel")
  showServerFlag = false;
  space.setRaycasterEventMap({click:clickRack,dblclick:dblclickRack});
  space.raycasterObjects = oldRaycasterObjects;

  space.setOutline([])
  space.setOutline([],moveOutlineKey)
  space.setOutline([],lockServerOutlineKey)
  
  lockRack = null;
  lockServer = null;
}

$("#back").on("click", ()=>{
  showRackModel();
})


function moveRack(results:any[]) {
  if(results.length>0){
    let rack = results[0].object.$controller.raycasterRedirect;
    space.setOutline([rack.showingObject3d],moveOutlineKey)
  }
}

function clickRack(results:any[]) {
  if(results.length >0){
    (< IWindow>window).selectedThing = results[0].object;
    console.log(results)
    //reset other rack
    racks.forEach(c => {
      c.resetAction();
    });

    let rack = results[0].object.$controller.raycasterRedirect;
    let door = rack.getControllersByName("door")[0]
    door.executeAction("openDoor",openDoorLocation);

    space.setOutline([rack.showingObject3d])
  }
}

function dblclickRack(results:any[]) {
  if(results.length >0){
    lockRack = results[0].object.$controller.raycasterRedirect;
    showServerModel(lockRack)
    space.setOutline([lockRack.showingObject3d])
  }
}



// load 3d model.
space.load("./static/3d/datacenter.glb")
.then(()=>{
  space.setRaycasterEventMap({click:clickRack,dblclick:dblclickRack,mousemove:moveRack});
  racks = space.getControllersByName("rack");

  space.setOutlinePass(moveOutlineKey, {
    edgeStrength:3,
    edgeGlow:1,
    pulsePeriod: 0,
    visibleEdgeColor:0xffffff,
    hiddenEdgeColor:0xffffff
  });

  space.setOutlinePass(lockServerOutlineKey);
  
  // console.log("racks",racks)
})
.catch((err)=>{
  console.error(err);
})
