import * as h337 from "heatmap.js";
import { IPoint } from "../../type";
import Space from "../Space";

const height = 1024;
const width = 1024;
const THREE = window.THREE;

export default class Heatmap {
  public max: number;
  public points: IPoint[];
  public container: Element;
  public heatmapInstance: any;
  public len: number;
  public plane: THREE.Mesh;
  private space: Space;

  constructor(space: Space, mainObj: THREE.Object3D) {
    this.space = space;
    this.max = 0;
    this.points = [];
    this.init();
    this.createPlane(mainObj);
  }

  public init() {
    // create container
    const container = this.container = document.createElement("div");
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
    container.style.display = "none";
    container.className = "heatmap-container";

    document.body.appendChild(container);

    // create heatmap canvas
    this.heatmapInstance = h337.create({container});
    this.heatmapInstance.setData({
      data: [],
      max: 0,
    });
  }

  public createPlane(mainObj: THREE.Object3D) {
    if (!mainObj) {
      return console.warn("mainObj is null");
    }

    // creat plane
    const canvasElement = this.heatmapInstance._renderer.canvas;
    const box3 = new THREE.Box3();
    box3.setFromObject(mainObj);
    const x = Math.abs(box3.max.x - box3.min.x);
    const y = Math.abs(box3.max.z - box3.min.z);
    const len = this.len = Math.max(x, y) * 2;

    const texture = new THREE.CanvasTexture(canvasElement);
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      // side:THREE.DoubleSide,
      depthTest: false,
      depthWrite: false,
      map: texture,
    });

    const planeGeometry = new THREE.PlaneBufferGeometry( len, len );
    const plane = this.plane = new THREE.Mesh(planeGeometry, material);
    plane.rotation.x = - Math.PI * 0.5;
    this.space.scene.add(plane);
    // console.log("createPlane", plane);
  }

  public setDatas(datas: IPoint[]) {
    this.points = [];
    datas.forEach((v) => {
      if (v.value > this.max) {
        console.warn("max value increase to ", v.value);
        this.max = v.value;
      }

      this.points.push({
        value: v.value,
        x: ( (v.x / this.len) + 0.5 ) * width,
        y: ( (v.y / this.len) + 0.5 ) * height,
      });
    });
    // BUG: showing nothing if not push new data.
    this.points.push({x: 0, y: 0, value: 0});

    this.heatmapInstance.setData({
      data: this.points,
      max: this.max,
    });
    // @ts-ignore
    this.plane.material.map.needsUpdate = true;
  }

  public setMax(value: number) {
    this.max = value || 0;
  }

  public visible(flag: boolean) {
    this.plane.visible = flag;
  }

}
