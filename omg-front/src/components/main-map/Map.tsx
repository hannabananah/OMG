import { useGLTF } from '@react-three/drei';

export default function Map() {
  const { scene } = useGLTF('/models/map/scene.gltf');

  return (
    <primitive object={scene} scale={[0.05, 0.05, 0.05]} position={[0, 0, 0]} />
  );
}
