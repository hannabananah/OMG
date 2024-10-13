import * as THREE from 'three';

// 돈줍기 좌표
export const point = {
  point1: [new THREE.Vector3(3, -7.5, -10)],
  point2: [new THREE.Vector3(-2, -7.5, 20)],
  point3: [new THREE.Vector3(-17, -7.5, 10)],
  point4: [new THREE.Vector3(-19, -7.5, 8)],
  point5: [new THREE.Vector3(-24, -7.5, -8)],
  point6: [new THREE.Vector3(100, -7.5, -16)],
  point7: [new THREE.Vector3(103, -7.5, 22)],
  point8: [new THREE.Vector3(90, -7.5, 28)],
  point9: [new THREE.Vector3(55, -7.5, 78)],

  point10: [
    new THREE.Vector3(-3, -7.5, 18),
    new THREE.Vector3(-3, -7.5, 19),
    new THREE.Vector3(-3, -7.5, 20),
  ],

  point11: [
    new THREE.Vector3(28, -7.5, -10),
    new THREE.Vector3(29, -7.5, -10),
    new THREE.Vector3(30, -7.5, -10),
  ],

  point12: [
    new THREE.Vector3(5, -7.5, -16),
    new THREE.Vector3(5, -7.5, -15),
    new THREE.Vector3(5, -7.5, -14),
    new THREE.Vector3(5, -7.5, -13),
    new THREE.Vector3(5, -7.5, -12),
    new THREE.Vector3(5, -7.5, -11),
    new THREE.Vector3(5, -7.5, -10),
    new THREE.Vector3(5, -7.5, -9),
    new THREE.Vector3(5, -7.5, -8),
  ],

  point13: [
    new THREE.Vector3(0, -7.5, -10),
    new THREE.Vector3(0, -7.5, -9),
    new THREE.Vector3(0, -7.5, -8),
    new THREE.Vector3(0, -7.5, -7),
    new THREE.Vector3(0, -7.5, -6),
    new THREE.Vector3(0, -7.5, -5),
    new THREE.Vector3(0, -7.5, -4),
    new THREE.Vector3(0, -7.5, -3),
    new THREE.Vector3(0, -7.5, -2),
    new THREE.Vector3(0, -7.5, -1),
    new THREE.Vector3(0, -7.5, 0),
    new THREE.Vector3(0, -7.5, 1),
    new THREE.Vector3(0, -7.5, 2),
    new THREE.Vector3(0, -7.5, 3),
    new THREE.Vector3(0, -7.5, 4),
    new THREE.Vector3(0, -7.5, 5),
    new THREE.Vector3(0, -7.5, 6),
    new THREE.Vector3(0, -7.5, 7),
    new THREE.Vector3(0, -7.5, 8),
    new THREE.Vector3(0, -7.5, 9),
    new THREE.Vector3(0, -7.5, 10),
    new THREE.Vector3(0, -7.5, 11),
    new THREE.Vector3(0, -7.5, 12),
    new THREE.Vector3(0, -7.5, 13),
    new THREE.Vector3(0, -7.5, 14),
    new THREE.Vector3(0, -7.5, 15),
    new THREE.Vector3(0, -7.5, 16),
    new THREE.Vector3(0, -7.5, 17),
    new THREE.Vector3(0, -7.5, 18),
    new THREE.Vector3(0, -7.5, 19),
    new THREE.Vector3(0, -7.5, 20),
  ],

  point14: [
    new THREE.Vector3(-23, -7.5, -6),
    new THREE.Vector3(-23, -7.5, -5),
    new THREE.Vector3(-23, -7.5, -4),
    new THREE.Vector3(-23, -7.5, -3),
    new THREE.Vector3(-23, -7.5, -2),
    new THREE.Vector3(-23, -7.5, -1),
    new THREE.Vector3(-23, -7.5, 0),
    new THREE.Vector3(-23, -7.5, 1),
    new THREE.Vector3(-23, -7.5, 2),
    new THREE.Vector3(-23, -7.5, 3),
    new THREE.Vector3(-23, -7.5, 4),
    new THREE.Vector3(-23, -7.5, 5),
  ],

  point15: [
    new THREE.Vector3(-17, -7.5, 13),
    new THREE.Vector3(-16, -7.5, 13),
    new THREE.Vector3(-15, -7.5, 13),
    new THREE.Vector3(-14, -7.5, 13),
    new THREE.Vector3(-13, -7.5, 13),
    new THREE.Vector3(-12, -7.5, 13),
    new THREE.Vector3(-11, -7.5, 13),
    new THREE.Vector3(-10, -7.5, 13),
    new THREE.Vector3(-9, -7.5, 13),
    new THREE.Vector3(-8, -7.5, 13),
    new THREE.Vector3(-7, -7.5, 13),
    new THREE.Vector3(-6, -7.5, 13),
  ],

  point16: [
    new THREE.Vector3(-14, -7.5, 73),
    new THREE.Vector3(-15, -7.5, 73),
    new THREE.Vector3(-16, -7.5, 73),
    new THREE.Vector3(-17, -7.5, 73),
    new THREE.Vector3(-18, -7.5, 73),
    new THREE.Vector3(-19, -7.5, 73),
    new THREE.Vector3(-20, -7.5, 73),
  ],

  point17: [
    new THREE.Vector3(80, -7.5, 22),
    new THREE.Vector3(81, -7.5, 22),
    new THREE.Vector3(82, -7.5, 22),
    new THREE.Vector3(83, -7.5, 22),
  ],
};

export const isPoint = (
  position: THREE.Vector3,
  points: Record<string, THREE.Vector3[]>,
): boolean => {
  for (const key in points) {
    const foundPoint = points[key].find(p => position.distanceTo(p) < 1.5);
    if (foundPoint) {
      return true;
    }
  }
  return false;
};
