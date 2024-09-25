import { Suspense, useMemo } from 'react';

// 상태 저장소 가져오기
import Elf from '@/components/character/Elf';
import GingerBread from '@/components/character/GingerBread';
import Santa from '@/components/character/Santa';
import Snowman from '@/components/character/Snowman';
import Map from '@/components/main-map/Map';
import useCharacterStore from '@/stores/useCharacter';
import {
  KeyboardControls,
  type KeyboardControlsEntry,
  OrbitControls,
  PerspectiveCamera,
} from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';

export enum Controls {
  forward = 'forward',
  back = 'back',
  left = 'left',
  right = 'right',
  pickup = 'pickup',
}

const characterComponents = [Elf, GingerBread, Santa, Snowman]; // 캐릭터 컴포넌트 배열

export default function MainMap() {
  const { players } = useCharacterStore();

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
          <Suspense>
            <OrbitControls />
            <Physics>
              <ambientLight />
              <directionalLight />
              <Map />
              <PerspectiveCamera />

              {Object.keys(players).map(nickname => {
                const player = players[nickname];
                const PlayerCharacter =
                  characterComponents[player.characterType];
                return <PlayerCharacter key={nickname} />;
              })}
            </Physics>
          </Suspense>
        </Canvas>
      </KeyboardControls>
    </main>
  );
}
