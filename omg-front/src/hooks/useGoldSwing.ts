import { useRef } from 'react';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function useGoldSwing(speed = 0.02, amplitude = 0.5) {
  const swingRef = useRef<THREE.Group>(null); // 그룹을 사용해 피벗 설정

  useFrame(state => {
    if (swingRef.current) {
      // z축 기준으로 흔들리게 설정 (위쪽 기준으로 좌우로 흔들림)
      swingRef.current.rotation.z =
        Math.sin(state.clock.elapsedTime * speed) * amplitude;
    }
  });

  return swingRef;
}
