// import { useContext, useEffect } from 'react';
import { useEffect } from 'react';

import { useSocketMessage } from '@/stores/useSocketMessage';

// import { SocketContext } from '@/utils/SocketContext';
import Button from '../common/Button';

export default function LoanRepay() {
  // const { sellStock } = useContext(SocketContext);
  const { sellStockMessage } = useSocketMessage();

  useEffect(() => {
    if (!sellStockMessage.message) return;

    alert(sellStockMessage.message);
  }, [sellStockMessage]);

  const handleRepaying = () => {
    // 매도 요청
  };

  return (
    <div className='flex justify-between w-full h-full'>
      <section className='w-[50%] flex justify-center items-center'>
        <div className='flex flex-col w-full h-full gap-10 px-20 py-10 bg-skyblue'>
          <div className='flex items-center justify-center'>
            <Button text='상환하기' type='trade' onClick={handleRepaying} />
          </div>
        </div>
      </section>
    </div>
  );
}
