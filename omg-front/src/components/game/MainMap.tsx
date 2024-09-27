import { Suspense, useMemo } from 'react';

import GingerBread from '@/components/character/GingerBread';
import Map from '@/components/game/Map';
import {
  KeyboardControls,
  type KeyboardControlsEntry,
  OrbitControls,
} from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';

// import * as THREE from 'three';
import IntroCamera from '../camera/IntroCamera';

export enum Controls {
  forward = 'forward',
  back = 'back',
  left = 'left',
  right = 'right',
  pickup = 'pickup',
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
            <OrbitControls />
            <axesHelper args={[800]} />
            <IntroCamera />
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
