import { useMemo, useRef } from 'react';

import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SNOW_COUNT = 1000; // 눈 입자 개수
const SNOW_SIZE = 1; // 눈 입자의 크기
const XZ_RANGE = 100; // X와 Z 좌표의 범위 (-50 ~ 50)
const Y_RANGE = 100; // Y 좌표의 범위 (0 ~ 100)
const SPEED_MIN = 0.02; // 속도의 최소값
const SPEED_MAX = 0.1; // 속도의 최대값
const RESET_HEIGHT = 100; // 눈이 떨어진 후 다시 시작할 Y 좌표의 높이

export default function Snowing() {
  // const particleCount: number = 1000; // 눈 입자 개수
  const texture = useTexture('/assets/snow.png'); // 눈 모양

  // 위치
  const positions: Float32Array = useMemo(() => {
    const pos: number[] = [];
    for (let i = 0; i < SNOW_COUNT; i++) {
      pos.push((Math.random() - 0.5) * XZ_RANGE); // X 좌표
      pos.push(Math.random() * Y_RANGE); // Y 좌표 (위에서 떨어지게)
      pos.push((Math.random() - 0.5) * XZ_RANGE); // Z 좌표
    }
    return new Float32Array(pos);
  }, []);

  // 속도
  const speeds: Float32Array = useMemo(() => {
    return new Float32Array(
      Array.from(
        { length: SNOW_COUNT },
        () => Math.random() * SPEED_MAX + SPEED_MIN,
      ),
    );
  }, []);

  const ref = useRef<THREE.Points>(null);

  useFrame(() => {
    if (ref.current) {
      const positions = ref.current.geometry.attributes.position
        .array as Float32Array;

      for (let i = 0; i < SNOW_COUNT * 3; i += 3) {
        positions[i + 1] -= speeds[i / 3]; // Y 좌표 감소 (눈이 떨어짐)

        if (positions[i + 1] < 0) {
          positions[i + 1] = RESET_HEIGHT; // 땅에 도달하면 다시 위로 이동
        }
      }

      ref.current.geometry.attributes.position.needsUpdate = true; // 위치 변화를 three.js에 알리는 플래그
    }
  });

  return (
    <points ref={ref}>
      {/* 눈 입자의 좌표 데이터(x, y, z) 저장하는 컨테이너 */}
      <bufferGeometry>
        <bufferAttribute
          attach='attributes-position'
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        color={0xffffff}
        size={SNOW_SIZE}
        sizeAttenuation={true}
        transparent={true}
        opacity={0.8}
        alphaTest={0.5}
      />
    </points>
  );
}
