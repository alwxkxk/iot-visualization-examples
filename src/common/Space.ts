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
  Intersection
} from 'three'
import Object3DWrap from './Object3DWrap'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Events from './Events'
import { throttle } from 'lodash-es'

interface ISpaceOptions {
  orbit?: boolean
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
  animationId: number
  emitter: Emitter<any>
  animateWrap: any
  orbit: OrbitControls
  object3DWrapNameMap: Map<string, Object3DWrap>
  raycasterObjects: Object3D[]
  constructor (element: HTMLElement, options?: ISpaceOptions) {
    this.element = element
    this.options = { ...options }
    this.init()
    return this
  }

  init (): void {
    if (process.env.NODE_ENV === 'development') {
      // @ts-expect-error
      window.debugSpace = this
    }
    this.emitter = mitt()
    this.animateWrap = this.animate.bind(this)
    const ele = this.element
    this.renderer = new WebGLRenderer({ alpha: false, antialias: false })

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

  async load (fileUrl: string): Promise<void> {
    return await new Promise((resolve, reject) => {
      const gltfLoader = new GLTFLoader()
      const loader = new FileLoader(DefaultLoadingManager)
      loader.setResponseType('arraybuffer')
      loader.load(fileUrl,
        (data: any) => {
          const resourcePath = LoaderUtils.extractUrlBase(fileUrl)
          gltfLoader.parse(data, resourcePath,
            (gltf: object) => {
              console.log('load gltf')
              this.afterLoaded(gltf)
              resolve()
            },
            (error: any) => {
              reject(error)
            }
          )
        },
        (xhr: any) => {
          // progressing
          console.log(`${(xhr.loaded / xhr.total * 100)}% loaded`)
        },
        (event: ErrorEvent) => {
          // loadedError
          reject(event)
        })
    })
  }

  afterLoaded (gltf: any): void {
    const scene = this.scene = gltf.scene
    const camera = this.camera = new PerspectiveCamera(20, this.innerWidth / this.innerHeight, 0.1, 1000)

    scene.add(this.camera)
    scene.add(new HemisphereLight(0xffffff, 0xffffff, 1))

    camera.position.set(16, 14, -1)
    camera.updateMatrix()

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

    this.animate()
  }

  initOrbit (): void {
    if (!this.options.orbit) {
      const orbit = this.orbit = new OrbitControls(this.camera, this.renderer.domElement)
      orbit.update()
    }
  }

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
    objList: Object3DWrap[],
    options: {click?: boolean, dblclick?: boolean, mousemove?: boolean, throttleTime?: number} = {}
  ): void {
    this.raycaster = new Raycaster()
    this.setRaycasterObjects(objList)

    const initRaycasterEvent: Function = (eventName: string): void => {
      const funWrap = throttle(
        (event: MouseEvent): void => {
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
    if (!options.click) {
      initRaycasterEvent('click')
    }
    if (!options.dblclick) {
      initRaycasterEvent('dblclick')
    }
    if (!options.mousemove) {
      initRaycasterEvent('mousemove')
    }
  }

  setRaycasterObjects (objList: Object3DWrap[]): void {
    this.raycasterObjects = objList.map(i => i.object3D)
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

  getObject3DWrapList (): Object3DWrap[] {
    return Array.from(this.object3DWrapMap.values())
  }

  animate (): void {
    this.animationId = requestAnimationFrame(this.animateWrap)
    this.emitter.emit(Events.animate)
    this.renderer.render(this.scene, this.camera)
  }

  dispose (): void {
    this.emitter.emit(Events.dispose)
  }
}
