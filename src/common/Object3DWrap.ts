
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
    if (moveInfo.repeatable !== true && this.checkMoveName(moveInfo)) {
      console.log(`${this.fullName} move ${moveInfo.name} is non repeatable, so don't move repeatedly.`)
      return
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

    const endPositionX: number = moveInfo?.position?.x === undefined ? oldPosition.x : oldPosition.x + moveInfo.position.x
    const endPositionY: number = moveInfo?.position?.y === undefined ? oldPosition.y : oldPosition.y + moveInfo.position.y
    const endPositionZ: number = moveInfo?.position?.z === undefined ? oldPosition.z : oldPosition.z + moveInfo.position.z

    const endRotationX: number = moveInfo?.rotation?.x === undefined ? oldRotation.x : oldRotation.x + degToRad(moveInfo.rotation.x)
    const endRotationY: number = moveInfo?.rotation?.y === undefined ? oldRotation.y : oldRotation.y + degToRad(moveInfo.rotation.y)
    const endRotationZ: number = moveInfo?.rotation?.z === undefined ? oldRotation.z : oldRotation.z + degToRad(moveInfo.rotation.z)

    const endPosition = new Vector3(endPositionX, endPositionY, endPositionZ)
    const endRotation = new Euler(endRotationX, endRotationY, endRotationZ)
    const endLocation = {
      position: endPosition,
      rotation: endRotation
    }
    const startLocation = {
      position: oldLocation.position.clone(),
      rotation: oldLocation.rotation.clone()
    }
    this.moveAction(startLocation, endLocation, moveInfo?.duration === undefined ? 1000 : moveInfo.duration)
  }

  cancelMove (): void {
    if (this.moveTween !== undefined && this.moveTween !== null) {
      this.moveTween.stop()
      this.moveTween = null
    }
  }

  checkMoveName (moveInfo: IMoveInfo): boolean {
    const m = this.moveHistoryList.find(i => i.name.includes(moveInfo.name))
    if (m !== undefined) {
      return true
    }
    return false
  }

  undoMove (): void {
    const moveInfo = this.moveHistoryList.pop()
    const beforeMoveLocation = this.beforeMoveLocation.pop()
    if (moveInfo === undefined || beforeMoveLocation === undefined) {
      console.warn('Dont has any move history.', moveInfo, beforeMoveLocation)
      return
    }

    const endLocation = {
      position: beforeMoveLocation.position,
      rotation: beforeMoveLocation.rotation
    }
    const startLocation = {
      position: this.object3D.position.clone(),
      rotation: this.object3D.rotation.clone()
    }
    this.moveAction(startLocation, endLocation, moveInfo?.duration === undefined ? 1000 : moveInfo.duration)
  }

  moveAction (startLocation: ILocationInfo, endLocation: ILocationInfo, duration: number): void {
    this.moveTween = new Tween(startLocation)
      .to(endLocation, duration)
      .easing(Easing.Quadratic.Out)
      // .onStart(() => {})
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
  // #endregion move

  dispose (): void {
    Object.keys(this).forEach(key => {
    // @ts-expect-error
      this[key] = null
    })
  }
}
