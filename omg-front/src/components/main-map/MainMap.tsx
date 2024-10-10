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
import ExitButton from '@/components/common/ExitButton';
import MainAlert from '@/components/common/MainAlert';
import Notification from '@/components/common/Notification';
import Round from '@/components/common/Round';
import Timer from '@/components/common/Timer';
import CanvasLoader from '@/components/game/CanvasLoader';
import EventCard from '@/components/game/EventCard';
import EventEffect from '@/components/game/EventEffect';
import GameResult from '@/components/game/GameResult';
import Map from '@/components/main-map/Map';
import MiniMap from '@/components/mini-map/MiniMap';
import StockMarket from '@/components/stock-market/StockMarket';
import { useModalStore } from '@/stores/useModalStore';
import { useMyRoomStore } from '@/stores/useMyroomStore';
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

  const { modals } = useModalStore();
  const { isEnteringRoom } = useMyRoomStore();

  const { nickname } = useUser();

  const { eventCardMessage, eventEffectMessage, gameRoundMessage } =
    useSocketMessage();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isEventCardVisible, setIsEventCardVisible] = useState(false);
  const [isEventEffectVisible, setIsEventEffectVisible] = useState(false);
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [isTimerVisible, setIsTimerVisible] = useState(false);
  const [isRoundVisible, setIsRoundVisible] = useState(false);
  const [isBoardVisible, setIsBoardVisible] = useState(false);

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
      console.log('된겨?');
      initGameSetting();
    }
  }, [allRendered]);

  useEffect(() => {
    if (!eventCardMessage.title && !eventCardMessage.content) return;
    setIsEventCardVisible(true);

    const timer = setTimeout(() => {
      setIsEventCardVisible(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [eventCardMessage]);

  useEffect(() => {
    if (!eventEffectMessage.value) return;
    setIsEventEffectVisible(true);

    const timer = setTimeout(() => {
      setIsEventEffectVisible(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [eventEffectMessage]);

  // useEffect(() => {
  //   if (gameRoundMessage.message === '1' || gameRoundMessage.message === '10') {
  //     const timer = setTimeout(() => {
  //       setIsTimerVisible(true);
  //     }, 5000);
  //     return () => clearTimeout(timer);
  //   } else {
  //     const timer = setTimeout(() => {
  //       setIsTimerVisible(true);
  //     }, 10000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [gameRoundMessage]);

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
        setIsTimerVisible(true);
        setIsBoardVisible(true);
        break;
      case 'GAME_FINISHED':
        setIsRoundVisible(false);
        setIsTimerVisible(false);
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

  const openChattingModal = () => {
    setIsChatOpen(true);
  };

  const closeChattingModal = () => {
    setIsChatOpen(false);
  };

  return (
    <main className='relative w-full h-screen overflow-hidden'>
      {/* 배경 이미지 */}
      <div
        className='absolute inset-0 z-0 bg-center bg-cover'
        style={{
          backgroundImage: `url(${
            typeof presentRound === 'number'
              ? presentRound % 2 === 0
                ? '/assets/night-sky.jpg'
                : '/assets/morning-sky.jpg'
              : '/assets/morning-sky.jpg' // 기본 배경 이미지
          })`,
          opacity: 0.9,
        }}
      ></div>

      {/* 내 방 입장 알림 메시지 */}
      {isEnteringRoom[nickname] && (
        <div className='absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75'>
          <p className='tracking-wider text-white text-omg-50b test_obj'>
            <span>방</span>
            <span>으</span>
            <span>로</span>
            <span> </span>
            <span>들</span>
            <span>어</span>
            <span>가</span>
            <span>는</span>
            <span> </span>
            <span>중</span>
            <span>입</span>
            <span>니</span>
            <span>다</span>
            <span>...</span>
          </p>
        </div>
      )}

      {/* 내 방 Modal */}
      {modals[nickname]?.myRoom && <MyRoom />}

      {/* 주식 시장 Modal */}
      {modals[nickname]?.stockMarket && <StockMarket />}

      {/* 금 시장 모달 */}
      {modals[nickname]?.goldMarket && <GoldMarket />}

      {/* 대출 시장 모달 */}
      {modals[nickname]?.loanMarket && <LoanMarket />}

      {/* 게임 결과 모달 */}
      {isGameResultVisible && <GameResult />}

      {/* 마퀴 애니메이션 */}
      {isBoardVisible && (
        <section className='absolute top-0 left-0 z-20 w-full'>
          <MarketStatusBoard />
        </section>
      )}

      {/* Round & Timer 고정 위치 렌더링 */}
      <section className='absolute z-10 flex flex-col items-end gap-4 top-20 right-10'>
        {isRoundVisible && <Round presentRound={presentRound} />}
        {isTimerVisible && (
          <Timer time={roundTimer} presentRound={presentRound} />
        )}
        <Notification onNewNotification={handleNotificationSound} />
      </section>

      {isEventCardVisible && (
        <div className='absolute z-30 flex items-center justify-center w-full h-full'>
          <EventCard />
        </div>
      )}

      {isEventEffectVisible && (
        <div className='absolute z-30 flex items-center justify-center w-full h-full'>
          <EventEffect />
        </div>
      )}

      <section className='absolute z-10 left-4 top-20 drop-shadow-2xl'>
        {/* 미니맵 */}
        <MiniMap />
      </section>

      {/* TODO: 삭제해야됨 */}
      {isAlertVisible && gameRoundMessage.message && (
        <div className='absolute z-20 transform -translate-x-1/2 top-14 left-1/2 w-[60%]'>
          <MainAlert text={gameRoundMessage.message} />
        </div>
      )}

      {/* 채팅 및 음소거, 종료 버튼 고정 렌더링 */}
      <section className='absolute bottom-0 left-0 z-10 flex items-end justify-between w-full p-6 text-white text-omg-40b'>
        <ChatButton isWhite={true} onClick={openChattingModal} />
        {isChatOpen && <Chatting closeChattingModal={closeChattingModal} />}

        {/* 개인판 영역 */}
        {isBoardVisible && <PersonalBoard />}
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
          <Suspense fallback={<CanvasLoader />}>
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
