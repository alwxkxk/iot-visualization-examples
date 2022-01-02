import { Object3D } from 'three'

/**
 * Finding object3D parent(include itself) circularly until callback return true.
 * If don't find the parent match the callback,it will return null.
 * @param  {Object3D} object3d
 * @param  {(obj:Object3D)=>Boolean} callback
 * @returns {Object3D|null}
 */
export function findParent (object3d: Object3D, callback: (obj: Object3D) => Boolean): Object3D |null {
  let parent: Object3D|null = object3d
  while (callback(parent) === false) {
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
 * @param  {(obj:Object3D)=>Boolean} callback
 * @returns {Object3D|null}
 */
export function findChildren (object3D: Object3D, callback: (obj: Object3D) => Boolean): Object3D |null {
  const children: Object3D[] = []
  object3D.traverse(obj => children.push(obj))
  const result = children.find(callback)
  if (result !== undefined) {
    return result
  } else {
    return null
  }
}

export function checkNameIncludes (obj: Object3D, str: string): Boolean {
  if (obj.name.includes(str)) {
    return true
  } else {
    return false
  }
}
