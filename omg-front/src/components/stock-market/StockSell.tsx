import { useContext } from 'react';

import { useGameStore } from '@/stores/useGameStore';
import { SocketContext } from '@/utils/SocketContext';

import Button from '../common/Button';
import PossessionChart from './PossessionChart';

export default function StockSell() {
  const { sellStock } = useContext(SocketContext);
  const { carryingCount, setCarryingCount } = useGameStore();

  const handleSelling = () => {
    if (carryingCount.every(count => count === 0)) {
      alert('매도할 주식이 없습니다.');
      return;
    }

    sellStock(carryingCount);
    setCarryingCount([0, 0, 0, 0, 0, 0]);
  };

  return (
    <div className='flex justify-between w-full h-full'>
      {/* 주식 별 지분 */}
      <section className='flex justify-between w-[50%]'>
        <PossessionChart />
      </section>

      <section className='w-[50%] flex justify-center items-center'>
        <div className='flex flex-col w-full h-full gap-10 px-20 py-10 bg-skyblue'>
          <div className='flex items-center justify-center'>
            <Button
              text='매도하기'
              type='stock-trade'
              onClick={handleSelling}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
