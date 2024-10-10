import { useRef } from 'react';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const useGoldFloating = (initialYPosition: number) => {
  const ref = useRef<THREE.Object3D>(null);

  let speed = 0.01; // 회전 속도
  let direction = 1;
  const amplitude = 0.5; // 상하 이동 범위 확대

  useFrame(() => {
    if (ref.current) {
      // 모델이 x축과 y축으로 회전
      ref.current.rotation.y += speed * 4;
      ref.current.rotation.x += speed * 2;

      // 모델이 상하로 크게 움직이도록 설정
      ref.current.position.y += direction * speed * 2;

      // 상하 움직임이 일정 범위를 넘으면 방향을 반대로 전환
      if (
        ref.current.position.y > initialYPosition + amplitude ||
        ref.current.position.y < initialYPosition - amplitude
      ) {
        direction *= -1;
      }
    }
  });

  return ref;
};
