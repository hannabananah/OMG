import { Fisheye, KeyboardControls, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Physics, RigidBody } from '@react-three/rapier';
import Controller from 'ecctrl';

import { Mushroom } from './assets/Mushroom';
import { Ninja } from './assets/Ninja';

// import { Fruitstore } from './assets/Fruitstore';

// import MyElement3D from "./MyElement3D";

export default function App() {
  const keyboardMap = [
    { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
    { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
    { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
    { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
    { name: 'jump', keys: ['Space'] },
    { name: 'run', keys: ['Shift'] },
  ];
  return (
    <>
      <Canvas
        shadows
        onPointerDown={(e: any) => e.target.requestPointerLock()}
        style={{ width: '100vw', height: '100vh' }}
        camera={{ position: [20, 5, -8] }}
      >
        <Fisheye zoom={0.4}>
          <directionalLight
            intensity={0.7}
            castShadow
            shadow-bias={-0.0004}
            position={[-20, 20, 20]}
          >
            <orthographicCamera
              attach='shadow-camera'
              args={[-20, 20, 20, -20]}
            />
          </directionalLight>
          <OrbitControls />
          <axesHelper args={[200]} />
          <ambientLight intensity={2} />

          <Physics timeStep='vary'>
            <KeyboardControls map={keyboardMap}>
              <Controller maxVelLimit={5}>
                <Ninja
                  position={[0, 0, 0]}
                  scale={0.5}
                  castShadow
                  receiveShadow
                />
              </Controller>
            </KeyboardControls>

            <RigidBody type='fixed' colliders='trimesh'>
              <group rotation-y={-Math.PI / 2}>
                {/* <Fruitstore /> */}
                <Mushroom
                  position={[0, 0, 0]}
                  scale={1.2}
                  castShadow
                  receiveShadow
                />
              </group>
            </RigidBody>
          </Physics>
        </Fisheye>
      </Canvas>
    </>
  );
}
