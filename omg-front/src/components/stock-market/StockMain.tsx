import { IoMdArrowDropdown, IoMdArrowDropup } from 'react-icons/io';
import { IoRemoveOutline } from 'react-icons/io5';

import { itemNameList } from '@/assets/data/stockMarketData';
import { chartData, getStockPriceData } from '@/hooks/useStock';
import { useStockStore } from '@/stores/useStockStore';
import { StockMarketView } from '@/types';
import formatNumberWithCommas from '@/utils/formatNumberWithCommas';

import Button from '../common/Button';
import LineChart from './LineChart';

interface StockMainProps {
  setCurrentView: React.Dispatch<React.SetStateAction<StockMarketView>>;
}

export default function StockMain({ setCurrentView }: StockMainProps) {
  // 서버로 부터 주식 데이터 받아오기
  const { stockPriceChangeInfo } = useStockStore();

  // 주가 차트 데이터 생성
  const reversedItemNameList = [...itemNameList].reverse();
  const stockData = chartData(stockPriceChangeInfo, reversedItemNameList);

  // 주가와 등락 계산
  const stockPriceData = getStockPriceData(stockData);

  // 매도 컴포넌트 렌더링
  const renderStockBuyComponent = () => {
    setCurrentView('buy');
  };

  // 매수 컴포넌트 렌더링
  const renderStockSellComponent = () => {
    setCurrentView('sell');
  };

  return (
    <>
      {/* 주가 차트 */}
      <LineChart stockData={stockData} />

      <div className='flex w-[50%] h-full py-10 pb-24'>
        <div className='flex flex-col justify-between w-full'>
          {/* 주식 별 가격 및 등락 */}
          <ul className='flex flex-col items-center w-full gap-5'>
            {stockPriceData.map((item, idx) => {
              return (
                <li key={idx} className='flex gap-10'>
                  {/* 아이템 이미지 */}
                  <div className='flex w-24 h-16'>
                    <img
                      src={`/assets/${item.itemName}.png`}
                      className='object-contain w-full h-full'
                      alt={item.itemName}
                    />
                  </div>

                  {/* 주가 */}
                  <p className='flex items-center w-24 h-full text-omg-28'>
                    ${formatNumberWithCommas(item.price)}
                  </p>

                  {/* 등락 */}
                  <div className='flex items-center justify-between w-24 h-full text-omg-40b'>
                    <p className='text-omg-20'>${Math.abs(item.updown)}</p>
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
                </li>
              );
            })}
          </ul>

          {/* 매수/매도 버튼 */}
          <div className='flex justify-center w-full gap-5'>
            <Button
              text='매수'
              type='trade'
              onClick={renderStockBuyComponent}
            />
            <Button
              text='매도'
              type='trade'
              onClick={renderStockSellComponent}
            />
          </div>
        </div>
      </div>
    </>
  );
}
