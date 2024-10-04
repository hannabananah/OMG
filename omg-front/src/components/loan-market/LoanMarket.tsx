import { useContext, useEffect, useState } from 'react';

import LoanMain from '@/components/loan-market/LoanMain';
import useModalStore from '@/stores/useModalStore';
import { LoanMarketView } from '@/types';
import { SocketContext } from '@/utils/SocketContext';

import BackButton from '../common/BackButton';
import LoanRepay from './LoanRepay';
import LoanTake from './LoanTake';

export default function LoanMarket() {
  const { enterLoan } = useContext(SocketContext);

  const { modals, closeModal } = useModalStore();
  const [currentView, setCurrentView] = useState<LoanMarketView>('main');

  useEffect(() => {
    enterLoan();
  }, []);

  const renderComponent = () => {
    switch (currentView) {
      case 'take':
        return <LoanTake />;
      case 'repay':
        return <LoanRepay />;
      default:
        return <LoanMain setCurrentView={setCurrentView} />;
    }
  };

  const handleCloseLoanMarket = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && modals.loanMarket) {
      closeModal('loanMarket');
    }
  };

  const handleBackButton = () => {
    if (currentView === 'main') {
      if (modals.loanMarket) {
        closeModal('loanMarket');
      }
    } else {
      setCurrentView('main');
    }
  };

  return (
    <div
      className='fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-opacity-70'
      onClick={handleCloseLoanMarket}
    >
      <div className='flex flex-col w-[80%] h-[80%] bg-white bg-opacity-80 rounded-30'>
        {/* 시장 수준 */}
        <section className='relative flex items-center justify-center w-full h-[14%] px-10 py-10 text-black text-omg-40b'>
          <div
            className='absolute flex items-center left-10'
            onClick={handleBackButton}
          >
            <BackButton onClick={handleBackButton} />
          </div>
        </section>

        {/* 이 아래는 동적으로 변동: 신청/ 상환 */}
        <section className='flex w-full h-[86%]'>{renderComponent()}</section>
      </div>
    </div>
  );
}
