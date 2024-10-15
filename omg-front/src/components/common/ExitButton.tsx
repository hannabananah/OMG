import { FaPowerOff } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import { ConfirmAlert } from '@/utils';

export default function ExitButton({ showText = false }) {
  const navigate = useNavigate();

  const handleExitGame = () => {
    const message = showText
      ? '방을 나가시겠습니까?'
      : '게임을 종료하시겠습니까?';

    ConfirmAlert(message, () => {
      navigate('/');
    });
  };

  return (
    <button
      onClick={handleExitGame}
      className='flex items-center justify-center space-x-4'
      aria-label='방 나가기 버튼'
    >
      <FaPowerOff />
      {showText && <span className='text-omg-30'>방 나가기</span>}
    </button>
  );
}
