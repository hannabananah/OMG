import { useContext, useEffect } from 'react';

import { useLoanStore } from '@/stores/useLoanStore';
import { useSocketMessage } from '@/stores/useSocketMessage';
import { SocketContext } from '@/utils/SocketContext';

import Button from '../common/Button';

export default function LoanTake() {
  useContext(SocketContext);
  const { takeLoan, enterLoan } = useContext(SocketContext);

  const { loanLimit } = useLoanStore();
  const { loanMessage } = useSocketMessage();

  useEffect(() => {
    enterLoan();
  }, []);

  useEffect(() => {
    console.log('loanMessage:', loanMessage);

    if (!loanMessage.message) return;

    if (loanMessage.isCompleted) {
      alert(`대출 신청이 완료되었습니다! 대출액: ${loanMessage.message}`);
    } else if (!loanMessage.isCompleted) {
      alert(loanMessage.message);
    }
  }, [loanMessage]);

  const handleClickTakeLoan = () => {
    const loanAmount = Number(prompt('대출할 액수를 입력하세요.').trim());
    if (loanAmount === 0) {
      alert('대출할 액수를 다시 입력해주세요.');
      return;
    }

    takeLoan(loanAmount);
  };

  return (
    <div className='flex justify-between w-full h-full'>
      {/* 대출 신청 영역 */}
      <section className='w-[50%] flex justify-center items-center'>
        <div className='flex flex-col w-full h-full gap-10 px-20 py-10'>
          <p className='font-omg-body text-omg-24'>
            현재 대출 한도는 <span className='text-omg-28b'>${loanLimit}</span>{' '}
            입니다.
          </p>
          {/* 대출 버튼 */}
          <div className='flex items-center justify-center'>
            <Button
              text='대출하기'
              type='trade'
              onClick={handleClickTakeLoan}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
