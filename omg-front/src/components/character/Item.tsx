import { useFloatingObject } from '@/hooks/useFloatingObject';
import { StockItem } from '@/types';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface ItemProps {
  disabled: boolean;
  position: THREE.Vector3;
  index: number;
  itemName: StockItem;
}

export default function Item({
  disabled,
  position,
  index,
  itemName,
}: ItemProps) {
  const { scene } = useGLTF(`/models/${itemName}/${itemName}.gltf`); // 전달된 모델 경로를 사용

  const itemPosition = new THREE.Vector3(
    position.x,
    position.y + 4.5 + index * 0.5, // 인덱스에 따라 높이를 조정
    position.z,
  );

  // 애니메이션 적용
  const ref = useFloatingObject(itemPosition.y);

  // GLTF 모델 복제
  const clonedScene = scene.clone();

  return (
    <primitive
      ref={ref}
      object={clonedScene}
      position={itemPosition}
      scale={[0.5, 0.5, 0.5]}
      rotation={[0, 0, 0]} // 초기 회전 상태
      style={disabled ? { pointerEvents: 'none' } : undefined} // 클릭 방지
    />
  );
}
