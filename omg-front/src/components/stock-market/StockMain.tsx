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

  // 컬러 설정
  const colors = ['#5C43FD', '#FF50A3', '#FEB833', '#FF782A', '#23A50F'];

  return (
    <>
      {/* 주가 차트 */}

      <LineChart stockData={stockData} />

      <div className='flex w-[50%] h-full pb-14 pr-10'>
        <div className='flex flex-col w-full gap-2'>
          <h2 className='text-center text-omg-18'>
            *실시간 주가 및 등락 현황*
          </h2>
          <div className='flex flex-col justify-between w-full h-full'>
            {/* 주식 별 가격 및 등락 */}
            <ul className='flex flex-col items-center gap-3'>
              {stockPriceData.map((item, idx) => {
                return (
                  <li
                    key={idx}
                    className='flex gap-10 px-6 py-3 pr-8 rounded-30'
                    style={{
                      backgroundColor: colors[idx % colors.length],
                    }} // idx별로 색상 설정
                  >
                    {/* 아이템 이미지 */}
                    <div className='flex w-20 h-12'>
                      <img
                        src={`/assets/${item.itemName}.png`}
                        className='object-contain w-full h-full'
                        alt={item.itemName}
                      />
                    </div>

                    {/* 주가 */}
                    <p className='flex items-center w-24 h-full text-omg-24'>
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
                text='매수 시장'
                type='trade'
                onClick={renderStockBuyComponent}
              />
              <Button
                text='매도 시장'
                type='trade'
                onClick={renderStockSellComponent}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
