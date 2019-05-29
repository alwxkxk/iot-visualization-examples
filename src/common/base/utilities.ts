export function resetCoordinate(obj: Objects){
  obj.position.set(0, 0, 0);
  obj.scale.set(1, 1, 1);
  obj.rotation.set(0, 0, 0);
}

export function copyCoordinate(from: Objects, to: Objects){
  to.position.copy(from.position.clone());
  to.scale.copy(from.scale.clone());
  to.rotation.copy(from.rotation.clone());
}
