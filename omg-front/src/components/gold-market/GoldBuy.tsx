import { useContext, useEffect, useState } from 'react';

import { useGoldStore } from '@/stores/useGoldStore';
import { useMainBoardStore } from '@/stores/useMainBoardStore';
import { usePersonalBoardStore } from '@/stores/usePersonalBoardStore';
import { useSocketMessage } from '@/stores/useSocketMessage';
import { SocketContext } from '@/utils/SocketContext';
import { ToastAlert } from '@/utils/ToastAlert';
import formatNumberWithCommas from '@/utils/formatNumberWithCommas';
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

import Button from '../common/Button';
import GoldModel from './GoldModel';
import LineChart from './LineChart';
import PossessionChart from './PossessionChart';

export default function GoldBuy() {
  const { purchaseGold } = useContext(SocketContext);
  const { goldPurchaseMessage, setGoldPurchaseMessage } = useSocketMessage();

  const { tradableStockCnt } = useMainBoardStore();
  const { cash } = usePersonalBoardStore();

  const { goldPrice, goldPriceChart } = useGoldStore();
  const GOLD_PRICE = goldPrice;

  const MAX_TRADE_COUNT = tradableStockCnt; // 최대 거래 가능 수량
  const MY_MONEY = cash;

  // 선택한 금 개수
  const [goldCount, setGoldCount] = useState(0);

  useEffect(() => {
    if (goldPurchaseMessage.message) {
      ToastAlert(goldPurchaseMessage.message);
      setGoldPurchaseMessage({ message: '', isCompleted: false });
    }
  }, [goldPurchaseMessage]);

  // back에 보낼 금 매입 개수 세팅
  const handleGoldCount = (value: number) => {
    const newGoldCount = goldCount + value;

    // 최대 거래 가능 수량 넘으면 alert
    if (newGoldCount > MAX_TRADE_COUNT) {
      ToastAlert(`최대 거래 가능 수량은 ${MAX_TRADE_COUNT}개 입니다.`);
      return;
    }

    // 보유 현금 초과하면 alert
    if (GOLD_PRICE * newGoldCount > MY_MONEY) {
      ToastAlert(
        `보유한 현금 $${formatNumberWithCommas(MY_MONEY)}을 초과할 수 없습니다.`,
      );
      return;
    }

    setGoldCount(Math.max(0, newGoldCount)); // 수량이 0보다 작아지지 않도록
  };

  // 매입 버튼: 서버로 goldCount 전송 !
  const handleBuying = () => {
    if (goldCount <= 0) {
      ToastAlert('금은 0개 이상 매입해야 합니다.');
      return;
    }

    purchaseGold(goldCount);
  };

  return (
    <div className='flex w-full h-full'>
      {/* 금 시세 차트 등 & 플레이어 별 지분 */}
      <section className='w-[50%] flex flex-col justify-center items-center'>
        {/* 금 시세 차트 & 현재 금 가격 & 등락 */}
        <div className='flex justify-center items-center w-full h-[65%] '>
          <LineChart goldData={goldPriceChart} />
        </div>

        {/* 플레이어 별 지분 차트 */}
        <div className='flex justify-center items-center w-full h-[35%]'>
          <PossessionChart />
        </div>
      </section>

      {/* 구매 영역 */}
      <section className='w-[50%] flex justify-center items-center p-10'>
        <div className='flex flex-col items-center justify-center w-full h-full gap-10'>
          {/* 금 3D 에셋  */}
          <Canvas style={{ width: '300px', height: '250px' }}>
            <ambientLight intensity={3} />
            <directionalLight position={[2, 5, 2]} intensity={2} />
            <pointLight position={[-5, 5, 5]} intensity={1} />
            <GoldModel />
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              enableRotate={true} // 회전만 가능하게 설정
              minDistance={0} // 거리를 제한하지 않도록 설정
              maxDistance={Infinity} // 최대 거리 제한 제거
            />
          </Canvas>

          {/* 수량 선택 */}
          <div className='flex items-center'>
            <Button
              text='-'
              type='count'
              onClick={() => handleGoldCount(-1)}
              disabled={goldCount === 0}
            />
            <p className='mx-4 text-omg-18'>{goldCount}개</p>
            <Button text='+' type='count' onClick={() => handleGoldCount(1)} />
          </div>

          {/* 총 가격 & 매입 버튼 */}
          <div className='flex items-center justify-center gap-10'>
            <p className='text-omg-24'>
              총 ${formatNumberWithCommas(GOLD_PRICE * goldCount)}
            </p>
            <Button text='매입하기' type='trade' onClick={handleBuying} />
          </div>
        </div>
      </section>
    </div>
  );
}
