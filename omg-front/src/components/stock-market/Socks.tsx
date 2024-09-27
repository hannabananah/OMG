import { useFloatingObject } from '@/hooks/useFloatingObject';
import { useGLTF } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';

interface SocksProps {
  onClick: (event: ThreeEvent<PointerEvent>) => void;
  disabled: boolean;
}

export default function Socks({ onClick, disabled }: SocksProps) {
  const { scene } = useGLTF('/models/socks/socks.gltf');

  const position = {
    x: 2,
    y: 0,
    z: -2.3,
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
