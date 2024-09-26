import { useRef } from 'react';

import { useGLTF } from '@react-three/drei';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SocksProps {
  onClick: (event: ThreeEvent<PointerEvent>) => void;
  disabled: boolean;
}

export default function Socks({ onClick, disabled }: SocksProps) {
  const { scene } = useGLTF('/models/socks/socks.gltf');
  const ref = useRef<THREE.Object3D>(null);

  let speed = 0.005;
  let direction = 1;

  // 양말에 애니메이션 추가
  useFrame(() => {
    if (ref.current) {
      // 회전 => 속도 좀 더 빠르게
      ref.current.rotation.y += speed * 8;

      // 위 아래 => 기본 속도
      ref.current.position.y += direction * speed;

      // 일정 범위 내에서 위 아래 방향을 전환
      if (ref.current.position.y > 1.2 || ref.current.position.y < 1) {
        direction *= -1; // 방향 전환
      }
    }
  });

  return (
    <>
      <primitive
        ref={ref} // useRef로 참조 설정
        object={scene}
        position={[2, 1, -2.3]}
        scale={[0.5, 0.5, 0.5]}
        rotation={[0, 0, 0]} // 초기 회전 상태
        onClick={onClick}
        disabled={disabled}
      />
    </>
  );
}
