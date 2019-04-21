import Space from "./common/Space";
import Inspector from "./common/Inspector";

const element = $("#3d-space")[0];
const space = new Space(element);
const inspector = new Inspector(element);
space.load("./static/3d/sample-scene.glb");
space.addAnimateAction("inspector",inspector.animateAction.bind(inspector));

