import { useContext, useEffect, useRef, useState } from 'react';

import { useCharacter } from '@/stores/useCharacter';
import { selectedStockItem } from '@/types';
import { SocketContext } from '@/utils/SocketContext';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import Item from './Item';

interface Props {
  position?: number[];
  direction?: number[];
  characterURL: string;
  characterScale: number[];
  isOwnCharacter?: boolean;
}

export default function Character({
  position,
  direction,
  characterURL,
  characterScale,
  isOwnCharacter = false,
}: Props) {
  const { movePlayer, allRendered } = useContext(SocketContext);
  const [characterPosition, setCharacterPosition] = useState(
    new THREE.Vector3(0, -7.8, 10),
  ); // 캐릭터 기본 위치
  const [rotation, setRotation] = useState(0);
  const movementStateRef = useRef<'idle' | 'walking' | 'running'>('idle');

  const { scene, mixer } = useCharacter({
    characterURL,
    onMovementChange: state => (movementStateRef.current = state),
    onRotationChange: setRotation,
    onPositionChange: setCharacterPosition,
    isOwnCharacter,
  });

  useFrame((_, delta) => {
    mixer.current?.update(delta);
    if (scene) {
      scene.rotation.y = rotation;
      if (isOwnCharacter) {
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
      } else if (position && Array.isArray(position) && position.length === 3) {
        scene.position.set(...(position as [number, number, number]));

        if (direction && Array.isArray(direction) && direction.length === 3) {
          const [dirX, , dirZ] = direction;
          const newRotation = Math.atan2(dirX, dirZ);
          setRotation(newRotation);
          scene.rotation.y = newRotation;
        }
      }
    }
  });

  useEffect(() => {
    if (scene && allRendered) {
      const positionArray = scene.position.toArray();
      const directionArray = [Math.sin(rotation), 0, Math.cos(rotation)];

      if (isOwnCharacter) {
        movePlayer(positionArray, directionArray);
      }
    }
  }, [scene, characterPosition, rotation, allRendered, isOwnCharacter]);

  // 아이템 배열 데이터 (예시)
  const items: { itemName: selectedStockItem; count: number }[] = [
    { itemName: 'socks-with-cane', count: 1 },
    { itemName: 'cane', count: 1 },
    { itemName: 'socks', count: 1 },
    { itemName: 'reels', count: 1 },
    { itemName: 'candy', count: 1 },
  ];

  return (
    <>
      <primitive
        object={scene}
        scale={characterScale}
        position={characterPosition}
      />
      {items.map((item, itemIndex) =>
        [...Array(item.count)].map((_, index) => (
          <Item
            key={`${item.itemName}-${itemIndex}-${index}`}
            disabled={true}
            characterPosition={characterPosition}
            index={index + itemIndex * 2} // 인덱스를 계산하여 순차적으로 배치
            itemName={item.itemName}
          />
        )),
      )}
    </>
  );
}