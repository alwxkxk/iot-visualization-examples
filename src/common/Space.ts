import mitt, { Emitter } from 'mitt'
import {
  DefaultLoadingManager,
  FileLoader,
  HemisphereLight,
  LoaderUtils,
  Object3D,
  PerspectiveCamera,
  Raycaster,
  Scene,
  Vector2,
  WebGLRenderer,
  Intersection,
  Vector3,
  Box3,
  Sphere,
  Quaternion
} from 'three'
import Object3DWrap from './Object3DWrap'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Events from './Events'
import { throttle } from 'lodash-es'
import { Easing, Tween } from '@tweenjs/tween.js'
import { IOffset3 } from '../type'

interface ISpaceOptions {
  orbit?: boolean
}

interface IFocusOptions{
  type?: 'coordinate' | 'radius' // coordinate or radius(default)
  duration?: number
  offset: IOffset3
}

export default class Space {
  element: HTMLElement
  options: ISpaceOptions
  renderer: WebGLRenderer
  innerWidth: number
  innerHeight: number
  object3DWrapMap: Map<string, Object3DWrap>
  offset: DOMRect
  raycaster: Raycaster
  mouse: Vector2
  scene: Scene
  camera: PerspectiveCamera
  emitter: Emitter<any>
  animateWrap: any
  orbit: OrbitControls
  object3DWrapNameMap: Map<string, Object3DWrap>
  raycasterObjects: Object3D[]
  mouseEvent: MouseEvent
  focusTween: Tween<any>|null
  cameraOriginPosition: Vector3
  constructor (element: HTMLElement, options?: ISpaceOptions) {
    this.element = element
    this.options = { ...options }
    this.init()
    return this
  }

  // #region init and load

  init (): void {
    if (process.env.NODE_ENV === 'development') {
      // @ts-expect-error
      window.debugSpace = this
    }
    this.emitter = mitt()
    const ele = this.element
    this.renderer = new WebGLRenderer({ alpha: true, antialias: false })

    if (ele.clientHeight === 0 || ele.clientWidth === 0) {
      throw new Error('element should had width and height before init.')
    }

    this.innerWidth = ele.clientWidth
    this.innerHeight = ele.clientHeight
    this.offset = ele.getBoundingClientRect()

    this.object3DWrapMap = new Map()
    this.object3DWrapNameMap = new Map()

    this.renderer.setSize(this.innerWidth, this.innerHeight)
    ele.appendChild(this.renderer.domElement)

    this.raycaster = new Raycaster()
    this.mouse = new Vector2()
  }

  async load (fileUrl: string): Promise<any> {
    const p = await new Promise((resolve, reject) => {
      const gltfLoader = new GLTFLoader()
      const loader = new FileLoader(DefaultLoadingManager)
      loader.setResponseType('arraybuffer')
      this.emitter.emit(Events.load.start)
      loader.load(fileUrl,
        (data: any) => {
          const resourcePath = LoaderUtils.extractUrlBase(fileUrl)
          gltfLoader.parse(data, resourcePath,
            (gltf: object) => {
              // console.log('load gltf')
              this.afterLoaded(gltf)
              this.emitter.emit(Events.load.finish)
              resolve('')
            },
            (error: any) => {
              reject(error)
            }
          )
        },
        (xhr: any) => {
          // progressing
          this.emitter.emit(Events.load.processing, xhr)
        },
        (event: ErrorEvent) => {
          // loadedError
          reject(event)
        })
    })

    return p
  }

  afterLoaded (gltf: any): void {
    const scene = this.scene = gltf.scene
    this.camera = new PerspectiveCamera(20, this.innerWidth / this.innerHeight, 0.1, 1000)

    scene.add(this.camera)
    scene.add(new HemisphereLight(0xffffff, 0xffffff, 1))

    scene.traverse((item: Object3D) => {
      const objectWrap = new Object3DWrap(item)
      this.object3DWrapMap.set(item.uuid, objectWrap)
      this.object3DWrapNameMap.set(objectWrap.fullName, objectWrap)
      // TODO: BUG? three.js r135 need updateMatrixWorld first?
      // and orbit has problem,too.
      // three.js r109 is normal
      // item.updateMatrixWorld()
    })
    this.initOrbit()

    this.animateWrap = this.animate.bind(this)
    this.animate()
  }

