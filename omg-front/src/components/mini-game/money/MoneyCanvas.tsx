import { useMemo } from 'react';

import { useGLTF } from '@react-three/drei';
import { CuboidCollider, RigidBody } from '@react-three/rapier';

interface MoneyAssetsProps {
  position: number[];
  status: number;
}

export default function MoneyCanvas({ position, status }: MoneyAssetsProps) {
  const { scene } = useMemo(() => {
    return useGLTF(
      status === 2 ? '/models/gold/gold.gltf' : '/models/hat/hat.gltf',
    );
  }, [status]);

  return (
    <RigidBody type='fixed'>
      <CuboidCollider args={[0.3, 0.3, 0.3]} />
      <primitive
        object={scene}
        position={position}
        scale={[0.3, 0.3, 0.3]}
        rotation={[30, Math.PI / 20, 0]}
      />
    </RigidBody>
  );
}

useGLTF.preload('/models/gold/gold.gltf');
useGLTF.preload('/models/hat/hat.gltf');
