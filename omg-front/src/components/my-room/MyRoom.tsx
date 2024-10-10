import { useContext, useEffect, useState } from 'react';

import { itemNameList } from '@/assets/data/stockMarketData';
import BackButton from '@/components/common/BackButton';
import Button from '@/components/common/Button';
import ChatButton from '@/components/common/ChatButton';
import ExitButton from '@/components/common/ExitButton';
import Round from '@/components/common/Round';
import Snowing from '@/components/common/Snowing';
import SpeechBubble from '@/components/common/SpeechBubble';
import Timer from '@/components/common/Timer';
import Item from '@/components/stock-market/Item';
import { treeItemNameInKorean } from '@/hooks/useStock';
import { useGameStore } from '@/stores/useGameStore';
import { useMainBoardStore } from '@/stores/useMainBoardStore';
import { useModalStore } from '@/stores/useModalStore';
import { useMyRoomStore } from '@/stores/useMyRoomStore';
import { usePersonalBoardStore } from '@/stores/usePersonalBoardStore';
import useUser from '@/stores/useUser';
import { SocketContext } from '@/utils/SocketContext';
import { ToastAlert } from '@/utils/ToastAlert';
import formatNumberWithCommas from '@/utils/formatNumberWithCommas';
import { Html, OrbitControls, RoundedBox } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

import Chatting from '../chat/Chatting';

