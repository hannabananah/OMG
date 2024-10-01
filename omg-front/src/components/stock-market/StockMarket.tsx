import useModalStore from '@/stores/useModalStore';

import LineChart from './LineChart';

export default function StockMarket() {
  const { modals, closeModal } = useModalStore(); // 모달 상태 및 함수 불러오기

  // 모달 닫기
  const handleCloseStockMarket = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && modals.stockMarket) {
      closeModal('stockMarket');
    }
  };

  return (
    <div
      className='fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-white bg-opacity-70'
      onClick={handleCloseStockMarket}
    >
      <div className='flex flex-col w-[80%] h-[80%] bg-green rounded-30'>
        {/* 시장 수준 */}
        <section className='flex justify-center w-full px-10 py-10 text-black text-omg-40b'>
          {/* <MarketState /> */}
        </section>

        {/* 주가 추이 & 주식 별 가격 */}
        <div className='flex w-full h-full'>
          <LineChart />
          <div className='flex justify-center items-center w-[50%] h-full'>
            트리 장식 별 가격 보여줄 영역
          </div>
        </div>
      </div>
    </div>
  );
}
