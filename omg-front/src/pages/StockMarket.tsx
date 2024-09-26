import { useState } from 'react';

import Socks from '@/components/stock-market/Socks';
import Tree from '@/components/stock-market/Tree';
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

type ItemName = 'socks' | 'cane' | 'socksWithCane' | 'reels' | 'candy';

export default function StockMarket() {
  const maxTradeCount = 5; // 최대 거래 가능 횟수
  const myMoney = 30; // 총 현금

  const treeItems = [
    { name: 'socks', price: 10 },
    { name: 'cane', price: 10 },
    { name: 'socksWithCane', price: 10 },
    { name: 'reels', price: 10 },
    { name: 'candy', price: 10 },
  ];

  const [selectedItems, setSelectedItems] = useState({
    socks: 0,
    cane: 0,
    socksWithCane: 0,
    reels: 0,
    candy: 0,
  });

  // 아이템의 총 가격 계산
  const totalPrice = Object.entries(selectedItems).reduce(
    (sum, [key, count]) =>
      sum + treeItems.find(item => item.name === key)!.price * count,
    0,
  );

  const [showSocks, setShowSocks] = useState(false); // 양말 보이게 할 지

  // 양말 선택
  const handleSelectSocks = (itemName: ItemName) => {
    console.log('클릭');
    const item = treeItems.find(item => item.name === itemName)!;
    const newTotalPrice = totalPrice + item.price;

    if (newTotalPrice > myMoney) {
      alert('가지고 있는 현금을 초과했습니다.');
      return;
    }

    if (
      Object.values(selectedItems).reduce((item1, item2) => item1 + item2, 0) >=
      maxTradeCount
    ) {
      alert(`최대 ${maxTradeCount}개 까지 거래 가능합니다.`);
      return;
    }

    // 조건 통과한 경우에만 상태 업데이트
    setSelectedItems(prev => ({
      ...prev,
      [itemName]: Number(prev[itemName]) + 1,
    }));
  };

  const handleDropSocks = (itemName: ItemName) => {
    if (selectedItems[itemName] > 0) {
      setSelectedItems(prev => ({
        ...prev,
        [itemName]: Number(prev[itemName]) - 1,
      }));
    }
  };

  // 거래 불가능한 조건 (현금 부족 또는 거래 수량 초과)
  const isDisabled =
    totalPrice >= myMoney ||
    Object.values(selectedItems).reduce((a, b) => a + b, 0) >= maxTradeCount;

  return (
    <main
      className='relative w-full h-screen bg-center bg-cover'
      style={{ backgroundImage: 'url("/assets/stock-market.png")' }}
    >
      <Canvas
        style={{ height: '100vh', width: '100vw' }}
        camera={{ position: [20, 5, 0], fov: 20 }} // 카메라 위치와 fov 설정
      >
        {/* 카메라 컨트롤 */}
        <OrbitControls
          enablePan={false} // 팬(이동) 금지
          enableZoom={false} // 줌 금지
          enableRotate={false} // 회전 금지
        />
        {/* 조명 설정 */}
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 5, 5]} intensity={5} />
        {/* 추가 조명 (포인트 라이트) */}
        <pointLight position={[0, 10, 0]} intensity={3} />
        <Tree />

        <Socks
          onClick={() => handleSelectSocks('socks')}
          disabled={isDisabled}
        />
      </Canvas>

      {/* 양말 위치 고정 */}
      {selectedItems.socks > 0 && (
        <div
          className='absolute left-[200px] bottom-[200px] flex flex-col gap-2'
          onClick={() => handleDropSocks('socks')}
        >
          <img src='/assets/socks.png' alt='socks' className='w-14' />
          <p className='text-center text-omg-28'>{`${selectedItems.socks}개`}</p>
        </div>
      )}
    </main>
  );
}
