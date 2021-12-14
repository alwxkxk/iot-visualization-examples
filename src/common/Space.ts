import * as mitt from 'mitt'
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
  WebGLRenderer
} from 'three'
import ObjectWrap from './ObjectWrap'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

interface ISpaceOptions {
  orbit?: boolean
}

export default class Space {
  element: HTMLElement
  options: ISpaceOptions
  emitter: mitt.Emitter
  renderer: WebGLRenderer
  innerWidth: number
  innerHeight: number
  ObjectWrapMap: Map<string, ObjectWrap>
  offset: DOMRect
  raycaster: Raycaster
  mouse: Vector2
  scene: Scene
  camera: PerspectiveCamera
  constructor (element: HTMLElement, options?: ISpaceOptions) {
    this.element = element
    this.options = { ...options }
    this.init()
    return this
  }

  init (): void {
    this.emitter = mitt()
    const ele = this.element
    this.renderer = new WebGLRenderer({ alpha: true, antialias: true })

    if (ele.clientHeight === 0 || ele.clientWidth === 0) {
      throw new Error('element should had width and height before init.')
    }

    this.innerWidth = ele.clientWidth
    this.innerHeight = ele.clientHeight
    this.offset = ele.getBoundingClientRect()

    this.ObjectWrapMap = new Map()

    this.renderer.setSize(this.innerWidth, this.innerHeight)
    ele.appendChild(this.renderer.domElement)

    this.raycaster = new Raycaster()
    this.mouse = new Vector2()

    // this.controllerMap = '123';
  }

  async load (fileUrl: string): Promise<any> {
    return await new Promise((resolve, reject) => {
      const gltfLoader = new GLTFLoader()
      const loader = new FileLoader(DefaultLoadingManager)
      loader.setResponseType('arraybuffer')
      loader.load(fileUrl,
        function loaded (data: any) {
          const resourcePath = LoaderUtils.extractUrlBase(fileUrl)
          console.time('load gltf')
          gltfLoader.parse(data, resourcePath,
            (gltf: object) => {
              console.timeEnd('load gltf')
              console.log(gltf)
              this.afterLoaded(gltf)
              resolve('')
            },
            (error: any) => {
              reject(error)
            }
          )
        },
        function progressing (xhr: any) {
          console.log(`${(xhr.loaded / xhr.total * 100)}% loaded`)
        },
        function loadedError (event: ErrorEvent) {
          reject(event)
        })
    })
  }

  afterLoaded (gltf: any): Space {
    const scene = this.scene = gltf.scene
    this.camera = new PerspectiveCamera(20, this.innerWidth / this.innerHeight, 0.1, 1000)
    scene.add(this.camera)
    scene.add(new HemisphereLight(0xffffff, 0xffffff, 1))

    scene.traverse((item: Object3D) => {
      if (item.type !== 'Scene') {
        const ObjectWrap = new ObjectWrap(item)
        this.ObjectWrapMap.set(ObjectWrap.uuid, ObjectWrap)
      }
    })

    return this
  }
}
