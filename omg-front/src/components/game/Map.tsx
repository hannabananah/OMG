import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';

export default function Map() {
  const { scene } = useGLTF('/models/map/scene.gltf');

  return (
    <RigidBody type='fixed'>
      <primitive
        object={scene}
        scale={[0.05, 0.05, 0.05]}
        position={[0, 0, 0]}
      />
    </RigidBody>
  );
}

// 성능 최적화 위해서 미리 불러오기
useGLTF.preload('/models/map/scene.gltf');
