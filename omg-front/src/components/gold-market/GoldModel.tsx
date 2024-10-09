import { useGoldFloating } from '@/hooks/useGoldFloating';
import { useGLTF } from '@react-three/drei';

export default function GoldModel() {
  const floatingRef = useGoldFloating(0); // 초기 Y좌표 설정

  const { scene } = useGLTF('/models/gold/gold.gltf'); // GLTF 파일 로드
  return (
    <primitive
      ref={floatingRef}
      object={scene}
      scale={2}
      rotation={[0, 0, 0]}
    />
  );
}
