import Curve from "./common/base/Curve";
import Space from "./common/Space";
const element = $("#3d-space")[0];
const space = new Space(element, {
  orbit: true,
});

window.debugSpace = space;
const THREE = window.THREE;

space.createEmptyScene();
space.camera.position.set(69, 88, -157);
space.camera.rotation.set(-2.6, 0.36, 2.94);
space.orbit.update();

function ef(repeat: number) {
  return (input: number) => {
    return (repeat * input) % 1;
  };
}

const globeRadius = 50;
let globeWidth: number;
let globeHeight: number;

const state = {
  users: [
    {
      id: 0,
      name: "John Yang",
      geo: {
        lat: 31.2304,
        lng: 121.4737,
        name: "Shanghai, CN",
      },
      date: "01.23.2018",
    },
    {
      id: 1,
      name: "Emma S.",
      geo: {
        lat: 55.6761,
        lng: 12.5683,
        name: "Denmark, CPH",
      },
      date: "09.20.2018",
    },
    // {
    //   id: 2,
    //   name: 'Spencer S.',
    //   geo: {
    //     lat: 34.0522,
    //     lng: -118.2437,
    //     name: 'Los Angeles, CA',
    //   },
    //   date: '12.25.2018',
    // },
  ],
};
// @ts-ignore
const canvas = window.canvasDebug = document.createElement("canvas");
// @ts-ignore
const ctx = window.ctxDebug = canvas.getContext("2d");
// @ts-ignore
const img1 = window.img1 = new Image();
// drawing of the test image - img1
img1.onload = function() {
    // draw background image
    ctx.canvas.height =  img1.height;
    ctx.canvas.width = img1.width;
    ctx.drawImage(img1, 0, 0);
    globeWidth = ctx.canvas.width / 2;
    globeHeight = ctx.canvas.height / 2;

    state.users.forEach((v) => {
      const l = convertLatLngToFlatCoords(v.geo.lat, v.geo.lng);
      console.log("convertFlatCoordsToSphereCoords", convertFlatCoordsToSphereCoords(l.x, l.y));
      console.log("convertLatLngToSphereCoords", convertLatLngToSphereCoords(v.geo.lat, v.geo.lng));
      const circle = new Path2D();
      circle.arc(l.x, l.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(0,255,255,0.8)";
      ctx.fill(circle);
    });

    // let circle = new Path2D();
    // let l1 = convertLatLngToFlatCoords(0,0);
    // circle.moveTo(0,0)
    // circle.arc(l1.x, l1.y, 10, 0, 2 * Math.PI);
    // ctx.fillStyle = "rgba(0,255,255,0.8)";
    // ctx.fill(circle);

    const texture = new THREE.CanvasTexture(ctx.canvas);
    const geometry = new THREE.SphereGeometry( globeRadius, 32, 32 );
    const material = new THREE.MeshBasicMaterial( {
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      depthTest: false,
      depthWrite: false,
    });
    const sphere = new THREE.Mesh( geometry, material );
    space.scene.add( sphere );
    document.body.appendChild(canvas);

    const l1 = state.users[0].geo;
    const l2 = state.users[1].geo;
    const start1 = convertLatLngToSphereCoords(l1.lat, l1.lng);
    const start2 = convertLatLngToSphereCoords(l2.lat, l2.lng);
    const curve1 = new Curve(space, start1, start2, {pointModel: true, pointSize: 0.8});
    curve1.colorEasing("#0000ff", "#00ffff", ef(3));

    setInterval(() => {
      curve1.colorEasing("#0000ff", "#00ffff", ef(3));
    }, 2000);

};

img1.src = "./static/images//global9.png";

function convertLatLngToSphereCoords(latitude: number, longitude: number) {
  const phi = (latitude * Math.PI) / 180;
  const theta = ((longitude - 180) * Math.PI) / 180;
  const x = -(globeRadius + -1) * Math.cos(phi) * Math.cos(theta);
  const y = (globeRadius + -1) * Math.sin(phi);
  const z = (globeRadius + -1) * Math.cos(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
}

function convertFlatCoordsToSphereCoords(x: number, y: number) {
  // Calculate the relative 3d coordinates using Mercator projection relative to the radius of the globe.
  // Convert latitude and longitude on the 90/180 degree axis.
  let latitude = ((x - globeWidth) / globeWidth) * -180;
  let longitude = ((y - globeHeight) / globeHeight) * -90;
  latitude = (latitude * Math.PI) / 180; // (latitude / 180) * Math.PI
  longitude = (longitude * Math.PI) / 180; // (longitude / 180) * Math.PI // Calculate the projected starting point
  const radius = Math.cos(longitude) * globeRadius;
  const targetX = Math.cos(latitude) * radius;
  const targetY = Math.sin(longitude) * globeRadius;
  const targetZ = Math.sin(latitude) * radius;
  return {
    x: targetX,
    y: targetY,
    z: targetZ,
  };
}

function convertLatLngToFlatCoords(latitude: number, longitude: number) {
  // Reference: https://stackoverflow.com/questions/7019101/convert-pixel-location-to-latitude-longitude-vise-versa
  const x = Math.round((longitude + 180) * (globeWidth / 360)) * 2;
  const y = Math.round((-1 * latitude + 90) * (globeHeight / 180)) * 2;
  console.log("convertLatLngToFlatCoords:", latitude, longitude, x, y);
  return { x, y };
}
