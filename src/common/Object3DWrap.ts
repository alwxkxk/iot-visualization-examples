
import { Object3D } from 'three'

export default class Object3DWrap {
  object3D: Object3D
  uuid: string
  fullName: string
  constructor (object3D: Object3D) {
    this.object3D = object3D
    this.uuid = object3D.uuid
    this.parseName()
  }

  parseName (): void {
    const list = []
    let obj: Object3D | null = this.object3D
    while (obj !== undefined && obj !== null) {
      list.unshift(obj.name)
      obj = obj.parent
    }
    this.fullName = list.join('/')
  }
}
