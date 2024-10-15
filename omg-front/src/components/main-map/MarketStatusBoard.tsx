import { useContext } from 'react';
import Marquee from 'react-fast-marquee';
import { IoMdArrowDropdown, IoMdArrowDropup } from 'react-icons/io';
import { IoRemoveOutline } from 'react-icons/io5';

import { generateStockItemsDataWithUpdown } from '@/hooks/useStock';
import { useMainBoardStore, useStockStore } from '@/stores';
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

  return (
    <Marquee
      gradient={true}
      speed={100}
      className='h-28 bg-opacity-80 text-omg-30'
    >
      <div className='flex items-center gap-14'>
        {/* 주식 */}
        <section
          className={`flex items-center gap-8 ml-14 ${presentRound % 2 === 0 ? 'text-white' : 'text-black'}`}
        >
          <h4 className='text-omg-50 font-omg-event-title'>[실시간 주가]</h4>
          <div className='flex items-center gap-4'>
            {stockItems.map((item, idx) => {
              return (
                <div key={idx} className='flex items-center gap-2'>
                  <img src={item.src} alt={item.name} width={item.width} />
                  <p>${formatNumberWithCommas(item.price)}</p>
                  {item.updown > 0 ? (
                    <div className='text-red'>
                      <IoMdArrowDropup size={60} />
                    </div>
                  ) : item.updown < 0 ? (
                    <div className='text-blue'>
                      <IoMdArrowDropdown size={60} />
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
          className={`flex items-center gap-8 ${presentRound % 2 === 0 ? 'text-white' : 'text-black'}`}
        >
          <h4 className='text-omg-50 font-omg-event-title'>[실시간 금 시세]</h4>
          <div className='flex items-center gap-2'>
            <img src='/assets/goldbell.png' alt='goldbell' width={22} />
            <p>${formatNumberWithCommas(goldPrice)}</p>
          </div>
        </section>

        {/* 추가 시장 정보 */}
        <section
          className={`flex items-center gap-8 ${presentRound % 2 === 0 ? 'text-white' : 'text-black'}`}
        >
          <h4 className='text-omg-50 font-omg-event-title'>
            [실시간 시장 정보]
          </h4>
          <div className='flex items-center gap-4'>
            {infoItems.map((item, idx) => {
              return (
                <div key={idx} className='flex items-center gap-2'>
                  <p>{item.label}</p>
                  <p>{item.value} </p>
                  {idx < infoItems.length - 1 && (
                    <span className='mx-2'> | </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 가격 변동까지 남은 게이지 */}
        <section className='flex items-center gap-8'>
          <h4
            className={`text-omg-50 font-omg-event-title ${presentRound % 2 === 0 ? 'text-white' : 'text-black'}`}
          >
            [가격 변동까지 남은 게이지]
          </h4>
          <Gauge />
        </section>
      </div>
    </Marquee>
  );
}
