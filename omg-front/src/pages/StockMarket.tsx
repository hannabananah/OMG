import { useState } from 'react';

import BackButton from '@/components/common/BackButton';
import Button from '@/components/common/Button';
import ChatButton from '@/components/common/ChatButton';
import ExitButton from '@/components/common/ExitButton';
import Round from '@/components/common/Round';
import Snowing from '@/components/common/Snowing';
import SpeechBubble from '@/components/common/SpeechBubble';
import Timer from '@/components/common/Timer';
import Item from '@/components/stock-market/Item';
import MarketState from '@/components/stock-market/MarketState';
import MyAssets from '@/components/stock-market/MyAssets';
import StockInfoButton from '@/components/stock-market/StockInfoButton';
import { StockItem } from '@/types';
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

// 트리 장식
interface TreeItem {
  name: StockItem;
  price: number;
  img: string;
  width: number;
  height: number;
}

// 바구니 크기
interface Basket {
  width: number;
  height: number;
}

// TODO: 빌드 에러 해결을 위한 임시 주석 처리, 필요한 경우 주석 해제
/* 
// 바구니 범위
interface BasketRange extends Basket {
  itemWidth: number;
  itemHeight: number;
}
 */

export default function StockMarket() {
  const maxTradeCount = 5; // 최대 거래 가능 횟수
  const myMoney = 60; // 총 현금

  // 바구니 크기
  // const basketSize: Basket = {
  //   width: 400,
  //   height: 420,
  // };

  const treeItems: TreeItem[] = [
    {
      name: 'candy',
      price: 10,
      img: '/assets/candy.png',
      width: 50,
      height: 150,
    },
    {
      name: 'cupcake',
      price: 10,
      img: '/assets/cupcake.png',
      width: 40,
      height: 90,
    },
    {
      name: 'gift',
      price: 10,
      img: '/assets/gift.png',
      width: 50,
      height: 90,
    },
    {
      name: 'hat',
      price: 10,
      img: '/assets/hat.png',
      width: 80,
      height: 80,
    },
    {
      name: 'socks',
      price: 10,
      img: '/assets/socks.png',
      width: 60,
      height: 110,
    },
  ];

  // 선택된 아이템 저장하는 배열
  const [selectedItems, setSelectedItems] = useState<TreeItem[]>([]);

  const [alertText, setAlertText] =
    useState<string>('구매할 트리 장식을 선택해주세요!');

  // 아이템의 총 가격 계산
  const totalPrice = selectedItems.reduce(
    (sum, selected) =>
      sum + treeItems.find(item => item.name === selected.name)!.price,
    0,
  );

  // 트리 장식 선택
  const handleSelect = (itemName: StockItem) => {
    const item = treeItems.find(item => item.name === itemName)!;
    const newTotalPrice = totalPrice + item.price;

    if (newTotalPrice > myMoney) {
      setAlertText('가지고 있는 현금을 초과했습니다.');
      return;
    }

    if (selectedItems.length >= maxTradeCount) {
      setAlertText(`최대 ${maxTradeCount}개 까지 거래 가능합니다.`);
      return;
    }

    // 선택된 아이템 추가 (처음 추가될 때만 랜덤 위치 생성)
    const newItem: TreeItem = {
      ...item,
    };

    // 선택된 아이템 배열에 추가
    setSelectedItems(prev => [...prev, newItem]);
  };

  // 트리 장식 선택 취소
  // const handleDrop = (index: number) => {
  //   setSelectedItems(prev => {
  //     const newItems = [...prev];
  //     newItems.splice(index, 1);
  //     return newItems;
  //   });
  // };

  // 거래 불가능한 조건 (현금 부족 또는 거래 수량 초과)
  const isDisabled =
    totalPrice >= myMoney || selectedItems.length >= maxTradeCount;

  const purchaseStock = () => {
    if (selectedItems.length === 0) {
      setAlertText('트리 장식을 1개 이상 선택해주세요.');
    } else {
      setAlertText(`${selectedItems.map(item => item.name).join(', ')} 구입`);
    }
  };

  // 트리 장식 배열
  const items: {
    itemName: StockItem;
    position: { x: number; y: number; z: number };
  }[] = [
    { itemName: 'candy', position: { x: 2, y: 0, z: 1.4 } },
    { itemName: 'cupcake', position: { x: 2, y: 0, z: 0.7 } },
    { itemName: 'gift', position: { x: 2, y: 0, z: 0 } },
    { itemName: 'hat', position: { x: 2, y: 0, z: -0.7 } },
    { itemName: 'socks', position: { x: 2, y: 0, z: -1.4 } },
  ];

  return (
    <main
      className='relative w-full h-screen bg-center bg-cover'
      style={{
        backgroundImage: 'url("/assets/stock-market.jpg")',
      }}
    >
      {/* Header: 뒤로 가기 & 시장 수준 & Round-Timer-Chat 고정 렌더링 */}
      <section className='absolute top-0 left-0 z-10 flex items-start justify-between w-full px-10 py-10 text-black text-omg-40b'>
        <BackButton />
        <MarketState />
        <div className='flex flex-col items-end gap-4'>
          <Round presentRound={1} />
          <Timer />
          <div className='text-white text-omg-40b'>
            <StockInfoButton />
          </div>
        </div>
      </section>

      {/* 말풍선 */}
      <section className='absolute z-10 flex -translate-x-1/2 left-1/2 top-60 text-omg-40b'>
        <SpeechBubble text={alertText} />
      </section>

      {/* Footer: 채팅 & 보유 자산 &  종료 버튼 고정 렌더링 */}
      <section className='absolute bottom-0 left-0 z-10 flex items-center justify-between w-full text-black py-14 px-14 text-omg-40b'>
        <ChatButton />
        <MyAssets />
        <ExitButton />
      </section>

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
        <Snowing />
        {items.map(({ itemName, position }) => (
          <Item
            key={itemName}
            itemName={itemName}
            position={position}
            onClick={() => handleSelect(itemName)}
            disabled={isDisabled}
          />
        ))}
      </Canvas>

      {/* 바구니에 랜덤하게 배치된 아이템들 */}
      {/* <div
        className='absolute bg-center bg-cover bg-[url("/assets/shopping-basket.png")] bottom-36 left-[3%] z-20'
        style={{
          width: `${basketSize.width}px`,
          height: `${basketSize.height}px`,
        }}
      >
        <div className='absolute top-52 rounded-100 left-1/2 -translate-x-1/2 flex flex-wrap items-center justify-center w-[100%] h-[100px] items-ceter overflow-hidden z-10'>
          {selectedItems.map((item, index) => {
            return (
              <img
                key={index}
                src={item.img}
                alt={item.name}
                // className='absolute'
                style={{
                  width: `${item.width}px`,
                  height: `${item.height}px`,
                  // left: `${item.position.left}px`,
                  // top: `${item.position.top}px`,
                  transform: 'rotate(30deg)', // 이미지 회전 적용
                }}
                onClick={() => handleDrop(index)}
              />
            );
          })}
        </div>
      </div> */}

      <div className='absolute -translate-x-1/2 bottom-56 left-1/2'>
        <Button
          text='구매하기'
          type='stock-trade'
          disabled={
            selectedItems.length === 0 || selectedItems.length > maxTradeCount
          }
          onClick={purchaseStock}
        />
      </div>
    </main>
  );
}
