import './common/global_setting'
import { Object3D } from 'three'
import BoxHelperWrap from './common/BoxHelperWrap'
import Events from './common/Events'
import Object3DWrap from './common/Object3DWrap'
import Space from './common/Space'
import { findParent } from './common/utils'

const element = document.getElementById('3d-space')
if (element === null) {
  throw new Error('#3d-space element dont exist.')
}
const space = new Space(element)
function checkIsRack (obj: Object3D): Boolean {
  if (obj.name.includes('rack')) {
    return true
  } else {
    return false
  }
}

space.emitter.on(Events.load.processing, (xhr) => {
  const ele = document.getElementById('loading-text')
  if (ele !== null) {
    ele.innerText = `Loading 3d model:${(xhr.loaded / 1024).toFixed(0)}KB`
  }
})

// load 3d model.
space.load('./static/3d/datacenter-0715.glb').then(() => {
  const ele = document.getElementById('loading-tips')
  if (ele !== null) {
    ele.style.display = 'none'
  }

  const objectWrapList = space.getObject3DWrapList()
  const rackList: Object3DWrap[] = []
  objectWrapList.forEach(item => {
    if (item.object3D.name.includes('rack')) {
      rackList.push(item)
    }
  })
  console.log('rackList', rackList)
  space.initRaycaster(rackList)
  const boxHelperWrap = new BoxHelperWrap(space.scene)

  space.emitter.on(Events.click.raycaster, (list) => {
    console.log('click', list)
  })
  space.emitter.on(Events.mousemove.raycaster, (list) => {
    // console.log('mousemove', list)
    if (list.length > 0) {
      const rack = findParent(list[0].object, checkIsRack)
      if (rack !== null) {
        boxHelperWrap.attach(rack)
      }
    } else {
      boxHelperWrap.setVisible(false)
    }
  })
}).catch((err) => {
  console.log(err)
})
