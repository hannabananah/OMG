import { useState } from 'react';

import Snowing from '@/components/common/Snowing';
import Candy from '@/components/stock-market/Candy';
import Cane from '@/components/stock-market/Cane';
import Reels from '@/components/stock-market/Reels';
import Socks from '@/components/stock-market/Socks';
import SocksWithCane from '@/components/stock-market/SocksWithCane';
import Tree from '@/components/stock-market/Tree';
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

type ItemName = 'socksWithCane' | 'cane' | 'socks' | 'reels' | 'candy';

// 트리 장식
interface TreeItem {
  name: ItemName;
  price: number;
  img: string;
  width: number;
  height: number;
}

// 선택된 트리 장식의 타입 정의 (위치 정보 추가)
interface SelectedItem extends TreeItem {
  position: {
    left: number;
    top: number;
  };
}

// 바구니 크기
interface Basket {
  width: number;
  height: number;
}

// 바구니 범위
interface BasketRange extends Basket {
  itemWidth: number;
  itemHeight: number;
}

export default function StockMarket() {
  const maxTradeCount = 6; // 최대 거래 가능 횟수
  const myMoney = 100; // 총 현금

  // 바구니 크기
  const basketSize: Basket = {
    width: 400,
    height: 200,
  };

  const treeItems: TreeItem[] = [
    {
      name: 'socksWithCane',
      price: 10,
      img: '/assets/socks-with-cane.png',
      width: 50,
      height: 150,
    },
    {
      name: 'cane',
      price: 10,
      img: '/assets/cane.png',
      width: 40,
      height: 90,
    },
    {
      name: 'socks',
      price: 10,
      img: '/assets/socks.png',
      width: 50,
      height: 90,
    },
    {
      name: 'reels',
      price: 10,
      img: '/assets/reels.png',
      width: 80,
      height: 80,
    },
    {
      name: 'candy',
      price: 10,
      img: '/assets/candy.png',
      width: 60,
      height: 110,
    },
  ];

  // 선택된 아이템 저장하는 배열
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  // 아이템의 총 가격 계산
  const totalPrice = selectedItems.reduce(
    (sum, selected) =>
      sum + treeItems.find(item => item.name === selected.name)!.price,
    0,
  );

  // (선택한 트리 장식 담을 공간 내에서) 랜덤 위치 생성
  const getRandomPosition = (basket: BasketRange) => {
    const left = Math.random() * (basket.width - basket.itemWidth);
    const top = Math.random() * (basket.height - basket.itemHeight);
    return { left, top };
  };

  // 트리 장식 선택
  const handleSelect = (itemName: ItemName) => {
    const item = treeItems.find(item => item.name === itemName)!;
    const newTotalPrice = totalPrice + item.price;

    if (newTotalPrice > myMoney) {
      alert('가지고 있는 현금을 초과했습니다.');
      return;
    }

    if (selectedItems.length >= maxTradeCount) {
      alert(`최대 ${maxTradeCount}개 까지 거래 가능합니다.`);
      return;
    }

    // 선택된 아이템 추가 (처음 추가될 때만 랜덤 위치 생성)
    const newItem: SelectedItem = {
      ...item,
      position: getRandomPosition({
        width: basketSize.width,
        height: basketSize.height,
        itemWidth: item.width,
        itemHeight: item.height,
      }),
    };

    // 선택된 아이템 배열에 추가
    setSelectedItems(prev => [...prev, newItem]);
  };

  // 트리 장식 선택 취소
  const handleDrop = (index: number) => {
    setSelectedItems(prev => {
      const newItems = [...prev];
      newItems.splice(index, 1);
      return newItems;
    });
  };

  // 거래 불가능한 조건 (현금 부족 또는 거래 수량 초과)
  const isDisabled =
    totalPrice >= myMoney || selectedItems.length >= maxTradeCount;

  return (
    <main className='relative w-full h-screen bg-center bg-cover '>
      <div
        className='absolute inset-0 bg-center bg-cover opacity-50'
        style={{
          backgroundImage: 'url("/assets/stock-market.jpg")',
        }}
      ></div>
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
        <ambientLight intensity={5} />
        <directionalLight position={[5, 5, 5]} intensity={7} />
        {/* 추가 조명 (포인트 라이트) */}
        <pointLight position={[0, 10, 0]} intensity={3} />
        <Tree />
        <Snowing />
        <SocksWithCane
          onClick={() => handleSelect('socksWithCane')}
          disabled={isDisabled}
        />
        <Cane onClick={() => handleSelect('cane')} disabled={isDisabled} />
        <Socks onClick={() => handleSelect('socks')} disabled={isDisabled} />
        <Reels onClick={() => handleSelect('reels')} disabled={isDisabled} />
        <Candy onClick={() => handleSelect('candy')} disabled={isDisabled} />
      </Canvas>

      {/* 바구니에 랜덤하게 배치된 아이템들 */}
      <div
        className='absolute bottom-[150px] left-[200px] bg-white border-4 border-black'
        style={{
          width: `${basketSize.width}px`,
          height: `${basketSize.height}px`,
        }}
      >
        {selectedItems.map((item, index) => {
          return (
            <img
              key={index}
              src={item.img}
              alt={item.name}
              className='absolute'
              style={{
                width: `${item.width}px`,
                height: `${item.height}px`,
                left: `${item.position.left}px`,
                top: `${item.position.top}px`,
              }}
              onClick={() => handleDrop(index)}
            />
          );
        })}
      </div>
    </main>
  );
}