  initOrbit (): void {
    const orbitDisable = this.options.orbit
    if (orbitDisable !== false) {
      const orbit = this.orbit = new OrbitControls(this.camera, this.renderer.domElement)
      orbit.screenSpacePanning = true
      orbit.addEventListener('change', () => {
        this.emitter.emit(Events.orbitChange)
      })
      orbit.update()
    }
  }

  animate (): void {
    if (this.animateWrap === null) {
      return
    }
    requestAnimationFrame(this.animateWrap)
    this.emitter.emit(Events.animate)
    this.renderer.render(this.scene, this.camera)
  }

  // #endregion init and load

  // #region raycaster

  /**
   * init raycaster and event(get value by emitter).
   * @param  {Object3DWrap[]} objList
   * @param  {object} options
   * @param  {boolean} options.click set false when disable raycaster click event.
   * @param  {boolean} options.dblclick set false when disable raycaster dblclick event.
   * @param  {boolean} options.mousemove set false when disable raycaster mousemove event.
   * @param  {number}  options.throttleTime set raycaster event throttle time
   * @returns void
   */
  initRaycaster (
    objList: Object3D[],
    options: {click?: boolean, dblclick?: boolean, mousemove?: boolean, throttleTime?: number} = {}
  ): void {
    this.raycaster = new Raycaster()
    this.setRaycasterObjects(objList)

    const initRaycasterEvent: Function = (eventName: string): void => {
      const funWrap = throttle(
        (event: MouseEvent): void => {
          this.mouseEvent = event
          this.mouse.x = (event.clientX - (this.offset.left)) / this.innerWidth * 2 - 1
          this.mouse.y = -((event.clientY - (this.offset.top)) / this.innerHeight) * 2 + 1
          // Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ animate: string; dispose: string; click: { raycaster: string; }; dblclick: { raycaster: string; }; mousemove: { raycaster: string; }; }'.
          // No index signature with a parameter of type 'string' was found on type '{ animate: string; dispose: string; click: { raycaster: string; }; dblclick: { raycaste
          // @ts-expect-error
          this.emitter.emit(Events[eventName].raycaster, this.getRaycasterIntersectObjects())
        },
        Number.isNaN(options.throttleTime) ? options.throttleTime : 50
      )

      this.element.addEventListener(eventName, funWrap)
      this.emitter.on(Events.dispose, () => {
        this.element.removeEventListener(eventName, funWrap)
      })
    }
    const clickFlag = options.click
    if (clickFlag !== false) {
      initRaycasterEvent('click')
    }
    const dblclickFlag = options.dblclick
    if (dblclickFlag !== false) {
      initRaycasterEvent('dblclick')
    }
    const mousemoveFlag = options.mousemove
    if (mousemoveFlag !== false) {
      initRaycasterEvent('mousemove')
    }
  }

  setRaycasterObjects (objList: Object3D[]): void {
    this.raycasterObjects = objList
  }

  getRaycasterIntersectObjects (): Intersection[] {
    if (this.raycasterObjects.length === 0) {
      return []
    } else {
      this.raycaster.setFromCamera(this.mouse, this.camera)
      return this.raycaster.intersectObjects(this.raycasterObjects, true)
    }
  }

  // #endregion raycaster

  // #region camera
  focus (targe: Object3D, options: IFocusOptions): void {
    this.cancelFocus()

    const box = new Box3()
    const center = new Vector3()
    const sphere = new Sphere()
    const delta = new Vector3()
    const quaternion = new Quaternion()

    box.setFromObject(targe)
    box.getCenter(center)
    targe.getWorldQuaternion(quaternion)

    delta.set(
      options.offset.x === undefined ? 0 : options.offset.x,
      options.offset.y === undefined ? 0 : options.offset.y,
      options.offset.z === undefined ? 0 : options.offset.z
    )
    delta.applyQuaternion(quaternion)
    if (options.type === undefined || options.type === 'radius') {
      const radius = box.getBoundingSphere(sphere).radius
      delta.multiplyScalar(radius)
    }

    const orbitTargetStart = this.orbit.target.clone()
    const orbitTargetEnd = center.clone()
    const cameraPositionStart = this.camera.position.clone()
    const cameraPositionEnd = center.add(delta)
    const startObj = { orbitTarget: orbitTargetStart, cameraPosition: cameraPositionStart }
    const endObj = { orbitTarget: orbitTargetEnd, cameraPosition: cameraPositionEnd }

    this.focusTween = new Tween(startObj)
      .to(endObj, options.duration === undefined ? 1000 : options.duration)
      .easing(Easing.Quadratic.Out)
      // .onStart(() => {})
      .onUpdate(() => {
        this.updateCameraPositionAndOrbitTarget(startObj.orbitTarget, startObj.cameraPosition)
      })
      .onStop(() => {
        this.focusTween = null
      })
      .onComplete(() => {
        this.focusTween = null
      })
      .start()

    const animate = (time: DOMHighResTimeStamp): void => {
      if (this.focusTween !== null) {
        requestAnimationFrame(animate)
        this.focusTween.update(time)
      }
    }
    animate(0)
    // TODO: hide the object when camera through across object inside to avoid hide the view.
  }

