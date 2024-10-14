import { useEffect, useRef } from 'react';

import useCountUp from '@/hooks/useCountUp';
import { useLoanStore } from '@/stores/useLoanStore';
import { useSocketMessage } from '@/stores/useSocketMessage';
import { ToastAlert } from '@/utils/ToastAlert';
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
      ToastAlert(
        `대출 신청이 완료되었습니다! 대출액 : ${formatNumberWithCommas(Number(loanMessage.message))}`,
      );
    } else {
      ToastAlert(loanMessage.message);
    }
    setLoanMessage({ message: '', isCompleted: false });
  }, [loanMessage, setLoanMessage]);

  useEffect(() => {
    if (repayLoanMessage.message === null || repayLoanMessage.message === '')
      return;

    if (repayLoanMessage.isCompleted) {
      if (repayLoanMessage.message === '0') {
        ToastAlert('대출금을 모두 상환했습니다!');
      } else {
        ToastAlert(
          `대출 상환이 완료되었습니다! 남은 대출액: ${formatNumberWithCommas(Number(repayLoanMessage.message))}`,
        );
      }
    } else {
      ToastAlert(repayLoanMessage.message);
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
      <p className='flex items-center text-omg-18'>
        <img
          src='/assets/money.png'
          alt='Money'
          className='w-20 h-20 mr-6'
          style={{ width: '3rem', height: '3rem' }}
        />
        보유 현금{' '}
        <span ref={cashRef} className='text-omg-20 font-omg-title'>
          ${formatNumberWithCommas(animatedCash)}
        </span>
      </p>
      <br />
      <p className='text-omg-18'>
        현재 총 대출액은{' '}
        <span ref={debtRef} className='text-omg-20 font-omg-title'>
          ${formatNumberWithCommas(animatedDebt)}
        </span>{' '}
        입니다.
      </p>
      <p className='text-omg-18'>
        산정된 대출 한도는{' '}
        <span ref={loanLimitRef} className='text-omg-20 font-omg-title'>
          ${formatNumberWithCommas(animatedLoanLimit)}
        </span>{' '}
        입니다.
      </p>
    </div>
  );
}
