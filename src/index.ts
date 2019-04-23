import Space from "./common/Space";

const element = $("#3d-space")[0];
const space = new Space(element,{
  inspector:true,
  orbit:true
});
space.load("./static/3d/sample-scene.glb")
.then(()=>{
  space.autoRotate(true);
})
// @ts-ignore
window.debugSpace=space;

