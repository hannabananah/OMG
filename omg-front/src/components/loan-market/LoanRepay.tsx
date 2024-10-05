import { useContext, useEffect } from 'react';

import { useLoanStore } from '@/stores/useLoanStore';
import { useSocketMessage } from '@/stores/useSocketMessage';
import { SocketContext } from '@/utils/SocketContext';

import Button from '../common/Button';

export default function LoanRepay() {
  const { repayLoan } = useContext(SocketContext);
  const { totalDebt, cash, setLoanData } = useLoanStore();
  const { repayLoanMessage, setRepayLoanMessage } = useSocketMessage();

  useEffect(() => {
    if (repayLoanMessage.message === null || repayLoanMessage.message === '')
      return;

    if (repayLoanMessage.isCompleted) {
      if (repayLoanMessage.message === '0') {
        alert('대출금을 모두 상환했습니다!');
      } else {
        alert(
          `대출 상환이 완료되었습니다! 남은 대출액: ${repayLoanMessage.message}`,
        );
      }
    } else {
      alert(repayLoanMessage.message);
    }
    setRepayLoanMessage({ message: '', isCompleted: false });
  }, [setLoanData, repayLoanMessage]);

  const handleClickRepayLoan = () => {
    const repayLoanAmount = Number(
      prompt('상환할 대출 액수를 입력하세요.').trim(),
    );
    if (repayLoanAmount === 0) {
      alert('상환액을 다시 입력해주세요.');
      return;
    }
    repayLoan(repayLoanAmount);
  };

  return (
    <div className='flex justify-between w-full h-full'>
      <section className='w-[50%] flex justify-center items-center'>
        <div className='flex flex-col w-full h-full gap-10 px-20 py-10 font-omg-body text-omg-24 bg-skyblue'>
          <p>
            현재 갚아야 할 남은 돈:
            <span className='text-omg-28b'>${totalDebt}</span>
          </p>
          <p>
            나의 자산: <span className='text-omg-28b'>${cash}</span>
          </p>
          <div className='flex items-center justify-center'>
            <Button
              text='상환하기'
              type='trade'
              onClick={handleClickRepayLoan}
              disabled={totalDebt === 0}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
