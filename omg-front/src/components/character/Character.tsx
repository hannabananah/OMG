import { useContext, useEffect, useRef, useState } from 'react';

// import { TbSquareArrowDown } from 'react-icons/tb';
import { Controls } from '@/components/main-map/MainMap';
import { useCharacter } from '@/hooks';
import {
  useGameStore,
  useIntroStore,
  useMiniMoneyStore,
  useModalStore,
  useMyRoomStore,
  useUser,
} from '@/stores';
import { SocketContext } from '@/utils';
import { Html, useKeyboardControls } from '@react-three/drei';
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
  isTrading?: boolean;
  isCarrying?: boolean;
  animation?: 'idle' | 'walking' | 'running';
}

export default function Character({
  position,
  direction,
  actionToggle,
  characterURL,
  characterScale,
  isOwnCharacter = false,
  startPosition,
  isTrading: serverIsTrading,
  isCarrying: serverIsCarrying,
  animation: externalAnimationState,
}: Props) {
  const { movePlayer } = useContext(SocketContext);
  const { modals, openModal, closeModal } = useModalStore();
  const { setIsEnteringRoom, setIsExitingRoom, setIsFadingOut } =
    useMyRoomStore();
  const { playerCash } = useMiniMoneyStore();

  const { nickname, characterType } = useUser();

  const [localActionToggle, setLocalActionToggle] = useState(false);
  const [characterPosition, setCharacterPosition] = useState(
    new THREE.Vector3(...startPosition),
  );
  const {
    gameData,
    carryingToMarketCount,
    carryingToHomeCount,
    isClosedEachOther,
  } = useGameStore();
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
  const [localIsTrading, setLocalIsTrading] = useState(false);
  const [localIsCarrying, setLocalIsCarrying] = useState(false);

  const isTrading = isOwnCharacter ? localIsTrading : serverIsTrading;
  const isCarrying = isOwnCharacter ? localIsCarrying : serverIsCarrying;

  const [isCircling, setIsCircling] = useState(false);
  const [marketType, setMarketType] = useState<
    null | 'loanMarket' | 'stockMarket' | 'goldMarket'
  >(null);
  const getPlayerRank = (
    player: string | undefined,
    rankings: string[] | undefined,
  ) => {
    return player && Array.isArray(rankings) && rankings.includes(player)
      ? rankings.indexOf(player) + 1
      : null;
  };

  const [player1, player2] = isClosedEachOther?.players?.split(':') || ['', ''];
  const playerRankings = player1 && player2 && gameData?.playerRanking;

  const player1Rank = getPlayerRank(player1, playerRankings);
  const player2Rank = getPlayerRank(player2, playerRankings);

  const isCloseEnough = isClosedEachOther?.isAvailable ?? false;

  const [showRank, setShowRank] = useState(false);
  const [showMoney, setShowMoney] = useState(false);

  useEffect(() => {
    if (
      isOwnCharacter &&
      player1Rank !== null &&
      player2Rank !== null &&
      isCloseEnough
    ) {
      setShowRank(true);
    } else {
      setShowRank(false);
    }
  }, [isOwnCharacter, player1Rank, player2Rank, isCloseEnough]);

  useEffect(() => {
    if ((isOwnCharacter && playerCash === 1) || playerCash === 5) {
      setShowMoney(true);

      const timer = setTimeout(() => setShowMoney(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [playerCash]);

  const { scene, mixer, pickUpAnimation } = useCharacter({
    characterURL,
    onMovementChange: state => (movementStateRef.current = state),
    onRotationChange: setRotation,
    onPositionChange: setCharacterPosition,
    onActionToggleChange: setLocalActionToggle,
    isOwnCharacter,
    animation: externalAnimationState,
  });

  const characterDirection = new THREE.Vector3(
    Math.sin(rotation),
    0,
    Math.cos(rotation),
  );

  const openMarketForPlayer = (modalId: string, playerNickname: string) => {
    if (!modals[playerNickname]?.[modalId]) {
      openModal(modalId, playerNickname);
    }
  };
  const closeMarketForPlayer = (modalId: string, playerNickname: string) => {
    if (modals[playerNickname]?.[modalId]) {
      closeModal(modalId, playerNickname);
    }
  };

  const openModalForPlayer = (modalId: string, playerNickname: string) => {
    if (!modals[playerNickname]?.[modalId]) {
      setIsEnteringRoom(playerNickname, true);
      setTimeout(() => {
        setIsEnteringRoom(playerNickname, false);
        openModal(modalId, playerNickname);
      }, 5000);
    }
  };
  const closeModalForPlayer = (modalId: string, playerNickname: string) => {
    if (modals[playerNickname]?.[modalId]) {
      setIsExitingRoom(playerNickname, true);
      setIsFadingOut(true);

      setTimeout(() => {
        setIsExitingRoom(playerNickname, false);
        setIsFadingOut(false);
        closeModal(modalId, playerNickname);
      }, 5000);
    }
  };

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

  useEffect(() => {
    if (marketType && !isCircling) {
      setIsCircling(true);
    }
  }, [marketType, isCircling]);

  useEffect(() => {
    if (!isOwnCharacter) return;

    const insideStockMarket = isInZone(characterPosition, zones.stockMarket);
    if (insideStockMarket && !isInStockMarketZone) {
      setIsInStockMarketZone(true);
      setMarketType('stockMarket');
      setIsModalOpen(true);
      setIsCircling(true);
      openMarketForPlayer('stockMarket', nickname);
    } else if (!insideStockMarket && isInStockMarketZone) {
      setIsInStockMarketZone(false);
      setMarketType(null);
      closeMarketForPlayer('stockMarket', nickname);
      setIsModalOpen(false);
    }
    const insideLoanMarket = isInZone(characterPosition, zones.loanMarket);
    if (insideLoanMarket && !isInLoanMarketZone) {
      setIsInLoanMarketZone(true);
      setMarketType('loanMarket');
      setIsModalOpen(true);
      setIsCircling(true);
      openMarketForPlayer('loanMarket', nickname);
    } else if (!insideLoanMarket && isInLoanMarketZone) {
      setIsInLoanMarketZone(false);
      setMarketType(null);
      closeMarketForPlayer('loanMarket', nickname);
      setIsModalOpen(false);
    }
    const insideGoldMarket = isInZone(characterPosition, zones.goldMarket);
    if (insideGoldMarket && !isInGoldMarketZone) {
      setIsInGoldMarketZone(true);
      setMarketType('goldMarket');
      setIsModalOpen(true);
      setIsCircling(true);
      openMarketForPlayer('goldMarket', nickname);
    } else if (!insideGoldMarket && isInGoldMarketZone) {
      setIsInGoldMarketZone(false);
      setMarketType(null);
      closeMarketForPlayer('goldMarket', nickname);
      setIsModalOpen(false);
    }

    setLocalIsTrading(
      insideStockMarket || insideLoanMarket || insideGoldMarket,
    );

    const insideHouse =
      (characterType === 0 && isInZone(characterPosition, zones.santaHouse)) ||
      (characterType === 1 && isInZone(characterPosition, zones.elfHouse)) ||
      (characterType === 2 &&
        isInZone(characterPosition, zones.snowmanHouse)) ||
      (characterType === 3 &&
        isInZone(characterPosition, zones.gingerbreadHouse));

    if (insideHouse) {
      setLocalIsTrading(true);
    }

    // 자기 집
    // 0: 산타 본인 MyRoom 모달 열기
    if (characterType === 0) {
      const insideSantaHouse = isInZone(characterPosition, zones.santaHouse);
      if (insideSantaHouse && !isInSantaHouseZone) {
        setIsInSantaHouseZone(true);
        openModalForPlayer('myRoom', nickname);
      } else if (!insideSantaHouse && isInSantaHouseZone) {
        setIsInSantaHouseZone(false);
        closeModalForPlayer('myRoom', nickname);
      }
    }

    // 1 : 엘프 본인 MyRoom 모달 열기
    if (characterType === 1) {
      const insideElfHouse = isInZone(characterPosition, zones.elfHouse);
      if (insideElfHouse && !isInElfHouseZone) {
        setIsInElfHouseZone(true);
        openModalForPlayer('myRoom', nickname);
      } else if (!insideElfHouse && isInElfHouseZone) {
        setIsInElfHouseZone(false);
        closeModalForPlayer('myRoom', nickname);
      }
    }

    // 2 : 눈사람 본인 MyRoom 모달 열기
    if (characterType === 2) {
      const insideSnowmanHouse = isInZone(
        characterPosition,
        zones.snowmanHouse,
      );
      if (insideSnowmanHouse && !isInSnowmanHouseZone) {
        setIsInSnowmanHouseZone(true);
        openModalForPlayer('myRoom', nickname);
      } else if (!insideSnowmanHouse && isInSnowmanHouseZone) {
        setIsInSnowmanHouseZone(false);
        closeModalForPlayer('myRoom', nickname);
      }
    }

    // 3 : 진저브레드 본인 MyRoom 모달 열기
    if (characterType === 3) {
      const insideGingerbreadHouse = isInZone(
        characterPosition,
        zones.gingerbreadHouse,
      );
      if (insideGingerbreadHouse && !isInGingerbreadHouseZone) {
        setIsInGingerbreadHouseZone(true);
        openModalForPlayer('myRoom', nickname);
      } else if (!insideGingerbreadHouse && isInGingerbreadHouseZone) {
        setIsInGingerbreadHouseZone(false);
        closeModalForPlayer('myRoom', nickname);
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

  const handleCollisionEnter = () => {
    if (!showIntro && isOwnCharacter && !collisionRef.current) {
      collisionRef.current = true;
      prevPositionRef.current.copy(characterPosition);
    }
  };

  useEffect(() => {
    if (!isOwnCharacter) return;

    const isCarrying =
      carryingToMarketCount?.some(count => count > 0) ||
      carryingToHomeCount?.some(count => count > 0);

    setLocalIsCarrying(isCarrying);
  }, [carryingToMarketCount, carryingToHomeCount, isOwnCharacter]);

  useEffect(() => {
    if (isOwnCharacter) {
      const positionArray = characterPosition.toArray();
      const directionArray = [Math.sin(rotation), 0, Math.cos(rotation)];

      movePlayer(
        positionArray,
        directionArray,
        localActionToggle,
        isTrading,
        isCarrying,
        movementStateRef.current,
      );
    }
  }, [characterPosition, rotation, localActionToggle, isTrading, isCarrying]);

  useFrame((_, delta) => {
    if (!showIntro && isOwnCharacter && collisionRef.current && backPressed) {
      collisionRef.current = false;
    }

    mixer.current?.update(delta);
    if (scene) {
      scene.rotation.y = rotation;

      if (rightPressed) {
        setRotation(rotation - Math.PI / 100); // 오른쪽 90도 회전
      }
      if (leftPressed) {
        setRotation(rotation + Math.PI / 100); // 왼쪽 90도 회전
      }

      if (isOwnCharacter) {
        const moveDistance = 0.3;
        const newPosition = characterPosition.clone();

        if (collisionRef.current) {
          scene.position.copy(prevPositionRef.current);
          characterPosition.copy(prevPositionRef.current);
          newPosition.copy(prevPositionRef.current);

          if (backPressed) {
            collisionRef.current = false;
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

        if (!newPosition.equals(prevPositionRef.current)) {
          const positionArray = newPosition.toArray();
          const directionArray = [Math.sin(rotation), 0, Math.cos(rotation)];
          movePlayer(
            positionArray,
            directionArray,
            localActionToggle,
            isTrading,
            isCarrying,
            movementStateRef.current,
          );
          prevPositionRef.current.copy(newPosition);
        }
        setCharacterPosition(newPosition);
        scene.position.copy(newPosition);

        if (
          movementStateRef.current === 'walking' ||
          movementStateRef.current === 'running'
        ) {
          const moveSpeed = movementStateRef.current === 'walking' ? 0.3 : 0.4;
          const forwardDirection = new THREE.Vector3(
            Math.sin(rotation),
            0,
            Math.cos(rotation),
          );

          if (forwardPressed) {
            const newForwardPosition = characterPosition
              .clone()
              .add(forwardDirection.multiplyScalar(moveSpeed));
            setCharacterPosition(newForwardPosition);
            scene.position.copy(newForwardPosition);
          }
          if (backPressed) {
            const newBackwardPosition = characterPosition
              .clone()
              .add(forwardDirection.multiplyScalar(-moveSpeed));
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
          isColliding={collisionRef.current}
        />
      )}
      <pointLight
        position={[
          characterPosition.x - 5,
          characterPosition.y + 5,
          characterPosition.z,
        ]}
        intensity={1}
      />
      <directionalLight
        intensity={1.2}
        position={[
          characterPosition.x,
          characterPosition.y + 10,
          characterPosition.z + 5,
        ]}
        castShadow
      />
      <spotLight
        position={[
          characterPosition.x,
          characterPosition.y + 8,
          characterPosition.z + 2,
        ]}
        angle={1.2}
        intensity={10}
        penumbra={0.4}
        castShadow
      />
      <RigidBody
        key={`body-${characterType}`}
        type='dynamic'
        colliders={false}
        lockRotations={true}
        onCollisionEnter={handleCollisionEnter}
        restitution={0}
        friction={1}
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

        {(() => {
          const flattenedItems: JSX.Element[] = [];

          if (serverIsTrading) {
            flattenedItems.push(
              <Html
                key={`trading-${characterType}`}
                position={[
                  characterPosition.x,
                  characterPosition.y + 5,
                  characterPosition.z,
                ]}
                center
              >
                <div className='flex items-center justify-center w-24 h-10 p-2 border-4 border-white font-omg-event-content bounce-animation bg-white1 text-nowrap bg-opacity-90 rounded-20'>
                  거래중...
                </div>
              </Html>,
            );
          }

          // if (collisionRef.current === true) {
          //   flattenedItems.push(
          //     <Html
          //       key={`collision-${characterType}`}
          //       position={[
          //         characterPosition.x,
          //         characterPosition.y + 3,
          //         characterPosition.z,
          //       ]}
          //       center
          //     >
          //       <div className='flex justify-center'>
          //         <TbSquareArrowDown className='mt-2 text-white text-omg-32' />
          //       </div>
          //       <div className='flex items-center justify-center w-auto h-10 p-2 border-4 border-white font-omg-event-content bounce-animation bg-white1 text-nowrap bg-opacity-90 rounded-20'>
          //         아래 방향키를 눌러서 장애물을 빠져나오세요!!
          //       </div>
          //     </Html>,
          //   );
          // }

          if (isCarrying) {
            flattenedItems.push(
              <Item
                key={`carrying-${characterType}`}
                disabled={true}
                position={characterPosition}
                index={flattenedItems.length * 1.8}
                itemName={'pouch'}
              />,
            );
          }

          if (showRank) {
            flattenedItems.push(
              <Html
                key={`rank-${characterType}`}
                position={[
                  characterPosition.x,
                  characterPosition.y + 6,
                  characterPosition.z,
                ]}
                center
                zIndexRange={[30, 0]}
              >
                <div className='flex flex-col items-center justify-center w-32 h-12 p-2 border-4 border-white bg-white1 text-nowrap bg-opacity-90 font-omg-event-content rounded-20'>
                  {nickname === player1 ? (
                    <div>상대방 순위 {player2Rank}위</div>
                  ) : (
                    nickname === player2 && (
                      <div>상대방 순위 {player1Rank}위</div>
                    )
                  )}
                </div>
              </Html>,
            );
          }

          if (showMoney && isOwnCharacter) {
            flattenedItems.push(
              <Html
                key={`miniMoney-${characterType}`}
                position={[
                  characterPosition.x,
                  characterPosition.y + 6,
                  characterPosition.z,
                ]}
                center
              >
                <div className='flex flex-col items-center justify-center w-32 h-12 p-2 border-4 border-white bg-white1 text-nowrap bg-opacity-90 font-omg-event-content rounded-20 text-omg-24b move-up-fade-out'>
                  +{playerCash}
                </div>
              </Html>,
            );
          }

          return flattenedItems;
        })()}
      </RigidBody>
    </>
  );
}
