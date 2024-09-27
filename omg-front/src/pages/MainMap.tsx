import { Suspense, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Character from '@/components/character/Character';
import MainAlert from '@/components/common/MainAlert';
import Map from '@/components/main-map/Map';
import { SocketContext } from '@/utils/SocketContext';
import {
  KeyboardControls,
  OrbitControls,
  PerspectiveCamera,
} from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';

const CharacterInfo = {
  santa: {
    url: '/models/santa/santa.gltf',
    scale: [2, 2, 2],
  },
  elf: {
    url: '/models/elf/elf.gltf',
    scale: [1, 1, 1],
  },
  snowman: {
    url: '/models/snowman/snowman.gltf',
    scale: [1, 1, 1],
  },
  gingerbread: {
    url: '/models/gingerbread/gingerbread.gltf',
    scale: [1, 1, 1],
  },
};

export default function MainMap() {
  const { socket, online, initGameSetting } = useContext(SocketContext);

  useEffect(() => {
    if (socket && online) {
      initGameSetting();
    }
  });

  const Controls = {
    forward: 'forward',
    back: 'back',
    left: 'left',
    right: 'right',
    pickup: 'pickup',
  };

  const keyboardMap = [
    { name: Controls.forward, keys: ['ArrowUp'] },
    { name: Controls.back, keys: ['ArrowDown'] },
    { name: Controls.left, keys: ['ArrowLeft'] },
    { name: Controls.right, keys: ['ArrowRight'] },
    { name: Controls.pickup, keys: ['Space'] },
  ];

  const navigate = useNavigate();

  const goToStockMarket = () => {
    navigate('/stockmarket');
  };

  return (
    <main className='relative w-full h-screen overflow-hidden'>
      <div
        className='absolute z-10 transform -translate-x-1/2 bottom-10 left-1/2 w-[70%]'
        onClick={goToStockMarket}
      >
        <MainAlert text='클릭하면 임시 주식방으로' />
      </div>
      <KeyboardControls map={keyboardMap}>
        <Canvas>
          <Suspense>
            <OrbitControls />
            <Physics>
              <ambientLight />
              <directionalLight />
              <Map />
              <PerspectiveCamera />
              <Character
                characterURL={CharacterInfo['santa'].url}
                characterScale={CharacterInfo['santa'].scale}
              />
              {/* <Character
                characterURL={CharacterInfo['elf'].url}
                characterScale={CharacterInfo['elf'].scale}
              />
              <Character
                characterURL={CharacterInfo['snowman'].url}
                characterScale={CharacterInfo['snowman'].scale}
              />
              <Character
                characterURL={CharacterInfo['gingerbread'].url}
                characterScale={CharacterInfo['gingerbread'].scale}
              /> */}
            </Physics>
          </Suspense>
        </Canvas>
      </KeyboardControls>
    </main>
  );
}
