import { useFloatingObject } from '@/hooks';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface ItemProps {
  disabled: boolean;
  position: THREE.Vector3;
  index: number;
  itemName: string;
}

export default function Item({
  disabled,
  position,
  index,
  itemName,
}: ItemProps) {
  const { scene } = useGLTF(`/models/${itemName}/${itemName}.gltf`);

  const itemPosition = new THREE.Vector3(
    position.x,
    position.y + 5.5 + index * 0.5,
    position.z,
  );

  const ref = useFloatingObject(itemPosition.y);

  const clonedScene = scene.clone();

  return (
    <primitive
      ref={ref}
      object={clonedScene}
      position={itemPosition}
      scale={[0.5, 0.5, 0.5]}
      rotation={[0, 0, 0]}
      style={disabled ? { pointerEvents: 'none' } : undefined}
    />
  );
}