export default function MyRoom() {
  const { roundTimer, presentRound } = useContext(SocketContext);
  const { nickname } = useUser();

  const { modals, closeModal } = useModalStore();
  const { isExitingRoom, setIsExitingRoom, isFadingOut, setIsFadingOut } =
    useMyRoomStore();

  const {
    setCarryingToMarketCount,
    carryingToHomeCount,
    setCarryingToHomeCount,
  } = useGameStore();
  const { stockPrices, tradableStockCnt } = useMainBoardStore();
  const { stock } = usePersonalBoardStore();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFadingIn, setIsFadingIn] = useState(false);

  const MAX_TRADE_COUNT = tradableStockCnt; // 최대 거래 가능 수량
  const STOCK_MARKET_PRICE = stockPrices; // 현재 주가
  const MY_STOCK = stock; // 보유 주식 개수

  // 선택된 아이템 개수 저장하는 배열 (6 크기, 0번 인덱스는 사용 안 함)
  const [selectedCounts, setSelectedCounts] = useState(Array(6).fill(0));

  const [alertText, setAlertText] =
    useState<string>('판매 할 아이템을 선택해주세요!');

  // 컴포넌트가 마운트될 때 페이드 인 시작
  useEffect(() => {
    setIsFadingIn(true);
    if (carryingToHomeCount.some(count => count > 0)) {
      ToastAlert('매수한 아이템을 안전히 집으로 가져왔습니다.');
      setCarryingToHomeCount([0, 0, 0, 0, 0, 0]);
    }
  }, []);

  // 보유한 아이템들만 필터링
  const ownedStockItems = (MY_STOCK ? MY_STOCK.slice(1) : [])
    .map((count, index) => {
      if (count > 0) {
        return {
          itemName: itemNameList[index],
          count,
        };
      }
      return null;
    })
    .filter(Boolean);

  // 가로로 중앙 정렬을 위한 위치 계산
  const spacing = 1.5; // 아이템 간격
  const startPosition = -(ownedStockItems.length - 1) * (spacing / 2);

  // 예상 판매 수익 계산 함수
  const calculateTotalRevenue = () => {
    return selectedCounts.reduce(
      (total, count, index) => total + count * STOCK_MARKET_PRICE[index],
      0,
    );
  };

  const handleCountChange = (itemIndex: number, value: number) => {
    const newCounts = [...selectedCounts];
    const stockIndex = itemNameList.indexOf(
      ownedStockItems[itemIndex].itemName,
    ); // 필터링된 아이템의 원래 인덱스 찾기

    const newCount = newCounts[stockIndex + 1] + value;

    // 총 선택한 수량 계산
    const totalSelectedCount =
      newCounts.reduce((acc, count) => acc + count, 0) + value;

    if (totalSelectedCount > MAX_TRADE_COUNT) {
      setAlertText(`(현재) 최대 판매 가능 수량은 ${MAX_TRADE_COUNT}개 입니다.`);
      return;
    }

    if (newCount > MY_STOCK[stockIndex + 1]) {
      const itemName = treeItemNameInKorean(itemNameList[stockIndex]); // 해당 아이템 이름 가져오기
      setAlertText(
        `'${itemName}' 보유 수량 ${MY_STOCK[stockIndex + 1]}개를 초과할 수 없습니다.`,
      );
      return;
    }

    newCounts[stockIndex + 1] = Math.max(0, newCount); // 수량이 0보다 작아지지 않도록
    setSelectedCounts(newCounts);

    // 선택한 아이템과 수량 알림 추가
    const selectedItemName = treeItemNameInKorean(itemNameList[stockIndex]);
    setAlertText(
      `${selectedItemName}을(를) ${newCounts[stockIndex + 1]}개 선택했습니다.`,
    );
  };

  const goToSellStockItem = () => {
    // 선택된 아이템 필터링 (1번 인덱스부터 사용)
    const selectedItems = selectedCounts
      .slice(1)
      .map((count, index) => {
        if (count > 0) {
          return `${treeItemNameInKorean(itemNameList[index])} ${count}개`;
        }
        return null;
      })
      .filter(Boolean) // null 값 제거
      .join(', '); // 선택된 아이템을 문자열로 합침

    // 뭐 선택했는 지 alert
    if (selectedItems) {
      ToastAlert(`${selectedItems}를 챙겼습니다.`);
    } else {
      ToastAlert('아이템을 선택하지 않았습니다.');
    }

    setCarryingToMarketCount(selectedCounts);

    setTimeout(() => {
      handleBackButton();
    }, 1000);
  };

  // 뒤로 가기 버튼
  const handleBackButton = () => {
    if (modals[nickname]?.myRoom) {
      // 방 퇴장 메시지 표시
      setIsExitingRoom(nickname, true);
      setIsFadingOut(true);

      setTimeout(() => {
        setIsExitingRoom(nickname, false);
        setIsFadingOut(false);
        closeModal('myRoom', nickname);
      }, 5000);
    }
  };

  const openChattingModal = () => {
    setIsChatOpen(true);
  };

  const closeChattingModal = () => {
    setIsChatOpen(false);
  };

  return (
    <div
      className={`fixed top-0 left-0 z-20 flex items-center justify-center w-full h-full ${
        isFadingIn && !isFadingOut ? 'opacity-100' : 'opacity-0'
      } transition-opacity duration-1000`}
    >
      {/* 내 방 퇴장 알림 메시지 */}
      {isExitingRoom[nickname] && (
        <div className='absolute inset-0 z-40 flex items-center justify-center bg-black bg-opacity-75'>
          <p className='tracking-wider text-white text-omg-50b test_obj'>
            <span>방</span>
            <span>에</span>
            <span>서</span>
            <span> </span>
            <span>니</span>
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

      <main
        className='relative z-20 w-full h-screen bg-center bg-cover'
        style={{ backgroundImage: 'url("/assets/myroom.jpg")' }}
      >
        {/* Header: 뒤로 가기 & Round-Timer 고정 렌더링 */}
        <section className='absolute top-0 left-0 z-20 flex items-start justify-between w-full px-10 py-10 text-black text-omg-40b'>
          <div className='text-white'>
            <BackButton onClick={handleBackButton} />
          </div>
          <div className='flex flex-col items-end gap-4'>
            <Round presentRound={presentRound} />
            <Timer presentRound={presentRound} time={roundTimer} />
          </div>
        </section>

        {/* 말풍선 */}
        <section className='absolute z-20 flex -translate-x-1/2 left-1/2 top-28'>
          <SpeechBubble text={alertText} />
        </section>

        {/* Footer: 채팅 & 종료 버튼 고정 렌더링 */}
        <section className='absolute bottom-0 left-0 z-20 flex items-end justify-between w-full p-6 text-white text-omg-40b'>
          <ChatButton isWhite={true} onClick={openChattingModal} />
          {isChatOpen && <Chatting closeChattingModal={closeChattingModal} />}

          <ExitButton />
        </section>

        <Canvas
          style={{ height: '100vh', width: '100vw' }}
          camera={{ position: [0, 5, 20], fov: 20 }} // 카메라 위치와 fov 설정
        >
          {/* 카메라 컨트롤 */}
          <OrbitControls
            enablePan={false} // 팬(이동) 금지
            enableZoom={false} // 줌 금지
            enableRotate={false} // 회전 금지
          />
          {/* 조명 설정 */}
          <ambientLight intensity={5} />
          <directionalLight position={[5, 5, 5]} intensity={7} />
          <pointLight position={[0, 10, 0]} intensity={3} />
          <Snowing />

          {ownedStockItems.map((item, itemIndex) => {
            const positionX = startPosition + itemIndex * spacing;
            const stockIndex = itemNameList.indexOf(item.itemName); // 필터링된 아이템의 원래 인덱스 찾기

            return (
              <group key={item.itemName}>
                <mesh rotation={[2.95, 0, 0]} position={[0, -0.5, 0]}>
                  <RoundedBox
                    args={[8.5, 4.5, 0.5]}
                    radius={0.3}
                    smoothness={4}
                  >
                    <meshStandardMaterial
                      color='gray'
                      transparent
                      opacity={0.6}
                    />
                  </RoundedBox>
                </mesh>

                <Item
                  itemName={item.itemName}
                  position={{ x: positionX, y: 0.6, z: 1 }}
                  onClick={() => console.log(`${item.itemName} 클릭됨`)}
                  disabled={false}
                />

                <Html position={[positionX, -0.6, 0]} center>
                  <div className='flex flex-col items-center w-40 gap-12 text-omg-14'>
                    {/* 보유 수량 */}
                    <div>{item.count}개 보유</div>

                    {/* 수량 선택 & 현재 주가 */}
                    <div className='flex flex-col items-center gap-3 text-omg-18'>
                      {/* 수량 선택 */}
                      <div className='flex items-center'>
                        <Button
                          text='-'
                          type='count'
                          onClick={() => handleCountChange(itemIndex, -1)}
                          disabled={selectedCounts[stockIndex + 1] === 0}
                        />
                        <p className='mx-4'>
                          {selectedCounts[stockIndex + 1]}개
                        </p>
                        <Button
                          text='+'
                          type='count'
                          onClick={() => handleCountChange(itemIndex, 1)}
                        />
                      </div>
                      {/* 현재 주가 */}
                      현재 가격 $
                      {formatNumberWithCommas(
                        STOCK_MARKET_PRICE[stockIndex + 1],
                      )}
                    </div>
                  </div>
                </Html>
              </group>
            );
          })}
        </Canvas>

        <div className='absolute flex items-center justify-center gap-10 -translate-x-1/2 text-omg-18 bottom-44 left-1/2'>
          <p className='text-omg-24'>
            (예상) 판매 수익 ${formatNumberWithCommas(calculateTotalRevenue())}
          </p>
          <Button text='챙겨가기' type='trade' onClick={goToSellStockItem} />
        </div>
      </main>
    </div>
  );
}
