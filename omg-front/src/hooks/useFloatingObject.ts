import { useRef } from 'react';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const useFloatingObject = (initialYPosition: number) => {
  const ref = useRef<THREE.Object3D>(null);

  let speed = 0.005;
  let direction = 1;

  // 애니메이션 추가
  useFrame(() => {
    if (ref.current) {
      // 회전 => 속도 좀 더 빠르게
      ref.current.rotation.y += speed * 8;

      // 위 아래 => 기본 속도
      ref.current.position.y += direction * speed;

      // 일정 범위 내에서 위 아래 방향을 전환
      if (
        ref.current.position.y > initialYPosition + 0.2 ||
        ref.current.position.y < initialYPosition
      ) {
        direction *= -1; // 방향 전환
      }

      // Y축 위치를 제한
      if (ref.current.position.y > initialYPosition + 0.2) {
        ref.current.position.y = initialYPosition + 0.2;
      } else if (ref.current.position.y < initialYPosition) {
        ref.current.position.y = initialYPosition;
      }
    }
  });

  return ref; // 참조 반환
};
