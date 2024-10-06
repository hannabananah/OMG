import { useContext, useEffect, useMemo, useRef, useState } from 'react';

import { Controls } from '@/components/main-map/MainMap';
import { useCharacter } from '@/stores/useCharacter';
import { StockItem } from '@/types';
import { SocketContext } from '@/utils/SocketContext';
import { useKeyboardControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import { useIntroStore } from '../../stores/useIntroStore';
import IntroCamera from '../camera/IntroCamera';
import Item from './Item';

interface Props {
  position?: number[];
  direction?: number[];
  actionToggle?: boolean;
  characterURL: string;
  characterScale: number[];
  isOwnCharacter?: boolean;
  startPosition?: [number, number, number];
  characterCamera?: {
    position: [number, number, number];
    zoom: number;
  };
}

export default function Character({
  position,
  direction,
  actionToggle,
  characterURL,
  characterScale,
  isOwnCharacter = false,
  startPosition,
  characterCamera,
}: Props) {
  const { movePlayer, allRendered } = useContext(SocketContext);
  const [localActionToggle, setLocalActionToggle] = useState(false);
  const [characterPosition, setCharacterPosition] = useState(
    new THREE.Vector3(
      ...(isOwnCharacter && startPosition ? startPosition : [0, 0, 0]), // 본인 캐릭터에만 startPosition을 반영
    ),
  );
  const [rotation, setRotation] = useState(0);
  const [isColliding, setIsColliding] = useState(false);
  const [isCameraTransitioned, setIsCameraTransitioned] = useState(false);
  const movementStateRef = useRef<'idle' | 'walking' | 'running'>('idle');

  const leftPressed = useKeyboardControls(state => state[Controls.left]);
  const rightPressed = useKeyboardControls(state => state[Controls.right]);
  const backPressed = useKeyboardControls(state => state[Controls.back]);
  const forwardPressed = useKeyboardControls(state => state[Controls.forward]);

  const [leftColliding, setLeftColliding] = useState(false);
  const [rightColliding, setRightColliding] = useState(false);
  const [forwardColliding, setForwardColliding] = useState(false);
  const [backColliding, setBackColliding] = useState(false);

  const { showIntro } = useIntroStore();

  const { scene, mixer, pickUpAnimation } = useCharacter({
    characterURL,
    onMovementChange: state => (movementStateRef.current = state),
    onRotationChange: setRotation,
    onPositionChange: setCharacterPosition,
    onActionToggleChange: setLocalActionToggle,
    isOwnCharacter,
  });

  // 충돌 감지 시 카메라 전환이 끝났을 때만 처리
  const handleCollisionEnter = (event: any) => {
    if (!showIntro && isCameraTransitioned) {
      setIsColliding(true);
      console.log('충돌감지');
    }
  };

  const handleCollisionExit = () => {
    if (!showIntro && isCameraTransitioned) {
      setIsColliding(false);
    }
  };

  useEffect(() => {
    console.log('캐릭터 현재 위치:', {
      x: characterPosition.x,
      y: characterPosition.y,
      z: characterPosition.z,
    });
  }, [characterPosition]);

  useEffect(() => {
    if (!showIntro && isCameraTransitioned && isColliding) {
      console.log('회전 rotation', rotation);
      setIsColliding(false);
    }
  }, [rotation]);

  useEffect(() => {
    if (localActionToggle) {
      pickUpAnimation();
      setTimeout(() => {
        setLocalActionToggle(false);
      }, 160);
    }
  }, [localActionToggle]);

  useEffect(() => {
    if (!isOwnCharacter && actionToggle) {
      pickUpAnimation();
    }
  }, [actionToggle, isOwnCharacter]);

  useFrame((_, delta) => {
    mixer.current?.update(delta);
    if (scene) {
      scene.rotation.y = rotation;

      if (isOwnCharacter) {
        if (!isColliding) {
          const moveDistance = 0.1; // 이동 속도
          const newPosition = characterPosition.clone(); // 현재 캐릭터 위치 복사

          if (leftPressed) newPosition.x += moveDistance;
          if (rightPressed) newPosition.x -= moveDistance;
          if (backPressed) newPosition.z -= moveDistance;
          if (forwardPressed) newPosition.z += moveDistance;

          setCharacterPosition(newPosition);
          scene.position.copy(newPosition);

          const rigidBody = scene.userData.rigidBody;
          if (rigidBody) {
            rigidBody.setTranslation(newPosition.toArray());
          }
          if (
            movementStateRef.current === 'walking' ||
            movementStateRef.current === 'running'
          ) {
            const moveSpeed =
              movementStateRef.current === 'walking' ? 0.1 : 0.15;
            const forwardDirection = new THREE.Vector3(
              Math.sin(rotation),
              0,
              Math.cos(rotation),
            );
            const newForwardPosition = characterPosition
              .clone()
              .add(forwardDirection.multiplyScalar(moveSpeed));
            setCharacterPosition(newForwardPosition);
            scene.position.copy(newForwardPosition);

            if (rigidBody) {
              rigidBody.setTranslation(newForwardPosition.toArray());
            }
          }
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
        movePlayer(positionArray, directionArray, localActionToggle);
      }
    }
  }, [rotation, allRendered, isOwnCharacter, localActionToggle]);

  const items: { itemName: StockItem; count: number }[] = useMemo(
    () => [
      { itemName: 'candy', count: 1 },
      { itemName: 'cupcake', count: 1 },
      { itemName: 'gift', count: 1 },
      { itemName: 'hat', count: 1 },
      { itemName: 'socks', count: 1 },
    ],
    [],
  );

  return (
    <>
      <IntroCamera
        characterPosition={characterPosition}
        characterDirection={
          new THREE.Vector3(Math.sin(rotation), 0, Math.cos(rotation))
        }
        characterRotation={new THREE.Euler(0, rotation, 0)}
        myCamera={characterCamera}
        isColliding={isColliding}
        onTransitionEnd={() => setIsCameraTransitioned(true)}
        scale={characterScale}
      />

      <RigidBody type='dynamic' colliders={false} lockRotations={true}>
        <primitive
          object={scene}
          scale={characterScale}
          position={
            new THREE.Vector3(
              characterPosition.x,
              characterPosition.y,
              characterPosition.z,
            )
          }
        />

        {/* 콜라이더를 캐릭터 중간에 위치 */}
        <CuboidCollider
          position={
            new THREE.Vector3(
              characterPosition.x,
              characterPosition.y + characterScale[1] / 2,
              characterPosition.z,
            )
          }
          args={[
            characterScale[0] / 4,
            characterScale[1] / 2.2,
            characterScale[2] / 3,
          ]}
          onCollisionEnter={handleCollisionEnter}
          onCollisionExit={handleCollisionExit}
        />
        {items.map((item, itemIndex) =>
          [...Array(item.count)].map((_, index) => (
            <Item
              key={`${item.itemName}-${itemIndex}-${index}`}
              disabled={true}
              characterPosition={
                new THREE.Vector3(
                  characterPosition.x,
                  characterPosition.y + 1,
                  characterPosition.z,
                )
              }
              index={index + itemIndex * 2}
              itemName={item.itemName}
            />
          )),
        )}
      </RigidBody>
    </>
  );
}
