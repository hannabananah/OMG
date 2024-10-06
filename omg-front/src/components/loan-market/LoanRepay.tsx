import { useContext } from 'react';

import { useLoanStore } from '@/stores/useLoanStore';
import { SocketContext } from '@/utils/SocketContext';

import Button from '../common/Button';

export default function LoanRepay() {
  const { repayLoan } = useContext(SocketContext);
  const { totalDebt } = useLoanStore();

  const handleClickRepayLoan = () => {
    const repayLoanAmount = Number(
      prompt('상환할 대출 액수를 입력하세요.').trim(),
    );
    if (repayLoanAmount <= 0) {
      alert('상환액을 다시 입력해주세요.');
      return;
    }
    repayLoan(repayLoanAmount);
  };

  return (
    <div className='flex items-center justify-center'>
      <Button
        text='상환하기'
        type='trade'
        onClick={handleClickRepayLoan}
        disabled={totalDebt === 0}
      />
    </div>
  );
}
