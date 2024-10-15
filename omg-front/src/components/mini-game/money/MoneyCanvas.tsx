import { useMemo } from 'react';

import { useFloatingObject } from '@/hooks/useFloatingObject';
import { useGLTF } from '@react-three/drei';
import { CuboidCollider, RigidBody } from '@react-three/rapier';

interface MoneyAssetsProps {
  position: number[];
  status: number;
}

export default function MoneyCanvas({ position, status }: MoneyAssetsProps) {
  if (status === 0) return null;

  const { scene, scale, args } = useMemo(() => {
    if (status === 2) {
      return {
        scene: useGLTF('/models/gold/gold.gltf').scene,
        scale: [0.3, 0.3, 0.3],
        args: [0.3, 0.3, 0.3] as [number, number, number],
      };
    } else if (status === 1) {
      return {
        scene: useGLTF('/models/silver/silver.gltf').scene,
        scale: [2.5, 2.5, 2.5],
        args: [2.5, 2.5, 2.5] as [number, number, number],
      };
    }
    return { scene: null, scale: [1, 1, 1], colliderArgs: [1, 1, 1] };
  }, [status]);

  if (!scene) return null;

  const ref = useFloatingObject(position[1]);
  const clonedScene = scene.clone();

  return (
    <RigidBody type='fixed'>
      <CuboidCollider args={args} />
      <primitive
        ref={ref}
        object={clonedScene}
        position={position}
        scale={scale}
        rotation={[0, 0, 0]}
      />
    </RigidBody>
  );
}

useGLTF.preload('/models/gold/gold.gltf');
useGLTF.preload('/models/silver/silver.gltf');
