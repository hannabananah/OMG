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
  const { scene } = useMemo(() => {
    return useGLTF(
      status === 2
        ? '/models/gold/gold.gltf'
        : status === 1
          ? '/models/hat/hat.gltf'
          : '',
    );
  }, [status]);

  const ref = useFloatingObject(-7);

  const clonedScene = scene.clone();

  return (
    <RigidBody type='fixed'>
      <CuboidCollider args={[0.6, 0.6, 0.6]} />
      <primitive
        ref={ref}
        object={clonedScene}
        position={position}
        scale={[0.6, 0.6, 0.6]}
      />
    </RigidBody>
  );
}

useGLTF.preload('/models/gold/gold.gltf');
useGLTF.preload('/models/hat/hat.gltf');
