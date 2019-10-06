import { Objects } from "../../type";

export function resetCoordinate(obj: Objects) {
  obj.position.set(0, 0, 0);
  obj.scale.set(1, 1, 1);
  obj.rotation.set(0, 0, 0);
}

export function copyCoordinate(from: Objects, to: Objects) {
  to.position.copy(from.position.clone());
  to.scale.copy(from.scale.clone());
  to.rotation.copy(from.rotation.clone());
}

export function hasGeometry(obj: Objects): boolean {
  // @ts-ignore
  return !!obj.geometry;
}

const colorRGBA = {
  dangerous: "rgb(244,67,54)",
  much: "rgb(255,235,59)",
  over: "rgb(255,152,0)",
  safe: "rgb(139,195,74)",
};

export function getColorByValue(value: number) {
  let result;
  if (value < 50) {
    result = colorRGBA.safe;
  } else if (value < 80) {
    result = colorRGBA.much;
  } else if (value < 90) {
    result = colorRGBA.over;
  } else {
    result = colorRGBA.dangerous;
  }

  return result;
}
