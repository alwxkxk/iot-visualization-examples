import { Material, Object3D } from 'three'

interface IPoint {
  x: number
  y: number
  value: number
}

interface IOffset3 {
  x?: number
  y?: number
  z?: number
}

interface IObject3DWithMaterial extends Object3D {
  material: Material
}
