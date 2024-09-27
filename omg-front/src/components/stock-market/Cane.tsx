import { useFloatingObject } from '@/hooks/useFloatingObject';
import { useGLTF } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';

interface CaneProps {
  onClick: (event: ThreeEvent<PointerEvent>) => void;
  disabled: boolean;
}

export default function Cane({ onClick, disabled }: CaneProps) {
  const { scene } = useGLTF('/models/cane/cane.gltf');

  const position = {
    x: 3,
    y: 0.8,
    z: -1.3,
  };

  const ref = useFloatingObject(position.y);

  return (
    <>
      <primitive
        ref={ref} // useRef로 참조 설정
        object={scene}
        position={[position.x, position.y, position.z]}
        scale={[0.5, 0.5, 0.5]}
        rotation={[0, 0, 0]} // 초기 회전 상태
        onClick={onClick}
        disabled={disabled}
      />
    </>
  );
}
