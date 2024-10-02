import { Suspense, useContext, useEffect, useMemo, useState } from 'react';

import Character from '@/components/character/Character';
import Button from '@/components/common/Button';
import ExitButton from '@/components/common/ExitButton';
import Round from '@/components/common/Round';
import Timer from '@/components/common/Timer';
import EventCard from '@/components/game/EventCard';
import Map from '@/components/main-map/Map';
import StockMarket from '@/components/stock-market/StockMarket';
import { useGameStore } from '@/stores/useGameStore';
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

export const Controls = {
  forward: 'forward',
  back: 'back',
  left: 'left',
  right: 'right',
  pickup: 'pickup',
};

const stockTypes = [
  { name: '주식 종류1', id: 1 },
  { name: '주식 종류2', id: 2 },
  { name: '주식 종류3', id: 3 },
  { name: '주식 종류4', id: 4 },
  { name: '주식 종류5', id: 5 },
];

const CharacterInfo = {
  santa: {
    url: '/models/santa/santa.gltf',
    scale: [2.5, 2.5, 2.5],
  },
  elf: {
    url: '/models/elf/elf.gltf',
    scale: [1, 1, 1],
  },
  snowman: {
    url: '/models/snowman/snowman.gltf',
    scale: [1, 1, 1],
  },
  gingerbread: {
    url: '/models/gingerbread/gingerbread.gltf',
    scale: [1, 1, 1],
  },
};

