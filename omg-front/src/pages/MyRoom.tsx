import { useContext, useState } from 'react';

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
import { SocketContext } from '@/utils/SocketContext';
import { Html, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

export default function MyRoom() {
  const { roundTimer, presentRound } = useContext(SocketContext);

  // const MAX_TRADE_COUNT = 5; // 최대 거래 가능 횟수
  // const STOCK_MARKET_PRICE = [0, 8, 8, 8, 8, 8]; // 현재 주가
  const MY_STOCK = [0, 1, 0, 1, 2, 3]; // 보유 주식 개수

  // 선택된 아이템 개수 저장하는 배열: 6짜리 count 배열 (1 ~ 5번 인덱스 활용)
  const [selectedCounts, setSelectedCounts] = useState(Array(6).fill(0));

  const [alertText, setAlertText] =
    useState<string>('판매 할 아이템을 선택해주세요!');

  const goToSellStockItem = () => {};
  const handleClickItem = () => {};

  // 보유한 아이템들만 필터링
  const ownedStockItems = MY_STOCK.slice(1)
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

  console.log(ownedStockItems);

  // 가로로 중앙 정렬을 위한 위치 계산
  const spacing = 1.5; // 아이템 간격
  const startPosition = -(ownedStockItems.length - 1) * (spacing / 2);

  return (
    <main className='relative w-full h-screen bg-center bg-cover bg-skyblue'>
      {/* Header: 뒤로 가기 & Round-Timer 고정 렌더링 */}
      <section className='absolute top-0 left-0 z-10 flex items-start justify-between w-full px-10 py-10 text-black text-omg-40b'>
        <BackButton />
        <div className='flex flex-col items-end gap-4'>
          <Round presentRound={presentRound} />
          <Timer time={roundTimer} />
        </div>
      </section>

      {/* 말풍선 */}
      <section className='absolute z-10 flex -translate-x-1/2 left-1/2 top-32'>
        <SpeechBubble text={alertText} />
      </section>

      {/* Footer: 채팅 & 종료 버튼 고정 렌더링 */}
      <section className='absolute bottom-0 left-0 z-10 flex items-center justify-between w-full text-black py-14 px-14 text-omg-40b'>
        <ChatButton />
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

        {ownedStockItems.map((item, index) => {
          const positionX = startPosition + index * spacing;
          return (
            <group key={item.itemName}>
              <Item
                itemName={item.itemName}
                position={{ x: positionX, y: 0, z: 0 }} // X축으로 위치 조정
                onClick={() => console.log(`${item.itemName} 클릭됨`)}
                disabled={false}
              />
              {/* 보유 개수 표시 */}
              <Html position={[positionX, -0.5, 0]}>
                <div className='text-white'>{item.count}개</div>
              </Html>
            </group>
          );
        })}
      </Canvas>

      <div className='absolute -translate-x-1/2 bottom-44 left-1/2'>
        <Button
          text='주식 시장에 팔러 가기'
          type='trade'
          onClick={goToSellStockItem}
        />
      </div>
    </main>
  );
}
