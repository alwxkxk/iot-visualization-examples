
import { Euler, Object3D, Vector3, Math } from 'three'
import { Easing, Tween } from '@tweenjs/tween.js'

const degToRad = Math.degToRad
interface IMoveInfo{
  name: string
  duration?: number
  repeatable?: boolean
  position?: {
    x?: number
    y?: number
    z?: number
  }
  rotation?: {
    x?: number
    y?: number
    z?: number
  }
}

interface ILocationInfo{
  position: Vector3
  rotation: Euler
}
export default class Object3DWrap {
  object3D: Object3D
  uuid: string
  fullName: string
  moveHistoryList: IMoveInfo[]
  beforeMoveLocation: ILocationInfo[]
  moveTween: Tween<any>|null

  constructor (object3D: Object3D) {
    this.object3D = object3D
    this.uuid = object3D.uuid

    this.getFullName()
  }

  getFullName (): void {
    const list = []
    let obj: Object3D | null = this.object3D
    while (obj !== undefined && obj !== null) {
      list.unshift(obj.name)
      obj = obj.parent
    }
    this.fullName = list.join('/')
  }

  // #region move
  move (moveInfo: IMoveInfo): void {
    if (this.moveHistoryList === undefined) {
      this.moveHistoryList = []
      this.beforeMoveLocation = []
    }
    if (moveInfo.repeatable !== true) {
      const oldMoveInfo = this.moveHistoryList.find(item => item.name === moveInfo.name)
      if (oldMoveInfo !== undefined) {
        console.log(`${this.fullName} move ${moveInfo.name} is non repeatable, so don't move repeatedly.`)
        return
      }
    }
    this.cancelMove()
    const oldPosition = this.object3D.position.clone()
    const oldRotation = this.object3D.rotation.clone()
    const oldLocation = {
      position: oldPosition,
      rotation: oldRotation
    }
    this.beforeMoveLocation.push(oldLocation)
    this.moveHistoryList.push(moveInfo)

    const newPositionX: number = moveInfo?.position?.x === undefined ? oldPosition.x : oldPosition.x + moveInfo.position.x
    const newPositionY: number = moveInfo?.position?.y === undefined ? oldPosition.y : oldPosition.y + moveInfo.position.y
    const newPositionZ: number = moveInfo?.position?.z === undefined ? oldPosition.z : oldPosition.z + moveInfo.position.z

    const newRotationX: number = moveInfo?.rotation?.x === undefined ? oldRotation.x : oldRotation.x + degToRad(moveInfo.rotation.x)
    const newRotationY: number = moveInfo?.rotation?.y === undefined ? oldRotation.y : oldRotation.y + degToRad(moveInfo.rotation.y)
    const newRotationZ: number = moveInfo?.rotation?.z === undefined ? oldRotation.z : oldRotation.z + degToRad(moveInfo.rotation.z)

    const newPosition = new Vector3(newPositionX, newPositionY, newPositionZ)
    const newRotation = new Euler(newRotationX, newRotationY, newRotationZ)
    const newLocation = {
      position: newPosition,
      rotation: newRotation
    }
    const startLocation = {
      position: oldLocation.position.clone(),
      rotation: oldLocation.rotation.clone()
    }

    this.moveTween = new Tween(startLocation)
      .to(newLocation, moveInfo.duration !== undefined ? moveInfo.duration : 1000)
      .easing(Easing.Quadratic.Out)
      .onStart(() => {})
      .onUpdate(() => {
        // console.log('startLocation', startLocation.rotation.y)
        const position = startLocation.position
        const rotation = startLocation.rotation
        this.object3D.position.set(position.x, position.y, position.z)
        this.object3D.rotation.set(rotation.x, rotation.y, rotation.z)
      })
      .onStop(() => {
        this.moveTween = null
      })
      .onComplete(() => {
        this.moveTween = null
      })
      .start()

    const animate = (time: DOMHighResTimeStamp): void => {
      if (this.moveTween !== null) {
        requestAnimationFrame(animate)
        this.moveTween.update(time)
      }
    }
    animate(0)
  }

  cancelMove (): void {
    if (this.moveTween !== undefined && this.moveTween !== null) {
      this.moveTween.stop()
      this.moveTween = null
    }
  }

  checkMove (moveInfo: IMoveInfo): boolean {
    return false
  }

  undoMove (): void {}
  // #endregion move
}
