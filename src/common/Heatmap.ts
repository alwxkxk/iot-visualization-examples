import * as h337 from 'heatmap.js'
import { Box3, CanvasTexture, Mesh, MeshBasicMaterial, Object3D, PlaneBufferGeometry, Scene } from 'three'
import { IPoint } from '../type'
const height = 1024
const width = 1024

export default class Heatmap {
  container: HTMLDivElement
  heatmapInstance: h337.Heatmap<'value', 'x', 'y'>
  len: number
  plane: Mesh
  points: IPoint[]
  max: number
  min: number
  texture: CanvasTexture
  init (scene: Scene, target: Object3D): void {
    const plane = this.createPlane(target)
    scene.add(plane)
  }

  createPlane (target: Object3D): Mesh {
    const container = this.container = document.createElement('div')
    container.style.width = `${width}px`
    container.style.height = `${height}px`
    container.style.display = 'none'
    container.className = 'heatmap-container'

    document.body.appendChild(container)

    // create heatmap canvas
    this.heatmapInstance = h337.create({ container })
    this.max = 1
    this.min = 0.1

    this.heatmapInstance.setData({
      data: [],
      min: this.min,
      max: this.max
    })

    // @ts-expect-error
    const canvasElement = this.heatmapInstance._renderer.canvas
    const box3 = new Box3()
    box3.setFromObject(target)
    const x = Math.abs(box3.max.x - box3.min.x)
    const y = Math.abs(box3.max.z - box3.min.z)
    const len = this.len = Math.max(x, y) * 2

    const texture = this.texture = new CanvasTexture(canvasElement)
    const material = new MeshBasicMaterial({
      transparent: true,
      //   side: DoubleSide,
      depthTest: false,
      depthWrite: false,
      map: texture
    })
    const planeGeometry = new PlaneBufferGeometry(len, len)
    const plane = this.plane = new Mesh(planeGeometry, material)
    plane.rotation.x = -Math.PI * 0.5
    return plane
  }

  setData (dataList: IPoint[]): void {
    this.points = []
    dataList.forEach((v) => {
      if (v.value > this.max) {
        // console.warn('max value increase to ', v.value)
        this.max = v.value
      }
      // bug: heatmap.js can show x:110,but can show 110.9384904
      const x = Number((((v.x / this.len) + 0.5) * width).toFixed(0))
      const y = Number((((v.y / this.len) + 0.5) * height).toFixed(0))
      // if position out of range ,there will draw nothing,
      if (x > this.len || y > this.len) {
        console.warn('heatmap point out of range.', this.len, x, y)
      }
      this.points.push({
        value: v.value,
        x,
        y
      })
    })
    this.heatmapInstance.setData({
      data: this.points,
      max: this.max,
      min: this.min
    })
    this.heatmapInstance.repaint()
    // @ts-expect-error
    this.plane?.material?.map?.needsUpdate = true
  }

  setVisible (flag: boolean): void {
    this.plane.visible = flag
  }

  getVisible (): boolean {
    return this.plane.visible
  }

  dispose (): void {
    this.plane.parent?.remove(this.plane)
    this.texture.dispose()

    Object.keys(this).forEach(key => {
      // @ts-expect-error
      this[key] = null
    })
  }
}
