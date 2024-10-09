import { useContext } from 'react';
import Marquee from 'react-fast-marquee';
import { IoMdArrowDropdown, IoMdArrowDropup } from 'react-icons/io';
import { IoRemoveOutline } from 'react-icons/io5';

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
  const { stockPriceChangeInfo } = useStockStore(); // 추가된 부분

  const { presentRound } = useContext(SocketContext);

  // 주식 관련 데이터 생성 (주가 및 변동)
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
      className='h-16 bg-opacity-80 text-omg-14'
    >
      <div className='flex items-center gap-6'>
        {/* 주식 */}
        <section
          className={`flex items-center gap-3 ml-6 ${
            typeof presentRound === 'number'
              ? presentRound % 2 === 0
                ? 'text-white'
                : 'text-black'
              : 'text-black' // 기본 텍스트 색상
          }`}
        >
          <h4 className='text-omg-18'>[실시간 주가]</h4>
          <div className='flex items-center gap-4'>
            {stockItems.map((item, idx) => (
              <div key={idx} className='flex items-center gap-2'>
                <img src={item.src} alt={item.name} width={item.width} />
                <p>${formatNumberWithCommas(item.price)}</p>
                {item.updown > 0 ? (
                  <div className='text-red '>
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
            ))}
          </div>
        </section>

        {/* 금 */}
        <section
          className={`flex items-center gap-3 ${
            typeof presentRound === 'number'
              ? presentRound % 2 === 0
                ? 'text-white'
                : 'text-black'
              : 'text-black'
          }`}
        >
          <h4 className='text-omg-18'>[실시간 금 시세]</h4>
          <div className='flex items-center gap-2'>
            <img src='/assets/gold.png' alt='gold' width={24} />
            <p>${formatNumberWithCommas(goldPrice)}</p>
          </div>
        </section>

        {/* 추가 시장 정보 */}
        <section
          className={`flex items-center gap-3 ${
            typeof presentRound === 'number'
              ? presentRound % 2 === 0
                ? 'text-white'
                : 'text-black'
              : 'text-black' // 기본 텍스트 색상
          }`}
        >
          <h4 className='text-omg-18'>[실시간 시장 정보]</h4>
          <div className='flex items-center gap-4'>
            {infoItems.map((item, idx) => (
              <div key={idx} className='flex items-center gap-2'>
                <p>{item.label}</p>
                <p>{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 가격 변동까지 남은 게이지 */}
        <section className='flex items-center gap-3'>
          <h4
            className={`${
              typeof presentRound === 'number'
                ? presentRound % 2 === 0
                  ? 'text-white'
                  : 'text-black'
                : 'text-black'
            } text-omg-18`}
          >
            [가격 변동까지 남은 게이지]
          </h4>
          <Gauge />
        </section>
      </div>
    </Marquee>
  );
}