  cancelFocus (): void {
    if (this.focusTween !== undefined && this.focusTween !== null) {
      this.focusTween.stop()
      this.focusTween = null
    }
  }

  setCameraOriginPosition (position: Vector3): void {
    this.cameraOriginPosition = position
    this.camera.position.copy(position)
    this.camera.updateMatrix()
    this.orbit.update()
  }

  updateCameraPositionAndOrbitTarget (orbitTarget: Vector3, cameraPosition: Vector3): void {
    this.camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z)
    this.orbit.target.set(orbitTarget.x, orbitTarget.y, orbitTarget.z)
    this.orbit.update()
  }

  backToCameraOriginPosition (): void {
    if (this.cameraOriginPosition === undefined) {
      console.warn('Need setCameraOriginPosition before backToCameraOriginPosition.')
      return
    }
    this.cancelFocus()
    const startCameraPosition = this.camera.position.clone()
    const startOrbitTarget = this.orbit.target.clone()
    const startObj = { cameraPosition: startCameraPosition, orbitTarget: startOrbitTarget }
    const endObj = { cameraPosition: this.cameraOriginPosition, orbitTarget: new Vector3() }

    let backTween: Tween<any>|null = new Tween(startObj)
      .to(endObj, 1000)
      .easing(Easing.Quadratic.Out)
      // .onStart(() => {})
      .onUpdate(() => {
        this.updateCameraPositionAndOrbitTarget(startObj.orbitTarget, startObj.cameraPosition)
      })
      .onStop(() => {
        backTween = null
      })
      .onComplete(() => {
        backTween = null
      })
      .start()

    const animate = (time: DOMHighResTimeStamp): void => {
      if (backTween !== null) {
        requestAnimationFrame(animate)
        backTween.update(time)
      }
    }
    animate(0)
  }
  // #endregion camera

  getObject3DWrapList (): Object3DWrap[] {
    return Array.from(this.object3DWrapMap.values())
  }

  getObject3DWrap (obj: Object3D): Object3DWrap|null {
    const result = this.object3DWrapMap.get(obj.uuid)
    if (result === undefined) {
      return null
    } else {
      return result
    }
  }

  getObject3DWrapByFullName (fullName: string): Object3DWrap|null {
    const result = this.object3DWrapNameMap.get(fullName)
    if (result === undefined) {
      return null
    } else {
      return result
    }
  }

  resize (): void {
    const camera = this.camera

    if (camera === undefined) {
      return
    }

    const ele = this.element
    if (ele.clientHeight === 0 || ele.clientWidth === 0) {
      throw new Error('element should had width and height before init.')
    }

    this.innerWidth = ele.clientWidth
    this.innerHeight = ele.clientHeight
    this.offset = ele.getBoundingClientRect()

    if (camera.type === 'PerspectiveCamera') {
      camera.aspect = this.innerWidth / this.innerHeight
      camera.updateProjectionMatrix()
    }

    this.renderer.setSize(this.innerWidth, this.innerHeight)
    this.emitter.emit(Events.resize)
  }

  dispose (): void {
    this.emitter.emit(Events.dispose)
    setTimeout(() => {
      this.emitter.off('*')
      Object.keys(this).forEach(key => {
        // @ts-expect-error
        this[key] = null
      })
    }, 1000)
  }
}
