import MarketState from '@/components/stock-market/MarketState';
import StockMain from '@/components/stock-market/StockMain';
import useModalStore from '@/stores/useModalStore';

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
      <div className='flex flex-col w-[80%] h-[80%] bg-white bg-opacity-80 rounded-30'>
        {/* 시장 수준 */}
        <section className='flex justify-center w-full h-[12%] px-10 py-10 text-black text-omg-40b'>
          <MarketState />
        </section>

        {/* 이 아래는 동적으로 변동: 공통 / 매수 / 매도 */}
        <StockMain />
      </div>
    </div>
  );
}
