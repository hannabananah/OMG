import { useContext, useEffect, useMemo, useRef, useState } from 'react';

import { Controls } from '@/components/main-map/MainMap';
import { useCharacter } from '@/stores/useCharacter';
import useModalStore from '@/stores/useModalStore';
import useUser from '@/stores/useUser';
import { StockItem } from '@/types';
import { SocketContext } from '@/utils/SocketContext';
import { useKeyboardControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import { isInZone, zones } from '../../assets/data/locationInfo';
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
}

export default function Character({
  position,
  direction,
  actionToggle,
  characterURL,
  characterScale,
  isOwnCharacter = false,
  startPosition,
}: Props) {
  const { movePlayer, allRendered } = useContext(SocketContext);

  const { modals, openModal, closeModal } = useModalStore();
  const { nickname } = useUser();

  const [localActionToggle, setLocalActionToggle] = useState(false);
  const [characterPosition, setCharacterPosition] = useState(
    new THREE.Vector3(...startPosition),
  );
  const [rotation, setRotation] = useState(0);
  const movementStateRef = useRef<'idle' | 'walking' | 'running'>('idle');
  const prevPositionRef = useRef(new THREE.Vector3()); // 캐릭터 이전 위치

  const leftPressed = useKeyboardControls(state => state[Controls.left]);
  const rightPressed = useKeyboardControls(state => state[Controls.right]);
  const backPressed = useKeyboardControls(state => state[Controls.back]);
  const forwardPressed = useKeyboardControls(state => state[Controls.forward]);

  const [isInStockMarketZone, setIsInStockMarketZone] = useState(false);
  const [isInLoanMarketZone, setIsInLoanMarketZone] = useState(false);
  const [isInGoldMarketZone, setIsInGoldMarketZone] = useState(false);
  const [isInSantaHouseZone, setIsInSantaHouseZone] = useState(false);
  const [isInSnowmanHouseZone, setIsInSnowmanHouseZone] = useState(false);
  const [isInElfHouseZone, setIsInElfHouseZone] = useState(false);
  const [isInGingerbreadHouseZone, setIsInGingerbreadHouseZone] =
    useState(false);

  const { scene, mixer, pickUpAnimation } = useCharacter({
    characterURL,
    onMovementChange: state => (movementStateRef.current = state),
    onRotationChange: setRotation,
    onPositionChange: setCharacterPosition,
    onActionToggleChange: setLocalActionToggle,
    isOwnCharacter,
  });

  // 특정 거래소 좌표에 입장/퇴장한 유저에게만 해당 거래소 모달 열고 닫기
  const openModalForPlayer = (modalId: string, playerNickname: string) => {
    if (!modals[playerNickname]?.[modalId]) {
      openModal(modalId, playerNickname);
    }
  };

  const closeModalForPlayer = (modalId: string, playerNickname: string) => {
    if (modals[playerNickname]?.[modalId]) {
      closeModal(modalId, playerNickname);
    }
  };

  useEffect(() => {
    // 자신의 캐릭터가 아닌 경우 모달 제어 로직을 실행하지 않음
    if (!isOwnCharacter) return;

    const prevPosition = prevPositionRef.current;
    if (
      characterPosition.x !== prevPosition.x ||
      characterPosition.y !== prevPosition.y ||
      characterPosition.z !== prevPosition.z
    ) {
      console.log('캐릭터 현재 위치:', {
        x: characterPosition.x,
        y: characterPosition.y,
        z: characterPosition.z,
      });
      prevPositionRef.current.copy(characterPosition); // 현재 위치를 이전 위치로 업데이트

      const insideStockMarket = isInZone(characterPosition, zones.stockMarket);
      if (insideStockMarket && !isInStockMarketZone) {
        setIsInStockMarketZone(true);
        openModalForPlayer('stockMarket', nickname);
        console.log('주식 시장 진입');
      } else if (!insideStockMarket && isInStockMarketZone) {
        setIsInStockMarketZone(false);
        closeModalForPlayer('stockMarket', nickname);
        console.log('주식 시장 벗어남');
      }
      const insideLoanMarket = isInZone(characterPosition, zones.loanMarket);
      if (insideLoanMarket && !isInLoanMarketZone) {
        setIsInLoanMarketZone(true);
        openModalForPlayer('loanMarket', nickname);
        console.log('대출 방 진입');
      } else if (!insideLoanMarket && isInLoanMarketZone) {
        setIsInLoanMarketZone(false);
        closeModalForPlayer('loanMarket', nickname);
        console.log('대출 방 벗어남');
      }
      const insideGoldMarket = isInZone(characterPosition, zones.goldMarket);
      if (insideGoldMarket && !isInGoldMarketZone) {
        setIsInGoldMarketZone(true);
        openModalForPlayer('goldMarket', nickname);
        console.log('금 거래소 진입');
      } else if (!insideGoldMarket && isInGoldMarketZone) {
        setIsInGoldMarketZone(false);
        closeModalForPlayer('goldMarket', nickname);
        console.log('금 거래소 벗어남');
      }
      const insideSantaHouse = isInZone(characterPosition, zones.santaHouse);
      if (insideSantaHouse && !isInSantaHouseZone) {
        setIsInSantaHouseZone(true);
        console.log('산타 집 진입');
      } else if (!insideSantaHouse && isInSantaHouseZone) {
        setIsInSantaHouseZone(false);
        console.log('산타 집 벗어남');
      }
      const insideSnowmanHouse = isInZone(
        characterPosition,
        zones.snowmanHouse,
      );
      if (insideSnowmanHouse && !isInSnowmanHouseZone) {
        // snowman 집에 진입
        setIsInSnowmanHouseZone(true);
        console.log('snowman 집 진입');
      } else if (!insideSnowmanHouse && isInSnowmanHouseZone) {
        // snowman 집에서 벗어남
        setIsInSnowmanHouseZone(false);
        console.log('snowman 집 벗어남');
      }
      const insideElfHouse = isInZone(characterPosition, zones.elfHouse);
      if (insideElfHouse && !isInElfHouseZone) {
        // elf 집에 진입
        setIsInElfHouseZone(true);
        console.log('elf 집 진입');
      } else if (!insideElfHouse && isInElfHouseZone) {
        // elf 집에서 벗어남
        setIsInElfHouseZone(false);
        console.log('elf 집 벗어남');
      }
      const insideGingerbreadHouse = isInZone(
        characterPosition,
        zones.gingerbreadHouse,
      );
      if (insideGingerbreadHouse && !isInGingerbreadHouseZone) {
        // gingerbread 집에 진입
        setIsInGingerbreadHouseZone(true);
        console.log('gingerbread 집 진입');
      } else if (!insideGingerbreadHouse && isInGingerbreadHouseZone) {
        // gingerbread 집에서 벗어남
        setIsInGingerbreadHouseZone(false);
        console.log('Exited gingerbread 집 벗어남');
      }
    }
  }, [
    characterPosition,
    isInStockMarketZone,
    isInLoanMarketZone,
    isInGoldMarketZone,
    isInSantaHouseZone,
    isInSnowmanHouseZone,
    isInElfHouseZone,
    isInGingerbreadHouseZone,
  ]);

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
        // 이동 속도 설정
        const moveDistance = 0.2;
        // 현재 캐릭터 위치 복사
        const newPosition = characterPosition.clone();
        // 키 입력에 따른 위치 변경
        if (leftPressed) {
          newPosition.x += moveDistance;
        }
        if (rightPressed) {
          newPosition.x -= moveDistance;
        }
        if (backPressed) {
          newPosition.z -= moveDistance;
        }
        if (forwardPressed) {
          newPosition.z += moveDistance;
        }
        // 캐릭터 위치가 변했을 때만 서버로 전송
        if (!newPosition.equals(prevPositionRef.current)) {
          const positionArray = newPosition.toArray();
          const directionArray = [Math.sin(rotation), 0, Math.cos(rotation)];
          movePlayer(positionArray, directionArray, localActionToggle);
          prevPositionRef.current.copy(newPosition);
        }
        // 캐릭터 위치 업데이트
        setCharacterPosition(newPosition);
        scene.position.copy(newPosition);
        // 걷기 및 달리기 상태
        if (
          movementStateRef.current === 'walking' ||
          movementStateRef.current === 'running'
        ) {
          const moveSpeed = movementStateRef.current === 'walking' ? 0.2 : 0.4;
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
        }
      } else if (position && Array.isArray(position) && position.length === 3) {
        setCharacterPosition(new THREE.Vector3(...position));
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
  }, [scene, rotation, allRendered, isOwnCharacter, localActionToggle]);

  // 트리 장식 배열 데이터 (예시)
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

  useEffect(() => {
    if (localActionToggle) {
      pickUpAnimation();
      setTimeout(() => {
        setLocalActionToggle(false);
      }, 160);
    }
  }, [localActionToggle]);

  return (
    <>
      {isOwnCharacter && (
        <IntroCamera
          characterPosition={characterPosition}
          characterDirection={
            new THREE.Vector3(Math.sin(rotation), 0, Math.cos(rotation))
          }
          characterRotation={new THREE.Euler(0, rotation, 0)}
          scale={characterScale}
        />
      )}

      <RigidBody type='dynamic' colliders={false} lockRotations={true}>
        <primitive
          object={scene}
          scale={characterScale}
          position={characterPosition}
          startPosition={startPosition}
        />

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
        />

        {items.map((item, itemIndex) =>
          [...Array(item.count)].map((_, index) => (
            <Item
              key={`${item.itemName}-${itemIndex}-${index}`}
              disabled={true}
              position={characterPosition}
              index={index + itemIndex * 2}
              itemName={item.itemName}
            />
          )),
        )}
      </RigidBody>
    </>
  );
}
