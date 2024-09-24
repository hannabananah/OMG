import { Suspense } from 'react';

import Mickey from '@/components/character/Mickey';
// import GingerBread from '@/components/character/GingerBread';
import Map from '@/components/main-map/Map';
import { KeyboardControls, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Physics, RigidBody } from '@react-three/rapier';
import Controller from 'ecctrl';

// import { useControls } from 'leva';

export default function MainMap() {
  const keyboardMap = [
    { name: 'forward', keys: ['ArrowUp', 'KeyW'] }, // 앞으로 이동 (↑ 또는 W)
    { name: 'backward', keys: ['ArrowDown', 'KeyS'] }, // 뒤로 이동 (↓ 또는 S)
    { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] }, // 왼쪽으로 이동 (← 또는 A)
    { name: 'rightward', keys: ['ArrowRight', 'KeyD'] }, // 오른쪽으로 이동 (→ 또는 D)
    { name: 'pickup', keys: ['Space'] },
  ];

  // 카메라 시점 이동
  // const { camera } = useThree();

  return (
    <div className='relative w-full h-screen p-1'>
      <Canvas camera={{ position: [60, 50, 45], fov: 80 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <OrbitControls />
        {/* fallback에 지정된 요소가 자식 컴포넌트가 로딩 중일 때 보여짐 */}
        <Suspense fallback={null}>
          {/* Physics로 물리 엔진 활성화, timeStep을 "vary"로 설정해 물리 시뮬레이션의 프레임 속도를 가변적으로 설정 */}
          <Physics timeStep='vary'>
            <KeyboardControls map={keyboardMap}>
              {/* 이동 최대 속도 5 */}
              <Controller maxVelLimit={5}>
                <Mickey />
              </Controller>
            </KeyboardControls>
            <RigidBody type='fixed' colliders='trimesh'>
              <Map />
            </RigidBody>
          </Physics>
        </Suspense>
      </Canvas>
    </div>
  );
}
