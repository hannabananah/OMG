import { useGLTF } from '@react-three/drei';

export default function Map() {
  const { scene } = useGLTF('/models/map/scene.gltf');

  return (
    <primitive object={scene} scale={[0.7, 0.7, 0.7]} position={[0, -1.5, 0]} />
  );
}
