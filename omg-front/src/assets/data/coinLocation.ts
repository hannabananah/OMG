import * as THREE from 'three';

// 돈줍기 좌표
export const point = {
  point1: [new THREE.Vector3(3, -7, -10)],
  point2: [new THREE.Vector3(-2, -7, 20)],
  point3: [new THREE.Vector3(-17, -7, 10)],
  point4: [new THREE.Vector3(-19, -7, 8)],
  point5: [new THREE.Vector3(-24, -7, -8)],
  point6: [new THREE.Vector3(100, -7, -16)],
  point7: [new THREE.Vector3(103, -7, 22)],
  point8: [new THREE.Vector3(90, -7, 28)],
  point9: [new THREE.Vector3(55, -7, 78)],

  point10: [
    new THREE.Vector3(-3, -7, 18),
    new THREE.Vector3(-3, -7, 19),
    new THREE.Vector3(-3, -7, 20),
  ],

  point11: [
    new THREE.Vector3(28, -7, -10),
    new THREE.Vector3(29, -7, -10),
    new THREE.Vector3(30, -7, -10),
  ],

  point12: [
    new THREE.Vector3(5, -7, -16),
    new THREE.Vector3(5, -7, -15),
    new THREE.Vector3(5, -7, -14),
    new THREE.Vector3(5, -7, -13),
    new THREE.Vector3(5, -7, -12),
    new THREE.Vector3(5, -7, -11),
    new THREE.Vector3(5, -7, -10),
    new THREE.Vector3(5, -7, -9),
    new THREE.Vector3(5, -7, -8),
  ],

  point13: [
    new THREE.Vector3(0, -7, -10),
    new THREE.Vector3(0, -7, -9),
    new THREE.Vector3(0, -7, -8),
    new THREE.Vector3(0, -7, -7),
    new THREE.Vector3(0, -7, -6),
    new THREE.Vector3(0, -7, -5),
    new THREE.Vector3(0, -7, -4),
    new THREE.Vector3(0, -7, -3),
    new THREE.Vector3(0, -7, -2),
    new THREE.Vector3(0, -7, -1),
    new THREE.Vector3(0, -7, 0),
    new THREE.Vector3(0, -7, 1),
    new THREE.Vector3(0, -7, 2),
    new THREE.Vector3(0, -7, 3),
    new THREE.Vector3(0, -7, 4),
    new THREE.Vector3(0, -7, 5),
    new THREE.Vector3(0, -7, 6),
    new THREE.Vector3(0, -7, 7),
    new THREE.Vector3(0, -7, 8),
    new THREE.Vector3(0, -7, 9),
    new THREE.Vector3(0, -7, 10),
    new THREE.Vector3(0, -7, 11),
    new THREE.Vector3(0, -7, 12),
    new THREE.Vector3(0, -7, 13),
    new THREE.Vector3(0, -7, 14),
    new THREE.Vector3(0, -7, 15),
    new THREE.Vector3(0, -7, 16),
    new THREE.Vector3(0, -7, 17),
    new THREE.Vector3(0, -7, 18),
    new THREE.Vector3(0, -7, 19),
    new THREE.Vector3(0, -7, 20),
  ],

  point14: [
    new THREE.Vector3(-23, -7, -6),
    new THREE.Vector3(-23, -7, -5),
    new THREE.Vector3(-23, -7, -4),
    new THREE.Vector3(-23, -7, -3),
    new THREE.Vector3(-23, -7, -2),
    new THREE.Vector3(-23, -7, -1),
    new THREE.Vector3(-23, -7, 0),
    new THREE.Vector3(-23, -7, 1),
    new THREE.Vector3(-23, -7, 2),
    new THREE.Vector3(-23, -7, 3),
    new THREE.Vector3(-23, -7, 4),
    new THREE.Vector3(-23, -7, 5),
  ],

  point15: [
    new THREE.Vector3(-17, -7, 13),
    new THREE.Vector3(-16, -7, 13),
    new THREE.Vector3(-15, -7, 13),
    new THREE.Vector3(-14, -7, 13),
    new THREE.Vector3(-13, -7, 13),
    new THREE.Vector3(-12, -7, 13),
    new THREE.Vector3(-11, -7, 13),
    new THREE.Vector3(-10, -7, 13),
    new THREE.Vector3(-9, -7, 13),
    new THREE.Vector3(-8, -7, 13),
    new THREE.Vector3(-7, -7, 13),
    new THREE.Vector3(-6, -7, 13),
  ],

  point16: [
    new THREE.Vector3(-14, -7, 73),
    new THREE.Vector3(-15, -7, 73),
    new THREE.Vector3(-16, -7, 73),
    new THREE.Vector3(-17, -7, 73),
    new THREE.Vector3(-18, -7, 73),
    new THREE.Vector3(-19, -7, 73),
    new THREE.Vector3(-20, -7, 73),
  ],

  point17: [
    new THREE.Vector3(80, -7, 22),
    new THREE.Vector3(81, -7, 22),
    new THREE.Vector3(82, -7, 22),
    new THREE.Vector3(83, -7, 22),
  ],
};

export const isPoint = (
  position: THREE.Vector3,
  points: Record<string, THREE.Vector3[]>,
): string | null => {
  for (const key in points) {
    const foundPoint = points[key].find(p => position.distanceTo(p) < 3);
    if (foundPoint) {
      return key;
    }
  }
  return null;
};
