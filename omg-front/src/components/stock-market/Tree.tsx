import { useGLTF } from '@react-three/drei';

export default function Tree() {
  const { scene } = useGLTF('/models/stocktree/stocktree.gltf');
  return (
    <primitive object={scene} position={[1, -2, -2]} scale={[1.5, 1.5, 1.5]} />
  );
}
