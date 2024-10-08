import {
  Fragment,
  Suspense,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { IoVolumeHigh, IoVolumeMuteSharp } from 'react-icons/io5';

import { CharacterInfo } from '@/assets/data/characterInfo';
import Character from '@/components/character/Character';
import Chatting from '@/components/chat/Chatting';
import Button from '@/components/common/Button';
import ExitButton from '@/components/common/ExitButton';
import MainAlert from '@/components/common/MainAlert';
import Notification from '@/components/common/Notification';
import Round from '@/components/common/Round';
import Timer from '@/components/common/Timer';
import EventCard from '@/components/game/EventCard';
import GameResult from '@/components/game/GameResult';
import Map from '@/components/main-map/Map';
import StockMarket from '@/components/stock-market/StockMarket';
import useModalStore from '@/stores/useModalStore';
import { useOtherUserStore } from '@/stores/useOtherUserState';
import { useSocketMessage } from '@/stores/useSocketMessage';
import useUser from '@/stores/useUser';
import { SocketContext } from '@/utils/SocketContext';
import { KeyboardControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';

import ChatButton from '../common/ChatButton';
import GoldMarket from '../gold-market/GoldMarket';
import LoanMarket from '../loan-market/LoanMarket';
import MyRoom from '../my-room/MyRoom';
import PersonalBoard from '../personal-board/PersonalBoard';
import MarketStatusBoard from './MarketStatusBoard';

export const Controls = {
  forward: 'forward',
  back: 'back',
  left: 'left',
  right: 'right',
  pickup: 'pickup',
};

export default function MainMap() {
  const { characterType } = useUser();
  const {
    socket,
    online,
    initGameSetting,
    allRendered,
    isGameResultVisible,
    roundTimer,
    presentRound,
  } = useContext(SocketContext);

  const { otherUsers } = useOtherUserStore();

  const { modals, openModal } = useModalStore();
  const { eventCardMessage, gameRoundMessage } = useSocketMessage();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [isTimerVisible, setIsTimerVisible] = useState(false);
  const [isRoundVisible, setIsRoundVisible] = useState(false);
  const [bgm, setBgm] = useState(null);
  const [isMuted, setIsMuted] = useState(false);

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

  useEffect(() => {
    const audio = new Audio('/music/background.mp3');
    audio.loop = true;
    setBgm(audio);

    if (!isMuted) {
      audio.play();
    }

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  const handleNotificationSound = () => {
    if (bgm) {
      bgm.pause();
    }

    const alertSound = new Audio('/music/bell-alert.mp3');
    alertSound.play();

    setTimeout(() => {
      if (bgm && !isMuted) {
        bgm.play();
      }
    }, 2000);
  };

  const toggleMute = () => {
    if (isMuted) {
      bgm?.play();
    } else {
      bgm?.pause();
    }
    setIsMuted(!isMuted);
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

  // const openStockMarketModal = () => {
  //   if (!modals.stockMarket) {
  //     openModal('stockMarket');
  //   }
  // };

  // const openGoldMarketModal = () => {
  //   if (!modals.goldMarket) {
  //     openModal('goldMarket');
  //   }
  // };

  // const openLoanMarketModal = () => {
  //   if (!modals.loanMarket) {
  //     openModal('loanMarket');
  //   }
  // };

  const openChattingModal = () => {
    setIsChatOpen(true);
  };

  const closeChattingModal = () => {
    setIsChatOpen(false);
  };

  return (
    <main className='relative w-full h-screen overflow-hidden'>
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

      {/* 게임 결과 모달 */}
      {isGameResultVisible && <GameResult />}

      {/* 마퀴 애니메이션 */}
      <section className='absolute top-0 left-0 z-20 w-full'>
        <MarketStatusBoard />
      </section>

      {/* Round & Timer & Chat 고정 위치 렌더링 */}
      <section className='absolute z-10 flex flex-col items-end gap-4 top-20 right-10'>
        {isRoundVisible && <Round presentRound={presentRound} />}
        {isTimerVisible && <Timer time={roundTimer} />}
        <Notification onNewNotification={handleNotificationSound} />
      </section>

      {/* TODO: 삭제해야됨, EventCard 모달 위치 */}
      {isVisible && (
        <div className='absolute z-30 flex items-center justify-center w-full h-full'>
          <EventCard />
        </div>
      )}

      {/* 모달 모음 */}
      <section className='absolute z-10 flex flex-col items-start gap-4 left-10 top-20'>
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
        {/* <Button
          text='임시 주식 시장 버튼'
          type='mainmap'
          onClick={openStockMarketModal}
        /> */}
        {/* TODO: 삭제해야됨, 임시 금 시장 버튼 */}
        {/* <Button
          text='임시 금 시장 버튼'
          type='mainmap'
          onClick={openGoldMarketModal}
        /> */}
        {/* TODO: 삭제해야됨, 임시 대출 시장 버튼 */}
        {/* <Button
          text='임시 대출 시장 버튼'
          type='mainmap'
          onClick={openLoanMarketModal}
        /> */}
      </section>

      {/* TODO: 삭제해야됨 */}
      {isAlertVisible && gameRoundMessage.message && (
        <div className='absolute z-20 transform -translate-x-1/2 top-14 left-1/2 w-[60%]'>
          <MainAlert text={gameRoundMessage.message} />
        </div>
      )}

      {/* 채팅 및 음소거, 종료 버튼 고정 렌더링 */}
      <section className='absolute bottom-0 left-0 z-10 flex items-end justify-between w-full p-10 text-white text-omg-40b '>
        {!isChatOpen ? (
          <ChatButton isWhite={true} onClick={openChattingModal} />
        ) : (
          <Chatting closeChattingModal={closeChattingModal} />
        )}
        <div className='flex flex-col'>
          <button
            className='mb-4 text-omg-50b'
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <IoVolumeMuteSharp /> : <IoVolumeHigh />}
          </button>
          <ExitButton />
        </div>
      </section>

      <KeyboardControls map={keyboardMap}>
        <Canvas>
          <Suspense>
            {/* <OrbitControls /> */}

            <Physics timeStep='vary' colliders={false}>
              <ambientLight intensity={1.5} />
              <directionalLight
                intensity={2.0}
                position={[10, 15, 10]}
                castShadow
              />
              <pointLight intensity={2.0} position={[0, 10, 0]} />
              <Map />
              {/* 본인 캐릭터 */}
              <Character
                characterURL={selectedCharacter.url}
                characterScale={selectedCharacter.scale}
                isOwnCharacter={true}
                startPosition={selectedCharacter.startPosition}
              />
              <spotLight
                position={[0, 10, 5]}
                angle={0.5}
                intensity={10}
                penumbra={0.3}
                castShadow
              />
              {/* 다른 유저들 캐릭터 */}
              {otherCharacters.map(userCharacter => (
                <Fragment key={userCharacter.id}>
                  <Character
                    characterURL={userCharacter.url}
                    characterScale={userCharacter.scale}
                    position={userCharacter.position}
                    direction={userCharacter.direction}
                    actionToggle={userCharacter.actionToggle}
                    startPosition={userCharacter.startPosition}
                    isOwnCharacter={false}
                  />

                  <spotLight
                    position={[
                      userCharacter.position[0],
                      userCharacter.position[1] + 8,
                      userCharacter.position[2] - 3,
                    ]}
                    angle={0.8}
                    intensity={7}
                    penumbra={0.2}
                    castShadow
                  />
                </Fragment>
              ))}
            </Physics>
          </Suspense>
        </Canvas>
      </KeyboardControls>
    </main>
  );
}
