import { useContext, useEffect, useState } from 'react';
import { BiSpreadsheet } from 'react-icons/bi';
import { FaRegQuestionCircle } from 'react-icons/fa';
import { GiCardPick } from 'react-icons/gi';

import { useLoanStore } from '@/stores/useLoanStore';
import useModalStore from '@/stores/useModalStore';
import useUser from '@/stores/useUser';
import { LoanMarketView } from '@/types';
import { SocketContext } from '@/utils/SocketContext';

import BackButton from '../common/BackButton';
import LoanActionButton from './LoanActionButton';
import LoanInfo from './LoanInfo';
import LoanLogicModal from './LoanLogicModal';
import LoanReport from './LoanReport';
import LoanSheet from './LoanSheet';

export default function LoanMarket() {
  const { enterLoan, takeLoan, repayLoan } = useContext(SocketContext);
  const { totalDebt } = useLoanStore();
  const { modals, closeModal } = useModalStore();
  const { nickname } = useUser();

  const [currentView, setCurrentView] = useState<LoanMarketView>('main');
  const [isReportVisible, setIsReportVisible] = useState(true);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  useEffect(() => {
    enterLoan();
  }, []);

  const handleCloseLoanMarket = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && modals[nickname]?.loanMarket) {
      closeModal('loanMarket', nickname);
    }
  };

  const handleBackButton = () => {
    if (currentView === 'main') {
      if (modals[nickname]?.loanMarket) {
        closeModal('loanMarket', nickname);
      }
    } else {
      setCurrentView('main');
    }
  };

  const toggleView = () => {
    setIsReportVisible(prev => !prev);
  };

  const showTooltip = () => {
    setIsTooltipVisible(true);
    setTimeout(() => {
      setIsTooltipVisible(false);
    }, 5000);
  };

  return (
    <div
      className='fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-opacity-70'
      onClick={handleCloseLoanMarket}
    >
      <div className='modal-container'>
        <section className='relative flex items-center justify-center h-[14%] px-10 py-10 text-black text-omg-40b w-full'>
          <div
            className='absolute flex items-center left-10'
            onClick={handleBackButton}
          >
            <BackButton onClick={handleBackButton} />
          </div>
          <button
            type='button'
            className='absolute w-10 h-10 m-4 text-center right-10 -p-4'
            onMouseEnter={showTooltip}
          >
            <FaRegQuestionCircle size={20} />
          </button>

          <LoanLogicModal isTooltipVisible={isTooltipVisible} />
        </section>

        <section className='flex w-full h-full'>
          <div className='relative w-3/5'>
            <h2 className='text-center text-omg-28b'>보유 대출 리스트</h2>
            <div className='absolute right-28 top-10'>
              <button
                onClick={toggleView}
                className='transition-transform duration-300 hover:scale-110'
              >
                {isReportVisible ? (
                  <BiSpreadsheet size={28} />
                ) : (
                  <GiCardPick size={28} />
                )}
              </button>
            </div>
            {isReportVisible ? <LoanReport /> : <LoanSheet />}
          </div>
          <div className='flex flex-col items-center justify-center w-2/5 h-full gap-20'>
            <LoanInfo />
            <div className='flex gap-4'>
              <LoanActionButton
                actionType='take'
                buttonText='대출하기'
                onAction={takeLoan}
              />
              <LoanActionButton
                actionType='repay'
                buttonText='상환하기'
                onAction={repayLoan}
                disabled={totalDebt === 0}
              />
            </div>
            <div>
              <p className='underline text-omg-14'>
                *해당 대출은 금리가 높은 상품부터 우선적으로 상환됩니다.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
