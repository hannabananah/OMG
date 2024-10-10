import { useGoldSwing } from '@/hooks/useGoldSwing';
import { useGLTF } from '@react-three/drei';

export default function GoldModel() {
  const swingRef = useGoldSwing(3, 0.3); // 속도, 진폭

  const { scene } = useGLTF('/models/goldbell/goldbell.gltf'); // GLTF 파일 로드
  return (
    <group ref={swingRef} position={[0, 0, 0]}>
      <primitive
        object={scene}
        scale={2.4}
        position={[0, -2.4, 0]} // 종을 아래로 이동시켜 위쪽이 피벗이 되도록 설정
        rotation={[-0.2, 0, 0]}
      />
    </group>
  );
}
