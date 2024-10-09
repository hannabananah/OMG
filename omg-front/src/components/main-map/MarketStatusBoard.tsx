import { useContext, useRef } from 'react';
import Marquee from 'react-fast-marquee';
import { IoMdArrowDropdown, IoMdArrowDropup } from 'react-icons/io';
import { IoRemoveOutline } from 'react-icons/io5';

import useCountUp from '@/hooks/useCountUp';
import { generateStockItemsDataWithUpdown } from '@/hooks/useStock';
import { useMainBoardStore } from '@/stores/useMainBoardStore';
import { useStockStore } from '@/stores/useStockStore';
import { SocketContext } from '@/utils/SocketContext';
import formatNumberWithCommas from '@/utils/formatNumberWithCommas';

import Gauge from '../common/Gauge';

export default function MarketStatusBoard() {
  const {
    goldPrice,
    currentInterestRate,
    currentStockPriceLevel,
    tradableStockCnt,
  } = useMainBoardStore();
  const { stockPriceChangeInfo } = useStockStore();

  const { presentRound } = useContext(SocketContext);

  const stockItems = generateStockItemsDataWithUpdown(stockPriceChangeInfo);

  const infoItems = [
    { label: '금리', value: `${currentInterestRate}%` },
    { label: '물가 수준', value: `${currentStockPriceLevel}/9` },
    { label: '거래 가능 수량', value: `${tradableStockCnt}개` },
  ];

  const goldRef = useRef<HTMLParagraphElement>(null);
  const goldCountUp = useCountUp(goldRef, goldPrice);

  return (
    <Marquee
      gradient={true}
      speed={100}
      className='h-16 bg-opacity-80 text-omg-14'
    >
      <div className='flex items-center gap-6'>
        {/* 주식 */}
        <section
          className={`flex items-center gap-3 ml-6 ${presentRound % 2 === 0 ? 'text-white' : 'text-black'}`}
        >
          <h4 className='text-omg-18'>[실시간 주가]</h4>
          <div className='flex items-center gap-4'>
            {stockItems.map((item, idx) => {
              const stockRef = useRef<HTMLParagraphElement>(null);
              const animatedStock = useCountUp(stockRef, item.price);

              return (
                <div key={idx} className='flex items-center gap-2'>
                  <img src={item.src} alt={item.name} width={item.width} />
                  <p ref={stockRef}>${formatNumberWithCommas(animatedStock)}</p>
                  {item.updown > 0 ? (
                    <div className='text-red'>
                      <IoMdArrowDropup />
                    </div>
                  ) : item.updown < 0 ? (
                    <div className='text-blue'>
                      <IoMdArrowDropdown />
                    </div>
                  ) : (
                    <IoRemoveOutline />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 금 */}
        <section
          className={`flex items-center gap-3 ${presentRound % 2 === 0 ? 'text-white' : 'text-black'}`}
        >
          <h4 className='text-omg-18'>[실시간 금 시세]</h4>
          <div className='flex items-center gap-2'>
            <img src='/assets/gold.png' alt='gold' width={24} />
            <p ref={goldRef}>${formatNumberWithCommas(goldCountUp)}</p>
          </div>
        </section>

        {/* 추가 시장 정보 */}
        <section
          className={`flex items-center gap-3 ${presentRound % 2 === 0 ? 'text-white' : 'text-black'}`}
        >
          <h4 className='text-omg-18'>[실시간 시장 정보]</h4>
          <div className='flex items-center gap-4'>
            {infoItems.map((item, idx) => {
              const itemRef = useRef<HTMLParagraphElement>(null);
              const animatedItem = useCountUp(itemRef, Number(item.value));

              return (
                <div key={idx} className='flex items-center gap-2'>
                  <p>{item.label}</p>
                  <p ref={itemRef}>{animatedItem}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 가격 변동까지 남은 게이지 */}
        <section className='flex items-center gap-3'>
          <h4
            className={`text-omg-18 ${presentRound % 2 === 0 ? 'text-white' : 'text-black'}`}
          >
            [가격 변동까지 남은 게이지]
          </h4>
          <Gauge />
        </section>
      </div>
    </Marquee>
  );
}
