import { useContext, useEffect, useMemo, useRef, useState } from 'react';

import { Controls } from '@/components/main-map/MainMap';
import { useCharacter } from '@/stores/useCharacter';
import { useModalStore } from '@/stores/useModalStore';
import { useMyRoomStore } from '@/stores/useMyRoomStore';
import useUser from '@/stores/useUser';
import { StockItem } from '@/types';
import { SocketContext } from '@/utils/SocketContext';
import { useKeyboardControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import { isInZone, zones } from '../../assets/data/locationInfo';
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
  const { setIsEnteringRoom, setIsExitingRoom, setIsFadingOut } =
    useMyRoomStore();

  const { nickname, characterType } = useUser();

  const [localActionToggle, setLocalActionToggle] = useState(false);
  const [characterPosition, setCharacterPosition] = useState(
    new THREE.Vector3(...startPosition),
  );

  const [rotation, setRotation] = useState(0);
  const movementStateRef = useRef<'idle' | 'walking' | 'running'>('idle');
  const prevPositionRef = useRef(new THREE.Vector3()); // 캐릭터 이전 위치
  const collisionRef = useRef(false);
  const { showIntro } = useIntroStore();

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCircling, setIsCircling] = useState(false);
  const [marketType, setMarketType] = useState<
    null | 'loanMarket' | 'stockMarket' | 'goldMarket'
  >(null);

  const { scene, mixer, pickUpAnimation } = useCharacter({
    characterURL,
    onMovementChange: state => (movementStateRef.current = state),
    onRotationChange: setRotation,
    onPositionChange: setCharacterPosition,
    onActionToggleChange: setLocalActionToggle,
    isOwnCharacter,
  });

  // 캐릭터 방향과 회전 설정
  const characterDirection = new THREE.Vector3(
    Math.sin(rotation),
    0,
    Math.cos(rotation),
  );

  // 특정 거래소 좌표에 입장/퇴장한 유저에게만 해당 거래소 모달 열고 닫기
  const openMarketForPlayer = (modalId: string, playerNickname: string) => {
    if (!modals[playerNickname]?.[modalId]) {
      openModal(modalId, playerNickname);
    }
  };
  const closeMarketForPlayer = (modalId: string, playerNickname: string) => {
    if (modals[playerNickname]?.[modalId]) {
      console.log('바깥 부분 클릭 됨! 대출방');
      closeModal(modalId, playerNickname);
    }
  };

  // 자기 방에 입장/퇴장한 유저에게만 자기 방 모달 열고 닫기
  const openModalForPlayer = (modalId: string, playerNickname: string) => {
    if (!modals[playerNickname]?.[modalId]) {
      // 방 입장 중 메시지 표시
      setIsEnteringRoom(playerNickname, true);
      setTimeout(() => {
        setIsEnteringRoom(playerNickname, false);
        openModal(modalId, playerNickname);
      }, 5000);
    }
  };
  const closeModalForPlayer = (modalId: string, playerNickname: string) => {
    if (modals[playerNickname]?.[modalId]) {
      // 방 퇴장 메시지 표시
      setIsExitingRoom(playerNickname, true);
      setIsFadingOut(true);

      setTimeout(() => {
        setIsExitingRoom(playerNickname, false);
        setIsFadingOut(false);
        closeModal(modalId, playerNickname);
      }, 5000);
    }
  };

  // modal open close
  useEffect(() => {
    if (
      modals[nickname]?.loanMarket ||
      modals[nickname]?.stockMarket ||
      modals[nickname]?.goldMarket
    ) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }, [modals, nickname]);

  // 거래소 진입 시 카메라 전환
  useEffect(() => {
    if (marketType && !isCircling) {
      setIsCircling(true);
    }
  }, [marketType, isCircling]);

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

      // 거래소
      const insideStockMarket = isInZone(characterPosition, zones.stockMarket);
      if (insideStockMarket && !isInStockMarketZone) {
        setIsInStockMarketZone(true);
        setMarketType('stockMarket');
        setIsModalOpen(true);
        setIsCircling(true);
        openMarketForPlayer('stockMarket', nickname);
        console.log('주식 시장 진입');
      } else if (!insideStockMarket && isInStockMarketZone) {
        setIsInStockMarketZone(false);
        setMarketType(null);
        closeMarketForPlayer('stockMarket', nickname);
        setIsModalOpen(false);
        console.log('주식 시장 벗어남');
      }
      const insideLoanMarket = isInZone(characterPosition, zones.loanMarket);
      if (insideLoanMarket && !isInLoanMarketZone) {
        setIsInLoanMarketZone(true);
        setMarketType('loanMarket');
        setIsModalOpen(true);
        setIsCircling(true);
        openMarketForPlayer('loanMarket', nickname);
        console.log('대출 방 진입');
      } else if (!insideLoanMarket && isInLoanMarketZone) {
        setIsInLoanMarketZone(false);
        setMarketType(null);
        closeMarketForPlayer('loanMarket', nickname);
        setIsModalOpen(false);
        console.log('대출 방 벗어남');
      }
      const insideGoldMarket = isInZone(characterPosition, zones.goldMarket);
      if (insideGoldMarket && !isInGoldMarketZone) {
        setIsInGoldMarketZone(true);
        setMarketType('goldMarket');
        setIsModalOpen(true);
        setIsCircling(true);
        openMarketForPlayer('goldMarket', nickname);
        console.log('금 거래소 진입');
      } else if (!insideGoldMarket && isInGoldMarketZone) {
        setIsInGoldMarketZone(false);
        setMarketType(null);
        closeMarketForPlayer('goldMarket', nickname);
        setIsModalOpen(false);
        console.log('금 거래소 벗어남');
      }

      // 자기 집
      // 0: 산타 캐릭터일 때 산타 MyRoom 모달 열기
      if (characterType === 0) {
        const insideSantaHouse = isInZone(characterPosition, zones.santaHouse);
        if (insideSantaHouse && !isInSantaHouseZone) {
          setIsInSantaHouseZone(true);
          openModalForPlayer('myRoom', nickname);
          console.log('산타 집 진입');
        } else if (!insideSantaHouse && isInSantaHouseZone) {
          setIsInSantaHouseZone(false);
          closeModalForPlayer('myRoom', nickname);
          console.log('산타 집 벗어남');
        }
      }

      // 1 : 엘프 캐릭터일 때 엘프 MyRoom 모달 열기
      if (characterType === 1) {
        const insideElfHouse = isInZone(characterPosition, zones.elfHouse);
        if (insideElfHouse && !isInElfHouseZone) {
          setIsInElfHouseZone(true);
          openModalForPlayer('myRoom', nickname);
          console.log('엘프 집 진입');
        } else if (!insideElfHouse && isInElfHouseZone) {
          setIsInElfHouseZone(false);
          closeModalForPlayer('myRoom', nickname);
          console.log('엘프 집 벗어남');
        }
      }

      // 2 : 눈사람 캐릭터일 때 눈사람 MyRoom 모달 열기
      if (characterType === 2) {
        const insideSnowmanHouse = isInZone(
          characterPosition,
          zones.snowmanHouse,
        );
        if (insideSnowmanHouse && !isInSnowmanHouseZone) {
          setIsInSnowmanHouseZone(true);
          openModalForPlayer('myRoom', nickname);
          console.log('snowman 집 진입');
        } else if (!insideSnowmanHouse && isInSnowmanHouseZone) {
          setIsInSnowmanHouseZone(false);
          closeModalForPlayer('myRoom', nickname);
          console.log('snowman 집 벗어남');
        }
      }

      // 3 : 진저브레드 캐릭터일 때 진저브레드 MyRoom 모달 열기
      if (characterType === 3) {
        const insideGingerbreadHouse = isInZone(
          characterPosition,
          zones.gingerbreadHouse,
        );
        if (insideGingerbreadHouse && !isInGingerbreadHouseZone) {
          setIsInGingerbreadHouseZone(true);
          openModalForPlayer('myRoom', nickname);
          console.log('gingerbread 집 진입');
        } else if (!insideGingerbreadHouse && isInGingerbreadHouseZone) {
          setIsInGingerbreadHouseZone(false);
          closeModalForPlayer('myRoom', nickname);
          console.log('Exited gingerbread 집 벗어남');
        }
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

  // 물리 충돌 이벤트 핸들러
  const handleCollisionEnter = () => {
    if (!showIntro) {
      console.log('충돌 발생!');
      collisionRef.current = true;
    }
  };

  const handleCollisionExit = () => {
    if (!showIntro) {
      console.log('충돌 해제!');
      collisionRef.current = false;
    }
  };

  useFrame((_, delta) => {
    mixer.current?.update(delta);
    if (scene) {
      scene.rotation.y = rotation;

      // 회전 처리: 키가 눌린 순간에만 회전
      if (rightPressed) {
        setRotation(rotation - Math.PI / 100); // 오른쪽 90도 회
      }
      if (leftPressed) {
        setRotation(rotation + Math.PI / 100); // 왼쪽 90도 회전
      }

      if (isOwnCharacter) {
        // 이동 속도 설정
        const moveDistance = 0.25;
        // 현재 캐릭터 위치 복사
        const newPosition = characterPosition.clone();

        if (collisionRef.current) {
          if (backPressed) {
            collisionRef.current = false;
            scene.position.copy(prevPositionRef.current);
            characterPosition.copy(prevPositionRef.current);
            newPosition.copy(prevPositionRef.current);
          } else {
            scene.position.copy(prevPositionRef.current);
            characterPosition.copy(prevPositionRef.current);
            newPosition.copy(prevPositionRef.current);
            return;
          }
        }

        if (forwardPressed && !collisionRef.current) {
          newPosition.x += Math.sin(rotation) * moveDistance;
          newPosition.z += Math.cos(rotation) * moveDistance;
        }
        if (backPressed && !collisionRef.current) {
          newPosition.x -= Math.sin(rotation) * moveDistance;
          newPosition.z -= Math.cos(rotation) * moveDistance;
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
          const moveSpeed = movementStateRef.current === 'walking' ? 0.25 : 0.3;
          const forwardDirection = new THREE.Vector3(
            Math.sin(rotation),
            0,
            Math.cos(rotation),
          );

          // 키 입력에 따른 방향 설정 (전진/후진)
          if (forwardPressed) {
            const newForwardPosition = characterPosition
              .clone()
              .add(forwardDirection.multiplyScalar(moveSpeed)); // 전진
            setCharacterPosition(newForwardPosition);
            scene.position.copy(newForwardPosition);
          }
          if (backPressed) {
            const newBackwardPosition = characterPosition
              .clone()
              .add(forwardDirection.multiplyScalar(-moveSpeed)); // 후진
            setCharacterPosition(newBackwardPosition);
            scene.position.copy(newBackwardPosition);
          }
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
          characterDirection={characterDirection}
          isModalOpen={isModalOpen}
          setIsCircling={setIsCircling}
          marketType={marketType}
        />
      )}

      <RigidBody
        type='dynamic'
        colliders={false}
        lockRotations={true}
        onCollisionEnter={handleCollisionEnter}
        onCollisionExit={handleCollisionExit}
        restitution={0} // 반발 계수 없애기
        friction={1} // 마찰력
      >
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
