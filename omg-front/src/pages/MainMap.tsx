import { Suspense, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Character from '@/components/character/Character';
import MainAlert from '@/components/common/MainAlert';
import Map from '@/components/main-map/Map';
import { useOtherUserStore } from '@/stores/useOtherUserState';
import useUser from '@/stores/useUser';
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
  const { characterType } = useUser();
  const { socket, online, initGameSetting, allRendered } =
    useContext(SocketContext);
  const { otherUsers } = useOtherUserStore();

  console.log('otherUsers', otherUsers);

  useEffect(() => {
    if (socket && online && allRendered) {
      initGameSetting();
    }
  }),
    [initGameSetting];

  const characterKeys = Object.keys(CharacterInfo) as Array<
    keyof typeof CharacterInfo
  >;

  const selectedCharacterKey = characterKeys[characterType] || 'santa';
  const selectedCharacter = CharacterInfo[selectedCharacterKey];

  const otherCharacters = otherUsers.map(user => {
    const userCharacterKey = characterKeys[user.characterType] || 'santa';

    return {
      id: user.id,
      ...CharacterInfo[userCharacterKey],
      position: user.position,
      direction: user.direction,
    };
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
              {/* 본인 캐릭터 */}
              <Character
                characterURL={selectedCharacter.url}
                characterScale={selectedCharacter.scale}
                isOwnCharacter={true}
              />

              {/* 다른 유저들 캐릭터 */}
              {otherCharacters.map(userCharacter => (
                <Character
                  key={userCharacter.id}
                  characterURL={userCharacter.url}
                  characterScale={userCharacter.scale}
                  position={userCharacter.position}
                  direction={userCharacter.direction}
                  isOwnCharacter={false}
                />
              ))}
            </Physics>
          </Suspense>
        </Canvas>
      </KeyboardControls>
    </main>
  );
}
