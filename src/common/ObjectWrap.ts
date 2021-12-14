import { Object3D } from 'three'

export default class ObjectWrap {
  object3D: Object3D
  uuid: string
  constructor (object3D: Object3D) {
    this.object3D = object3D
    this.uuid = object3D.uuid
  }
}
