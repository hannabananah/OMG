import { useState } from 'react';

import { useFloatingObject } from '@/hooks/useFloatingObject';
import { StockItem } from '@/types';
import { useGLTF } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';
import { Select } from '@react-three/postprocessing';

interface ItemProps {
  itemName: StockItem;
  position: { x: number; y: number; z: number };
  onClick?: (event: ThreeEvent<PointerEvent>) => void;
  disabled: boolean;
  scale?: number[];
}

export default function Item({
  itemName,
  position,
  onClick,
  disabled,
  scale = [0.5, 0.5, 0.5],
}: ItemProps) {
  const { scene } = useGLTF(`/models/${itemName}/${itemName}.gltf`);
  const ref = useFloatingObject(position.y);
  const [hovered, setHovered] = useState(false);

  return (
    <Select enabled={hovered}>
      <primitive
        ref={ref}
        object={scene}
        position={[position.x, position.y, position.z]}
        scale={scale}
        rotation={[0, 0, 0]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        disabled={disabled}
      />
    </Select>
  );
}