export default function MainMap() {
  const { characterType } = useUser();
  const {
    socket,
    online,
    initGameSetting,
    allRendered,
    purchaseGold,
    takeLoan,
    repayLoan,
    buyStock,
    sellStock,
  } = useContext(SocketContext);
  const { carryingData, setCarryingData } = useGameStore();
  const { otherUsers } = useOtherUserStore();

  const { modals, openModal } = useModalStore(); // 모달 상태 및 함수 불러오기

  const {
    goldPurchaseMessage,
    loanMessage,
    repayLoanMessage,
    eventCardMessage,
    buyStockMessage,
    sellStockMessage,
    gameRoundMessage,
  } = useSocketMessage();

  const [isVisible, setIsVisible] = useState(false);
  const [isAlertVisible, setIsAlertVisible] = useState(false);

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
  }, [initGameSetting, allRendered, socket, online]);

  useEffect(() => {
    if (!eventCardMessage.title && !eventCardMessage.content) return;
    setIsVisible(true);

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [eventCardMessage]);

  useEffect(() => {
    if (!goldPurchaseMessage.message) return;

    if (goldPurchaseMessage.isCompleted) {
      alert(
        `금괴를 성공적으로 구매했습니다! 현재 소유 금괴 수량: ${goldPurchaseMessage.message}`,
      );
    } else if (!goldPurchaseMessage.isCompleted) {
      alert(goldPurchaseMessage.message);
    }
  }, [goldPurchaseMessage]);

  // 매수
  useEffect(() => {
    if (!buyStockMessage.message) return;

    if (buyStockMessage.isCompleted) {
      alert(buyStockMessage.message);
    } else if (!buyStockMessage.isCompleted) {
      alert(buyStockMessage.message);
    }
  }, [buyStockMessage]);

  // 매도
  useEffect(() => {
    if (!sellStockMessage.message) return;

    if (sellStockMessage.isCompleted) {
      alert(sellStockMessage.message);
    } else if (!sellStockMessage.isCompleted) {
      alert(sellStockMessage.message);
    }
  }, [sellStockMessage]);

  useEffect(() => {
    if (!loanMessage.message) return;

    if (loanMessage.isCompleted) {
      alert(`대출 신청이 완료되었습니다! 대출액: ${loanMessage.message}`);
    } else if (!loanMessage.isCompleted) {
      alert(loanMessage.message);
    }
  }, [loanMessage]);

  useEffect(() => {
    if (repayLoanMessage.message === null) return;

    if (repayLoanMessage.isCompleted) {
      if (repayLoanMessage.message == '0') {
        alert('대출금을 모두 상환했습니다!');
      } else {
        alert(
          `대출 상환이 완료되었습니다! 남은 대출액: ${repayLoanMessage.message}`,
        );
      }
    } else if (!repayLoanMessage.isCompleted) {
      alert(repayLoanMessage.message);
    }
  }, [repayLoanMessage]);

  // TODO: 삭제해야됨, 주식 매도 집에서 들고갈때
  useEffect(() => {
    console.log('carryingData has changed:', carryingData);
  }, [carryingData]);

  // TODO: 삭제해야됨, 라운드 알림 모달
  useEffect(() => {
    if (!gameRoundMessage.message) return;

    console.log('gameRoundMessage-------->', gameRoundMessage);

    let displayDuration = 2000;

    switch (gameRoundMessage.type) {
      case 'ROUND_START':
      case 'ROUND_END':
      case 'GAME_FINISHED':
        displayDuration = 4000;
        break;
      case 'ROUND_IN_PROGRESS':
      case 'PREPARING_NEXT_ROUND':
        displayDuration = 1000;
        break;
      default:
        break;
    }

    setIsAlertVisible(true);

    const timer = setTimeout(() => {
      setIsAlertVisible(false);
    }, displayDuration);

    return () => clearTimeout(timer);
  }, [gameRoundMessage]);

  // TODO: 삭제해야됨, 주식 매도 집에서 들고갈때
  const handleClickStock = (stockId: number) => {
    setCarryingData((prevData: number[]) => {
      const newCarryingData = [...prevData];
      if (stockId >= 0 && stockId < newCarryingData.length) {
        newCarryingData[stockId] += 1;
      }
      return newCarryingData;
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
    alert('메인 판 모달 띄워주기');
  };

  const openPersonalSettingsModal = () => {
    alert('개인 판 모달 띄워주기');
  };

  const openPersonalMissionModal = () => {
    alert('게임 미션 모달 띄워주기');
  };

  // TODO: 삭제해야됨
  const handleClickPurchaseGold = () => {
    const goldPurchaseCount = Number(
      prompt('금괴 매입 수량을 입력하세요.').trim(),
    );
    if (goldPurchaseCount == 0) {
      alert('매입 수량을 다시 입력해주세요.');
      return;
    }

    purchaseGold(goldPurchaseCount);
  };

  const handleClickTakeLoan = () => {
    const loanAmount = Number(prompt('대출할 액수를 입력하세요.').trim());
    if (loanAmount == 0) {
      alert('대출할 액수를 다시 입력해주세요.');
      return;
    }

    takeLoan(loanAmount);
  };

  const handleClickRepayLoan = () => {
    const repayLoanAmount = Number(
      prompt('상환할 대출 액수를 입력하세요.').trim(),
    );
    if (repayLoanAmount == 0) {
      alert('상환액을 다시 입력해주세요.');
      return;
    }
    repayLoan(repayLoanAmount);
  };

  const openStockMarketModal = () => {
    if (!modals.stockMarket) {
      openModal('stockMarket');
    }
  };

  const handleClickBuyStock = () => {
    buyStock(carryingData);
    setCarryingData([0, 0, 0, 0, 0, 0]);
  };

  const handleClickSellStock = () => {
    sellStock(carryingData);
    setCarryingData([0, 0, 0, 0, 0, 0]);
  };

  return (
    <main className='relative w-full h-screen overflow-hidden'>
      {/* 주식 시장 Modal */}
      {modals.stockMarket && <StockMarket />}

      {/* 주식 매도/매수 수량 선택(집에서/거래소에서) */}
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

      {/* TODO: 삭제해야됨, 주식 매수 매도 버튼 */}
      {/* <div className='absolute z-30 flex items-center justify-center w-full h-full gap-56'>
        <ChoiceTransaction type='buy-stock' onClick={handleClickBuyStock} />
        <ChoiceTransaction type='sell-stock' onClick={handleClickSellStock} />
      </div> */}

      {/* Round & Timer & Chat 고정 위치 렌더링 */}
      <section className='absolute z-10 flex flex-col items-end gap-4 top-10 right-10'>
        <Round presentRound={1} />
        <Timer />
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
        {/* TODO: 삭제해야됨, 임시 금괴매입 버튼 */}
        <Button
          text='임시 금괴매입 버튼'
          type='mainmap'
          onClick={handleClickPurchaseGold}
        />
        {/* TODO: 삭제해야됨, 임시 대출신청 버튼 */}
        <Button
          text='임시 대출신청 버튼'
          type='mainmap'
          onClick={handleClickTakeLoan}
        />
        {/* TODO: 삭제해야됨, 임시 대출상환 버튼 */}
        <Button
          text='임시 대출상환 버튼'
          type='mainmap'
          onClick={handleClickRepayLoan}
        />
        {/* TODO: 삭제해야됨, 임시 주식 시장 버튼 */}
        <Button
          text='임시 주식 시장 버튼'
          type='mainmap'
          onClick={openStockMarketModal}
        />
      </section>

      {/* 채팅 및 종료 버튼 고정 렌더링 */}
      <section className='absolute bottom-0 left-0 z-10 flex items-center justify-between w-full text-white py-14 px-14 text-omg-40b'>
        <ChatButton isWhite={true} />
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
