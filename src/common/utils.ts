import { interpolateNumber } from 'd3-interpolate'
import { Box3, Color, DoubleSide, Object3D, ShaderMaterial, Vector3 } from 'three'
import { IOffset3 } from '../type'
import Space from './Space'

const box3 = new Box3()
const vector3 = new Vector3()

/**
 * Finding object3D parent(include itself) circularly until callback return true.
 * If don't find the parent match the callback,it will return null.
 * @param  {Object3D} object3d
 * @param  {(obj:Object3D)=>boolean} callback
 * @returns {Object3D|null}
 */
export function findParent (object3d: Object3D, callback: (obj: Object3D) => boolean): Object3D |null {
  let parent: Object3D|null = object3d
  while (!callback(parent)) {
    parent = parent.parent
    if (parent === null) {
      return null
    }
  }
  return parent
}

/**
 * Finding object3D children(include itself) circularly until callback return true.
 * If don't find the child match the callback,it will return null.
 * @param  {Object3D} object3d
 * @param  {(obj:Object3D)=>boolean} callback
 * @returns {Object3D|null}
 */
export function findChildren (object3D: Object3D, callback: (obj: Object3D) => boolean): Object3D |null {
  const children: Object3D[] = []
  object3D.traverse(obj => children.push(obj))
  const result = children.find(callback)
  if (result !== undefined) {
    return result
  } else {
    return null
  }
}

export function checkNameIncludes (obj: Object3D, str: string): boolean {
  if (obj.name.includes(str)) {
    return true
  } else {
    return false
  }
}
/**
 * get screen position by object3D.
 * @param  {Object3D} obj three.js object3D
 * @param  {Space} space Space instance
 * @param  {IOffset3} offset position offset set by interpolate from object size
 * @returns {Object}
 */
export function getScreenPosition (obj: Object3D, space: Space, offset?: IOffset3): {x: number, y: number} {
  // default is object3D center
  const p = {
    x: offset?.x !== undefined ? offset?.x : 0.5,
    y: offset?.y !== undefined ? offset?.y : 0.5,
    z: offset?.z !== undefined ? offset?.z : 0.5
  }
  const result = { x: 0, y: 0 }
  const widthHalf = space.innerWidth / 2
  const heightHalf = space.innerHeight / 2

  box3.setFromObject(obj)
  const ix = interpolateNumber(box3.min.x, box3.max.x)
  const iy = interpolateNumber(box3.min.y, box3.max.y)
  const iz = interpolateNumber(box3.min.z, box3.max.z)

  vector3.set(
    ix(p.x),
    iy(p.y),
    iz(p.z)
  )
  vector3.project(space.camera)
  result.x = vector3.x * widthHalf + widthHalf + space.offset.left
  result.y = -(vector3.y * heightHalf) + heightHalf + space.offset.top
  return result
}

export function initCapacityMaterial (value: number, color: string): ShaderMaterial {
  const vertexShader = `
  varying vec3 vPosition;
  void main() 
  {
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    vPosition = position;
  }
  `

  const fragmentShader = `
  varying vec3 vPosition;
  uniform vec3 fillColor;
  uniform float splitValue;
  void main() 
  {
    // if position.y less than splitValue,don't render color.
    if(vPosition.y> splitValue ){
      discard;
    }else{
      gl_FragColor = vec4( fillColor, 0.8 );
    }
  }
  `

  const customMaterial = new ShaderMaterial({
    uniforms:
    {
      splitValue: { type: 'f', value: value },
      fillColor: { type: 'c', value: new Color(color) }
    },
    side: DoubleSide,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader
  })
  return customMaterial
}

export function detectWebGLContext (): boolean {
  // Create canvas element. The canvas is not added to the
  // document itself, so it is never displayed in the
  // browser window.
  const canvas = document.createElement('canvas')
  // Get WebGLRenderingContext from canvas element.

  const gl = canvas?.getContext('webgl')
  // Report the result.
  if (gl !== undefined && gl !== null && gl instanceof WebGLRenderingContext) {
    return true
  } else {
    return false
  }
}
