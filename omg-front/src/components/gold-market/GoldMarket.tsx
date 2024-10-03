import MarketState from '@/components/stock-market/MarketState';
import useModalStore from '@/stores/useModalStore';

import BackButton from '../common/BackButton';
import GoldBuy from './GoldBuy';

export default function GoldMarket() {
  const { modals, closeModal } = useModalStore(); // 모달 상태 및 함수 불러오기

  // 모달 닫기
  const handleCloseGoldMarket = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && modals.goldMarket) {
      closeModal('goldMarket');
    }
  };

  // 뒤로 가기 버튼
  const handleBackButton = () => {
    if (modals.goldMarket) {
      closeModal('goldMarket');
    }
  };

  return (
    <div
      className='fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-opacity-70'
      onClick={handleCloseGoldMarket}
    >
      <div className='flex flex-col w-[80%] h-[80%] bg-white bg-opacity-80 rounded-30'>
        {/* 시장 수준 */}
        <section className='relative flex items-center justify-center w-full h-[14%] px-10 py-10 text-black text-omg-40b'>
          <div
            className='absolute flex items-center left-10'
            onClick={handleBackButton}
          >
            <BackButton />
          </div>
          <MarketState />
        </section>

        {/* 금 시세 차트 & 플레이어 별 지분 & 구매 영역 */}
        <section className='flex w-full h-[86%]'>
          <GoldBuy />
        </section>
      </div>
    </div>
  );
}
