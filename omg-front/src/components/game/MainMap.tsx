import { Suspense, useMemo, useRef, useState } from 'react';

import GingerBread from '@/components/character/GingerBread';
import Map from '@/components/game/Map';
import {
  KeyboardControls,
  type KeyboardControlsEntry,
  PerspectiveCamera,
} from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import * as THREE from 'three';

export enum Controls {
  forward = 'forward',
  back = 'back',
  left = 'left',
  right = 'right',
  pickup = 'pickup',
}

function CameraController() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const [zoomedIn, setZoomedIn] = useState(false);
  const radius = 20; // 원의 반지름
  const speed = 0.5; // 카메라 회전 속도

  useFrame((state, delta) => {
    if (!zoomedIn && cameraRef.current) {
      const camera = cameraRef.current;
      const elapsedTime = state.clock.getElapsedTime(); // 시간 경과
      const targetZoom = 5;

      // 카메라를 원을 그리며 회전
      const x = Math.cos(elapsedTime * speed) * radius;
      const z = Math.sin(elapsedTime * speed) * radius;

      // 줌인 애니메이션을 적용하면서 원을 돌게 만듦
      const zoomFactor = Math.max(10 - elapsedTime * 2, targetZoom); // 점진적 줌인
      camera.position.set(x, zoomFactor, z);
      camera.lookAt(0, 0, 0); // 맵의 중심을 바라봄

      // 줌이 완료되면 상태를 업데이트
      if (zoomFactor <= targetZoom) {
        setZoomedIn(true);
      }
    }
  });

  return (
    <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 10, 20]} />
  );
}

export default function MainMap() {
  const keyboardMap = useMemo<KeyboardControlsEntry<Controls>[]>(
    () => [
      { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
      { name: Controls.back, keys: ['ArrowDown', 'KeyS'] },
      { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
      { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
      { name: Controls.pickup, keys: ['Space'] },
    ],
    [],
  );

  return (
    <main className='relative w-full h-screen p-1'>
      <KeyboardControls map={keyboardMap}>
        <Canvas>
          <Suspense fallback={null}>
            <CameraController />
            <Physics>
              <ambientLight />
              <directionalLight />
              <Map />
              <GingerBread />
            </Physics>
          </Suspense>
        </Canvas>
      </KeyboardControls>
    </main>
  );
}
