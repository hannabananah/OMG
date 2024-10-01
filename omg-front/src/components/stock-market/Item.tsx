import { useFloatingObject } from '@/hooks/useFloatingObject';
import { StockItem } from '@/types';
import { useGLTF } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';

interface ItemProps {
  itemName: StockItem;
  position: { x: number; y: number; z: number };
  onClick: (event: ThreeEvent<PointerEvent>) => void;
  disabled: boolean;
}

export default function Item({
  itemName,
  position,
  onClick,
  disabled,
}: ItemProps) {
  const { scene } = useGLTF(`/models/${itemName}/${itemName}.gltf`);

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
