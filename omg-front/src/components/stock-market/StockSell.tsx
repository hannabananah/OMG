import { useContext, useEffect } from 'react';

import { itemNameList } from '@/assets/data/stockMarketData';
import { Button } from '@/components/common';
import { useSocketMessage, useSoundStore, useUser } from '@/stores';
import { useGameStore } from '@/stores';
import { SocketContext } from '@/utils/SocketContext';
import { ToastAlert } from '@/utils/ToastAlert';
import { Html, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

import Item from './Item';
import PossessionChart from './PossessionChart';

export default function StockSell() {
  const { sellStock } = useContext(SocketContext);
  const { sellStockMessage, setSellMessage } = useSocketMessage();

  const { carryingToMarketCount, setCarryingToMarketCount } = useGameStore();
  const { playSuccessStockSound } = useSoundStore();

  const { nickname } = useUser();

  useEffect(() => {
    if (sellStockMessage.message) {
      ToastAlert(sellStockMessage.message);
      setSellMessage({ message: '', isCompleted: false });
    }
  }, [sellStockMessage]);

  const noSellingItem = carryingToMarketCount.every(count => count === 0);

  const handleSelling = () => {
    if (noSellingItem) {
      ToastAlert('매도할 주식이 없습니다.');
      return;
    }
    sellStock(carryingToMarketCount);
    setCarryingToMarketCount([0, 0, 0, 0, 0, 0]);

    if (nickname) {
      playSuccessStockSound();
    }
  };

  // 판매할 주식들 필터링 (0이 아닌 주식만 가져오기)
  const stockItemsForSelling = (
    carryingToMarketCount ? carryingToMarketCount.slice(1) : []
  )
    .map((count, index) => {
      if (count > 0) {
        return {
          itemName: itemNameList[index], // 해당 인덱스에 해당하는 주식 이름
          count, // 주식 개수
        };
      }
      return null;
    })
    .filter(Boolean); // null 값을 제거

  // 가로로 중앙 정렬을 위한 위치 계산
  const spacing = 1.5; // 아이템 간격
  const startPosition = -(stockItemsForSelling.length - 1) * (spacing / 2);

  return (
    <div className='flex justify-between w-full h-full'>
      {/* 주식 별 지분 */}
      <section className='flex justify-between w-[50%]'>
        <PossessionChart />
      </section>

      <section className='w-[50%] flex justify-center items-center'>
        <div className='flex flex-col items-center w-full h-full gap-10 px-20 py-10'>
          <h2 className='text-omg-30'>집에서 가져온 주식들</h2>
          {/* 판매할 주식들 Canvas로 렌더링 */}
          {noSellingItem ? (
            <p className='py-32 text-omg-20'>매도 할 주식이 없습니다.</p>
          ) : (
            <Canvas
              style={{
                height: '50%',
                width: '100%',
                // backgroundColor: 'yellow',
              }}
              camera={{ position: [0, 5, 20], fov: 10 }}
            >
              <OrbitControls
                enablePan={false}
                enableZoom={false}
                enableRotate={false}
              />
              <ambientLight intensity={5} />
              <directionalLight position={[5, 5, 5]} intensity={7} />
              <pointLight position={[0, 10, 0]} intensity={3} />

              {stockItemsForSelling.map((item, itemIndex) => {
                const positionX = startPosition + itemIndex * spacing;

                return (
                  <group key={item.itemName}>
                    <Item
                      itemName={item.itemName}
                      position={{ x: positionX, y: 0.3, z: 0 }}
                      disabled={false}
                    />

                    <Html position={[positionX, 0, 0]} center>
                      <div className='flex flex-col items-center w-40 gap-2 text-omg-18'>
                        <div>{item.count}개</div>
                      </div>
                    </Html>
                  </group>
                );
              })}
            </Canvas>
          )}
          {!noSellingItem && (
            <Button text='매도하기' type='trade' onClick={handleSelling} />
          )}
        </div>
      </section>
    </div>
  );
}
