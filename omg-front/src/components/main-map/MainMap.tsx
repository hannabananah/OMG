import { Suspense, useContext, useEffect, useMemo, useState } from 'react';

import { CharacterInfo } from '@/assets/data/characterInfo';
import Character from '@/components/character/Character';
import Chatting from '@/components/chat/Chatting';
import Button from '@/components/common/Button';
import ExitButton from '@/components/common/ExitButton';
import MainAlert from '@/components/common/MainAlert';
import Round from '@/components/common/Round';
import Timer from '@/components/common/Timer';
import EventCard from '@/components/game/EventCard';
import Map from '@/components/main-map/Map';
import StockMarket from '@/components/stock-market/StockMarket';
import { useGameStore } from '@/stores/useGameStore';
import { useMainBoardStore } from '@/stores/useMainBoardStore';
import useModalStore from '@/stores/useModalStore';
import { useOtherUserStore } from '@/stores/useOtherUserState';
import { useSocketMessage } from '@/stores/useSocketMessage';
import useUser from '@/stores/useUser';
import { SocketContext } from '@/utils/SocketContext';
import { KeyboardControls, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';

import IntroCamera from '../camera/IntroCamera';
import ChatButton from '../common/ChatButton';
import GoldMarket from '../gold-market/GoldMarket';
import LoanMarket from '../loan-market/LoanMarket';
import MainBoard from '../main-board/MainBoard';
import MyRoom from '../my-room/MyRoom';
import PersonalBoard from '../personal-board/PersonalBoard';

export const Controls = {
  forward: 'forward',
  back: 'back',
  left: 'left',
  right: 'right',
  pickup: 'pickup',
};

const stockTypes = [
  { name: 'candy', id: 1 },
  { name: 'cupcake', id: 2 },
  { name: 'gift', id: 3 },
  { name: 'hat', id: 4 },
  { name: 'socks', id: 5 },
];

export default function MainMap() {
  const { characterType } = useUser();
  const { socket, online, initGameSetting, allRendered } =
    useContext(SocketContext);
  const { gameData, carryingCount, setCarryingCount } = useGameStore();

  const { otherUsers } = useOtherUserStore();
  const { tradableStockCnt } = useMainBoardStore();

  const { modals, openModal } = useModalStore();

  const { eventCardMessage, gameRoundMessage } = useSocketMessage();
  const { roundTimer, presentRound } = useContext(SocketContext);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [isTimerVisible, setIsTimerVisible] = useState(false);
  const [isRoundVisible, setIsRoundVisible] = useState(false);

  const keyboardMap = useMemo(
    () => [
      { name: Controls.forward, keys: ['ArrowUp'] },
      { name: Controls.back, keys: ['ArrowDown'] },
      { name: Controls.left, keys: ['ArrowLeft'] },
      { name: Controls.right, keys: ['ArrowRight'] },
      { name: Controls.pickup, keys: ['Space'] },
    ],
    [],
  );

  useEffect(() => {
    if (socket && online && allRendered) {
      initGameSetting();
    }
  }, [allRendered]);

  useEffect(() => {
    if (socket && online && allRendered) {
      console.log('서버에서 받아온 gameData 확인!!!!!!!!!!!!!!', gameData);
    }
  }, [allRendered, gameData]);

  useEffect(() => {
    if (!eventCardMessage.title && !eventCardMessage.content) return;
    setIsVisible(true);

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [eventCardMessage]);

  useEffect(() => {
    if (gameRoundMessage.message === '1' || gameRoundMessage.message === '10') {
      const timer = setTimeout(() => {
        setIsTimerVisible(true);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setIsTimerVisible(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [gameRoundMessage]);

  // TODO: 삭제해야됨, 주식 매도 집에서 들고갈때
  useEffect(() => {
    console.log('carryingCount has changed:', carryingCount);
  }, [carryingCount]);

  // TODO: 삭제해야됨, 라운드 알림 모달
  useEffect(() => {
    if (!gameRoundMessage.message) return;

    let displayDuration = 2000;

    switch (gameRoundMessage.roundStatus) {
      case 'ROUND_END':
        setIsTimerVisible(false);
        break;
      case 'ROUND_START':
        setIsRoundVisible(true);
        break;
      case 'GAME_FINISHED':
        setIsRoundVisible(false);
        break;
      default:
        break;
    }

    if (gameRoundMessage.message) {
      setIsAlertVisible(true);
    } else {
      setIsAlertVisible(false);
    }

    const timer = setTimeout(() => {
      setIsAlertVisible(false);
    }, displayDuration);

    return () => clearTimeout(timer);
  }, [gameRoundMessage]);

  // TODO: 삭제해야됨, 주식 매도 집에서 들고갈때
  const handleClickStock = (stockId: number) => {
    setCarryingCount((prevData: number[]) => {
      const newCarryingCount = [...prevData];

      if (newCarryingCount[stockId] + 1 > tradableStockCnt) {
        alert(`${tradableStockCnt}를 초과해서 선택할 수 없습니다.`);
        return prevData;
      }

      if (stockId >= 0 && stockId < newCarryingCount.length) {
        newCarryingCount[stockId] += 1;
      }
      return newCarryingCount;
    });
  };
  const characterKeys = Object.keys(CharacterInfo) as Array<
    keyof typeof CharacterInfo
  >;

  const selectedCharacterKey = characterKeys[characterType] || 'santa';
  const selectedCharacter = CharacterInfo[selectedCharacterKey];

  const otherCharacters = otherUsers.map(user => {
    const userCharacterKey = characterKeys[user.characterType] || 'santa';

    return {
      id: user.id,
      ...CharacterInfo[userCharacterKey],
      position: user.position,
      direction: user.direction,
      actionToggle: user.actionToggle,
    };
  });

  const openMainSettingsModal = () => {
    if (!modals.mainBoard) {
      openModal('mainBoard');
    }
  };

  const openPersonalSettingsModal = () => {
    if (!modals.personalBoard) {
      openModal('personalBoard');
    }
  };

  const openPersonalMissionModal = () => {
    alert('게임 미션 모달 띄워주기');
  };

  const openMyRoomModal = () => {
    if (!modals.myRoom) {
      openModal('myRoom');
    }
  };

  const openStockMarketModal = () => {
    if (!modals.stockMarket) {
      openModal('stockMarket');
    }
  };

  const openGoldMarketModal = () => {
    if (!modals.goldMarket) {
      openModal('goldMarket');
    }
  };

  const openLoanMarketModal = () => {
    if (!modals.loanMarket) {
      openModal('loanMarket');
    }
  };

  const openChattingModal = () => {
    setIsChatOpen(true);
  };

  const closeChattingModal = () => {
    setIsChatOpen(false);
  };

  return (
    <main className='relative w-full h-screen overflow-hidden'>
      {/* 메인판 Modal */}
      {modals.mainBoard && <MainBoard />}

      {/* 개인판 Modal */}
      {modals.personalBoard && <PersonalBoard />}

      {/* 내 방 Modal */}
      {modals.myRoom && <MyRoom />}

      {/* 주식 시장 Modal */}
      {modals.stockMarket && <StockMarket />}

      {/* 금 시장 모달 */}
      {modals.goldMarket && <GoldMarket />}

      {/* 대출 시장 모달 */}
      {modals.loanMarket && <LoanMarket />}

      {/* 주식 매도 수량 선택(집에서) */}
      <div className='px-10 py-2'>
        {stockTypes.map(stock => (
          <button
            key={stock.id}
            className='mr-5'
            onClick={() => handleClickStock(stock.id)}
          >
            {stock.name}
          </button>
        ))}
      </div>

      {/* Round & Timer & Chat 고정 위치 렌더링 */}
      <section className='absolute z-10 flex flex-col items-end gap-4 top-10 right-10'>
        {isRoundVisible && <Round presentRound={presentRound} />}
        {isTimerVisible && <Timer time={roundTimer} />}
      </section>

      {/* TODO: 삭제해야됨, EventCard 모달 위치 */}
      {isVisible && (
        <div className='absolute z-30 flex items-center justify-center w-full h-full'>
          <EventCard />
        </div>
      )}

      {/* 모달 모음 */}
      <section className='absolute z-10 flex flex-col items-start gap-4 left-10 top-10'>
        <Button text='메인 판' type='mainmap' onClick={openMainSettingsModal} />
        <Button
          text='개인 판'
          type='mainmap'
          onClick={openPersonalSettingsModal}
        />
        <Button
          text='게임 미션'
          type='mainmap'
          onClick={openPersonalMissionModal}
        />
        {/* TODO: 삭제해야됨, 임시 내 방 버튼 */}
        <Button
          text='임시 내 방 버튼'
          type='mainmap'
          onClick={openMyRoomModal}
        />
        {/* TODO: 삭제해야됨, 임시 주식 시장 버튼 */}
        <Button
          text='임시 주식 시장 버튼'
          type='mainmap'
          onClick={openStockMarketModal}
        />
        {/* TODO: 삭제해야됨, 임시 금 시장 버튼 */}
        <Button
          text='임시 금 시장 버튼'
          type='mainmap'
          onClick={openGoldMarketModal}
        />
        {/* TODO: 삭제해야됨, 임시 대출 시장 버튼 */}
        <Button
          text='임시 대출 시장 버튼'
          type='mainmap'
          onClick={openLoanMarketModal}
        />
      </section>

      {/* TODO: 삭제해야됨 */}
      {isAlertVisible && gameRoundMessage.message && (
        <div className='absolute z-20 transform -translate-x-1/2 top-14 left-1/2 w-[60%]'>
          <MainAlert text={gameRoundMessage.message} />
        </div>
      )}

      {/* 채팅 및 종료 버튼 고정 렌더링 */}
      <section className='absolute bottom-0 left-0 z-10 flex items-end justify-between w-full p-10 text-white text-omg-40b'>
        {!isChatOpen ? (
          <ChatButton isWhite={true} onClick={openChattingModal} />
        ) : (
          <Chatting closeChattingModal={closeChattingModal} />
        )}
        <ExitButton />
      </section>

      <KeyboardControls map={keyboardMap}>
        <Canvas>
          <Suspense>
            <OrbitControls />
            <axesHelper args={[800]} />
            <IntroCamera />
            <Physics timeStep='vary' colliders={false} debug>
              <ambientLight />
              <directionalLight />

              <Map />

              {/* <PerspectiveCamera /> */}
              {/* 본인 캐릭터 */}

              <Character
                characterURL={selectedCharacter.url}
                characterScale={selectedCharacter.scale}
                isOwnCharacter={true}
              />

              {/* 다른 유저들 캐릭터 */}
              {otherCharacters.map(userCharacter => (
                <Character
                  key={userCharacter.id}
                  characterURL={userCharacter.url}
                  characterScale={userCharacter.scale}
                  position={userCharacter.position}
                  direction={userCharacter.direction}
                  actionToggle={userCharacter.actionToggle}
                  isOwnCharacter={false}
                />
              ))}
            </Physics>
          </Suspense>
        </Canvas>
      </KeyboardControls>
    </main>
  );
}
