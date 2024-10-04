import { useContext, useEffect } from 'react';

import { useLoanStore } from '@/stores/useLoanStore';
import { useSocketMessage } from '@/stores/useSocketMessage';
import useUser from '@/stores/useUser';
import { SocketContext } from '@/utils/SocketContext';

import Button from '../common/Button';

export default function LoanTake() {
  const { takeLoan } = useContext(SocketContext);
  const { playerIndex } = useUser();
  const { players } = useContext(SocketContext);
  const { loanLimit, cash, totalDebt, setLoanData } = useLoanStore();
  const { loanMessage, setLoanMessage } = useSocketMessage();

  useEffect(() => {
    if (players && players[playerIndex]) {
      const initialCash = players[playerIndex]?.cash;
      if (initialCash !== undefined) {
        setLoanData({
          totalDebt: totalDebt,
          cash: initialCash,
        });
      } else {
        console.error('현금 정보 불러올 수 없음');
      }
    }
  }, [playerIndex, setLoanData]);

  useEffect(() => {
    if (!loanMessage.message) return;

    if (loanMessage.isCompleted) {
      alert(`대출 신청이 완료되었습니다! 대출액: ${loanMessage.message}`);
    } else {
      alert(loanMessage.message);
    }
    setLoanMessage({ message: '', isCompleted: false });
  }, [loanMessage, setLoanData]);

  const handleClickTakeLoan = () => {
    const loanAmount = Number(prompt('대출할 액수를 입력하세요.').trim());
    if (loanAmount <= 0) {
      alert('대출할 액수를 다시 입력해주세요.');
      return;
    }

    takeLoan(loanAmount);
  };

  return (
    <div className='flex justify-between w-full h-full'>
      <section className='w-[50%] flex justify-center items-center'>
        <div className='flex flex-col w-full h-full gap-10 px-20 py-10'>
          <p className='font-omg-body text-omg-24'>
            나의 자산은 <span className='text-omg-28b'>${cash}</span> 이고,
          </p>
          <p className='font-omg-body text-omg-24'>
            현재 대출 한도는 <span className='text-omg-28b'>${loanLimit}</span>
            입니다.
          </p>
          <p className='font-omg-body text-omg-24'>
            현재 갚아야 할 돈은
            <span className='text-omg-28b'>${totalDebt}</span>
            입니다.
          </p>
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
