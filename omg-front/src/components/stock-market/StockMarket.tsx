import { useState } from 'react';

import MarketState from '@/components/stock-market/MarketState';
import StockMain from '@/components/stock-market/StockMain';
import { useModalStore } from '@/stores/useModalStore';
import useUser from '@/stores/useUser';
import { StockMarketView } from '@/types';

import BackButton from '../common/BackButton';
import StockBuy from './StockBuy';
import StockSell from './StockSell';

export default function StockMarket() {
  const { modals, closeModal } = useModalStore();
  const { nickname } = useUser();

  const [currentView, setCurrentView] = useState<StockMarketView>('main');

  const renderComponent = () => {
    switch (currentView) {
      case 'buy':
        return <StockBuy />;
      case 'sell':
        return <StockSell />;
      default:
        return <StockMain setCurrentView={setCurrentView} />;
    }
  };

  const handleCloseStockMarket = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && modals[nickname]?.stockMarket) {
      closeModal('stockMarket', nickname);
    }
  };

  const handleBackButton = () => {
    if (currentView === 'main') {
      if (modals[nickname]?.stockMarket) {
        closeModal('stockMarket', nickname);
      }
    } else {
      setCurrentView('main');
    }
  };

  return (
    <div
      className='fixed top-0 left-0 z-20 flex items-center justify-center w-full h-full bg-opacity-70'
      onClick={handleCloseStockMarket}
    >
      <div className='modal-container'>
        {/* 시장 수준 */}
        <section className='relative flex items-center justify-center w-full h-[14%] px-10 py-10 text-black text-omg-40b'>
          <div
            className='absolute flex items-center left-10'
            onClick={handleBackButton}
          >
            <BackButton onClick={handleBackButton} />
          </div>
          <MarketState />
        </section>

        {/* 이 아래는 동적으로 변동: 공통 / 매수 / 매도 */}
        <section className='flex w-full h-[86%]'>{renderComponent()}</section>
      </div>
    </div>
  );
}
