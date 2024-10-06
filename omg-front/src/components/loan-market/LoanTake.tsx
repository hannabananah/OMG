import { useContext } from 'react';

import { SocketContext } from '@/utils/SocketContext';

import Button from '../common/Button';

export default function LoanTake() {
  const { takeLoan } = useContext(SocketContext);

  const handleClickTakeLoan = () => {
    const loanAmount = Number(prompt('대출할 액수를 입력하세요.').trim());
    if (loanAmount <= 0) {
      alert('대출할 액수를 다시 입력해주세요.');
      return;
    }
    takeLoan(loanAmount);
  };

  return (
    <div className='flex items-center justify-center'>
      <Button text='대출하기' type='trade' onClick={handleClickTakeLoan} />
    </div>
  );
}
