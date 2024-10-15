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
import {
  ChatButton,
  ExitButton,
  Notification,
  Round,
  Timer,
} from '@/components/common';
import {
  CanvasLoader,
  EventCard,
  EventEffect,
  GameResult,
} from '@/components/game';
import Map from '@/components/main-map/Map';
import MiniMap from '@/components/mini-map/MiniMap';
import { StockChangeAlert, getAlertComponent } from '@/components/notification';
import { StockMarket } from '@/components/stock-market';
import { useAlertStore } from '@/stores/useAlertStore';
import { useIntroStore } from '@/stores/useIntroStore';
import { useMiniMoneyStore } from '@/stores/useMiniMoneyStore';
import { useModalStore } from '@/stores/useModalStore';
import { useMyRoomStore } from '@/stores/useMyRoomStore';
import { useOtherUserStore } from '@/stores/useOtherUserState';
import { useSocketMessage } from '@/stores/useSocketMessage';
import useUser from '@/stores/useUser';
import { SocketContext } from '@/utils/SocketContext';
import { KeyboardControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';

import GoldMarket from '../gold-market/GoldMarket';
import LoanMarket from '../loan-market/LoanMarket';
import MoneyCanvas from '../mini-game/money/MoneyCanvas';
import MyRoom from '../my-room/MyRoom';
import PersonalBoard from '../personal-board/PersonalBoard';
import MarketStatusBoard from './MarketStatusBoard';
import Tutorial from './Tutorial';

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

  const { isTutorialModalOpen, closeTutorialModal } = useIntroStore();

  const { nickname } = useUser();

  const { eventCardMessage, eventEffectMessage, gameRoundMessage } =
    useSocketMessage();
  const { moneyPoints, resetCoordinateState } = useMiniMoneyStore();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isEventCardVisible, setIsEventCardVisible] = useState(false);
  const [isEventEffectVisible, setIsEventEffectVisible] = useState(false);
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [isTimerVisible, setIsTimerVisible] = useState(false);
  const [isRoundVisible, setIsRoundVisible] = useState(false);
  const [isBoardVisible, setIsBoardVisible] = useState(false);

  const {
    isStockChangeAlertVisible,
    stockChangeAlertMessage,
    setStockChangeAlertVisible,
    setStockChangeAlertMessage,
  } = useAlertStore();

  const [bgm, setBgm] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isKeyboardPossible, setIsKeyboardPossible] = useState(false);

  const keyboardMap = useMemo(
    () =>
      isKeyboardPossible
        ? [
            { name: Controls.forward, keys: ['ArrowUp'] },
            { name: Controls.back, keys: ['ArrowDown'] },
            { name: Controls.left, keys: ['ArrowLeft'] },
            { name: Controls.right, keys: ['ArrowRight'] },
            { name: Controls.pickup, keys: ['Space'] },
          ]
        : [],
    [isKeyboardPossible],
  );

  useEffect(() => {
    if (socket && online && allRendered) {
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

  // [리렌더링 문제로 인해] 주가 변동 메시지를 받았을 때 알림을 표시하는 로직 따로 처리
  useEffect(() => {
    if (!gameRoundMessage.message) return;

    if (gameRoundMessage.message.includes('주가')) {
      setStockChangeAlertMessage(gameRoundMessage.message);
      setStockChangeAlertVisible(true);

      // 5초 후에 알림을 사라지게 설정
      const timer = setTimeout(() => {
        setStockChangeAlertVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [gameRoundMessage.message]);

  // TODO: 삭제해야됨, 라운드 알림 모달
  useEffect(() => {
    if (!gameRoundMessage.message) return;

    let displayDuration = 2000;

    switch (gameRoundMessage.roundStatus) {
      case 'ROUND_END':
        setIsKeyboardPossible(false);
        setIsTimerVisible(false);
        resetCoordinateState();
        break;
      case 'ROUND_START':
        closeTutorialModal();
        setIsKeyboardPossible(true);
        setIsRoundVisible(true);
        setIsTimerVisible(true);
        setIsBoardVisible(true);
        break;
      case 'GAME_FINISHED':
        setIsKeyboardPossible(false);
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
      isTrading: user.isTrading,
      isCarrying: user.isCarrying,
      animation: user.animation,
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

      {/* 제일 처음에만 보여줄 튜토리얼 */}
      {isTutorialModalOpen && (
        <div className='absolute top-0 left-0 z-50 w-full h-full'>
          <Tutorial />
        </div>
      )}

      {/* 내 방 입장 알림 메시지 */}
      {isEnteringRoom[nickname] && (
        <div className='absolute inset-0 z-40 flex items-center justify-center bg-black bg-opacity-75'>
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
        <section className='absolute top-0 left-0 z-10 w-full'>
          <MarketStatusBoard />
        </section>
      )}

      {/* Round & Timer 고정 위치 렌더링 */}
      <section className='absolute z-10 flex flex-col items-end gap-4 top-36 right-10'>
        {isRoundVisible && <Round presentRound={presentRound} />}
        {isTimerVisible && (
          <Timer time={roundTimer} presentRound={presentRound} />
        )}
        <Notification onNewNotification={handleNotificationSound} />
      </section>

      {isEventCardVisible && (
        <div className='absolute z-40 flex items-center justify-center w-full h-full'>
          <EventCard />
        </div>
      )}

      {isEventEffectVisible && (
        <div className='absolute z-30 flex items-center justify-center w-full h-full'>
          <EventEffect />
        </div>
      )}

      <section className='absolute z-10 left-4 top-32 drop-shadow-2xl'>
        {/* 미니맵 */}
        {isBoardVisible && <MiniMap />}
      </section>

      {/* 모든 Round 알람 */}
      {isAlertVisible && gameRoundMessage.message && (
        <div className='alert-container'>
          {getAlertComponent(gameRoundMessage.message)}
        </div>
      )}

      {/* 주가 변동 알림 */}
      {isStockChangeAlertVisible && stockChangeAlertMessage && (
        <div className='alert-container'>
          <StockChangeAlert message={stockChangeAlertMessage} />
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
              <ambientLight intensity={2} />
              <directionalLight
                intensity={2.0}
                position={[10, 15, 10]}
                castShadow
              />

              <Map />

              {/* 랜덤 돈 뿌리기 */}
              {moneyPoints
                .filter(point => point.moneyStatus !== 0)
                .map((point, index) => (
                  <MoneyCanvas
                    key={index}
                    position={point.moneyCoordinates}
                    status={point.moneyStatus}
                  />
                ))}

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
                    isTrading={userCharacter.isTrading}
                    isCarrying={userCharacter.isCarrying}
                    animation={userCharacter.animation}
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
