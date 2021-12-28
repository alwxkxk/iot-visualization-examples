import {
  BoxHelper,
  Color,
  Object3D,
  Scene
} from 'three'

export default class BoxHelperWrap {
  boxHelper: BoxHelper
  constructor (scene: Scene, color?: number) {
    const boxColor = color === undefined ? 0x00ffff : color
    this.boxHelper = new BoxHelper(new Object3D(), new Color(boxColor))
    //   Property 'depthTest' does not exist on type 'Material | Material[]'.
    // Property 'depthTest' does not exist on type 'Material[]'
    // @ts-expect-error
    this.boxHelper.material.depthTest = false
    scene.add(this.boxHelper)
  }

  setVisible (flag: boolean): void {
    this.boxHelper.visible = flag
  }

  attach (obj: Object3D): void {
    this.boxHelper.setFromObject(obj)
    this.setVisible(true)
  }

  dispose (): void {
    const parent = this.boxHelper.parent
    if (parent !== null) {
      parent.remove(this.boxHelper)
    }
  }
}
