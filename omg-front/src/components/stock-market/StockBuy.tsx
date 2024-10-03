import { useState } from 'react';

import { itemNameList } from '@/assets/data/stockPriceData';
import { getTreeItemImagePath } from '@/hooks/useStock';
import { useStockStore } from '@/stores/useStockStore';

import Button from '../common/Button';
import PossessionChart from './PossessionChart';

export default function StockBuy() {
  // 서버로 부터 주식 데이터 받아오기
  const { stockPrices, leftStocks } = useStockStore();

  const MAX_TRADE_COUNT = 5; // 최대 거래 가능 수량
  const MY_MONEY = 50; // 보유한 현금

  // 6짜리 count 배열 (1 ~ 5번 인덱스 활용)
  const [selectedCounts, setSelectedCounts] = useState(Array(6).fill(0));

  // 총 선택된 수량 계산
  const totalSelectedCount = selectedCounts.reduce(
    (acc, count) => acc + count,
    0,
  );
  // back에 보낼 6짜리 count 배열 세팅
  const handleCountChange = (idx: number, value: number) => {
    const newCounts = [...selectedCounts];
    const newCount = newCounts[idx + 1] + value;

    // 최대 거래 가능 수량 넘으면 alert
    const newTotalCount = totalSelectedCount + value;
    if (newTotalCount > MAX_TRADE_COUNT) {
      alert(`최대 거래 가능 수량은 ${MAX_TRADE_COUNT}개 입니다.`);
      return;
    }

    // 보유 현금 초과하면 alert
    const newTotalPrice = totalPrice + value * stockPrices[idx + 1];
    if (newTotalPrice > MY_MONEY) {
      alert(`보유한 현금 $${MY_MONEY}을 초과할 수 없습니다.`);
      return;
    }

    newCounts[idx + 1] = Math.max(0, newCount); // 수량이 0보다 작아지지 않도록
    setSelectedCounts(newCounts);
  };

  // 총 가격 계산
  const totalPrice = selectedCounts.reduce(
    (acc, count, idx) => acc + count * stockPrices[idx],
    0,
  );

  // 매수 버튼: 서버로 selectedCounts 전송 !
  const handleBuying = () => {
    console.log('선택된 수량 배열:', selectedCounts);
  };

  return (
    <div className='flex justify-between w-full h-full'>
      {/* 주식 별 지분 */}
      <section className='flex justify-between w-[50%]'>
        <PossessionChart />
      </section>

      {/* 주식 구매 영역 */}
      <section className='w-[50%] flex justify-center items-center'>
        <div className='flex flex-col w-full h-full gap-10 px-20 py-10'>
          {/* 이미지 & 주가 & 남은 수량 & 수량 선택 */}
          <ul className='flex flex-col gap-8'>
            {itemNameList.map((treeItem, idx) => (
              <li
                key={idx}
                className='flex items-center justify-between text-omg-18'
              >
                {/* 이미지 */}
                <div className='w-10 h-10'>
                  <img
                    src={getTreeItemImagePath(treeItem)}
                    className='object-contain w-full h-full'
                  />
                </div>
                {/* 주가 */}
                <p>${stockPrices[idx + 1]}</p>
                {/* 남은 수량 */}
                <p className='text-omg-14'>
                  남은 수량: {leftStocks[idx + 1]}개
                </p>
                {/* 수량 선택 */}
                <div className='flex items-center'>
                  <Button
                    text='-'
                    type='count'
                    onClick={() => handleCountChange(idx, -1)}
                  />
                  <p className='mx-4 text-omg-18'>{selectedCounts[idx + 1]}</p>
                  <Button
                    text='+'
                    type='count'
                    onClick={() => handleCountChange(idx, 1)}
                  />
                </div>
              </li>
            ))}
          </ul>

          {/* 총 가격 표시 */}
          <div className='flex justify-between text-omg-18'>
            <p>총 가격:</p>
            <p>${totalPrice}</p>
          </div>

          {/* 매수 버튼 */}
          <div className='flex items-center justify-center'>
            <Button text='매수하기' type='trade' onClick={handleBuying} />
          </div>
        </div>
      </section>
    </div>
  );
}
