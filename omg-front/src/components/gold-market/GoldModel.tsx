import { useGoldSwing } from '@/hooks';
import { useGLTF } from '@react-three/drei';

export default function GoldModel() {
  const swingRef = useGoldSwing(3, 0.3);

  const { scene } = useGLTF('/models/goldbell/goldbell.gltf');
  return (
    <group ref={swingRef} position={[0, 0, 0]}>
      <primitive
        object={scene}
        scale={2.4}
        position={[0, -2.4, 0]}
        rotation={[-0.2, 0, 0]}
      />
    </group>
  );
}
