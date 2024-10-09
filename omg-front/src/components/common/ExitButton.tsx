import { FaPowerOff } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function ExitButton({ showText = false }) {
  const navigate = useNavigate();

  const handleExitGame = () => {
    if (!showText) {
      const confirmed = window.confirm('게임을 종료하시겠습니까?');
      if (confirmed) {
        navigate('/');
      }
    } else {
      const confirmed = window.confirm('방을 나가시겠습니까?');
      if (confirmed) {
        navigate('/');
      }
    }
  };

  return (
    <button
      onClick={handleExitGame}
      className='flex items-center justify-center space-x-4'
    >
      <FaPowerOff />
      {showText && <span className='text-omg-30'>방 나가기</span>}
    </button>
  );
}
