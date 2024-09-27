import { useContext, useEffect, useRef, useState } from 'react';

import { useCharacter } from '@/stores/useCharacter';
import { SocketContext } from '@/utils/SocketContext';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  position?: number[];
}

export default function GingerBread({ position }: Props) {
  const { movePlayer } = useContext(SocketContext);
  const [characterPosition, setCharacterPosition] = useState(
    new THREE.Vector3(0, 0.3, 0),
  );
  const [rotation, setRotation] = useState(0);
  const movementStateRef = useRef<'idle' | 'walking' | 'running'>('idle');
  const { scene, mixer } = useCharacter({
    onMovementChange: state => (movementStateRef.current = state),
    onRotationChange: setRotation,
    onPositionChange: setCharacterPosition,
  });

  useFrame((_, delta) => {
    mixer.current?.update(delta);
    if (scene) {
      scene.rotation.y = rotation;
      if (
        movementStateRef.current === 'walking' ||
        movementStateRef.current === 'running'
      ) {
        const moveSpeed = movementStateRef.current === 'walking' ? 0.05 : 0.1;
        const forwardDirection = new THREE.Vector3(
          Math.sin(rotation),
          0,
          Math.cos(rotation),
        );
        const newPosition = characterPosition
          .clone()
          .add(forwardDirection.multiplyScalar(moveSpeed));
        setCharacterPosition(newPosition);
        scene.position.copy(newPosition);
      }
    }
  });

  useEffect(() => {
    if (scene) {
      const positionArray = scene.position.toArray();
      const directionArray = [Math.sin(rotation), 0, Math.cos(rotation)];
      console.log(
        'positionArray, directionArray',
        positionArray,
        directionArray,
      );
      movePlayer(positionArray, directionArray);
    }
  }, [scene, characterPosition, rotation]);

  return (
    <primitive object={scene} scale={[2, 2, 2]} position={characterPosition} />
  );
}
