import { useLoanStore } from '@/stores/useLoanStore';
import { LoanMarketView } from '@/types';

import Button from '../common/Button';

interface LoanMainProps {
  setCurrentView: React.Dispatch<React.SetStateAction<LoanMarketView>>;
}

export default function LoanMain({ setCurrentView }: LoanMainProps) {
  // 매도 컴포넌트 렌더링
  const renderLoanTakeComponent = () => {
    setCurrentView('take');
  };

  // 매수 컴포넌트 렌더링
  const renderLoanRepayComponent = () => {
    setCurrentView('repay');
  };

  return (
    <>
      <div className='flex w-[50%] h-full py-10 pb-24'>
        <div className='flex flex-col justify-between w-full'>
          {/* 대출/상환 버튼 */}
          <div className='flex justify-center w-full gap-5'>
            <Button
              text='대출 신청'
              type='trade'
              onClick={renderLoanTakeComponent}
            />
            <Button
              text='대출 상환'
              type='trade'
              onClick={renderLoanRepayComponent}
            />
          </div>
        </div>
      </div>
    </>
  );
}
