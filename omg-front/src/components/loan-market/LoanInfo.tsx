import { useEffect, useRef } from 'react';

import useCountUp from '@/hooks/useCountUp';
import { useLoanStore } from '@/stores/useLoanStore';
import { useSocketMessage } from '@/stores/useSocketMessage';
import formatNumberWithCommas from '@/utils/formatNumberWithCommas';

export default function LoanInfo() {
  const { loanLimit, cash, totalDebt, setLoanData } = useLoanStore();
  const { loanMessage, setLoanMessage, repayLoanMessage, setRepayLoanMessage } =
    useSocketMessage();

  useEffect(() => {
    setLoanData({
      totalDebt,
      cash,
      loanLimit,
    });
  }, [cash, loanLimit, totalDebt, setLoanData]);

  useEffect(() => {
    if (!loanMessage.message) return;

    if (loanMessage.isCompleted) {
      alert(
        `대출 신청이 완료되었습니다! 대출액: ${formatNumberWithCommas(Number(loanMessage.message))}`,
      );
    } else {
      alert(loanMessage.message);
    }
    setLoanMessage({ message: '', isCompleted: false });
  }, [loanMessage, setLoanMessage]);

  useEffect(() => {
    if (repayLoanMessage.message === null || repayLoanMessage.message === '')
      return;

    if (repayLoanMessage.isCompleted) {
      if (repayLoanMessage.message === '0') {
        alert('대출금을 모두 상환했습니다!');
      } else {
        alert(
          `대출 상환이 완료되었습니다! 남은 대출액: ${formatNumberWithCommas(Number(repayLoanMessage.message))}`,
        );
      }
    } else {
      alert(repayLoanMessage.message);
    }
    setRepayLoanMessage({ message: '', isCompleted: false });
  }, [setLoanData, repayLoanMessage]);

  const cashRef = useRef<HTMLSpanElement>(null);
  const loanLimitRef = useRef<HTMLSpanElement>(null);
  const debtRef = useRef<HTMLSpanElement>(null);
  const animatedCash = useCountUp(cashRef, cash);
  const animatedLoanLimit = useCountUp(loanLimitRef, loanLimit);
  const animatedDebt = useCountUp(debtRef, totalDebt);

  return (
    <div className='flex flex-col items-center w-full gap-4'>
      <p className='text-omg-18'>
        나의 자산은&nbsp;
        <span ref={cashRef} className='text-omg-20 font-omg-title'>
          ${formatNumberWithCommas(animatedCash)}
        </span>
        이고,
      </p>
      <p className='text-omg-18'>
        현재 대출 한도는&nbsp;
        <span ref={loanLimitRef} className='text-omg-20 font-omg-title'>
          ${formatNumberWithCommas(animatedLoanLimit)}
        </span>
        입니다.
      </p>
      <p className='text-omg-18'>
        현재 갚아야 할 돈은&nbsp;
        <span ref={debtRef} className='text-omg-20 font-omg-title'>
          ${formatNumberWithCommas(animatedDebt)}
        </span>
        입니다.
      </p>
    </div>
  );
}
