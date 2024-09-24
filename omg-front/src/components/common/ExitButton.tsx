import { FaPowerOff } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function ExitButton({ showText = false }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(-1);
  };

  return (
    <button onClick={handleClick} className='flex items-center space-x-2'>
      <FaPowerOff />
      {showText && <span className='text-omg-sm'>대기방 나가기</span>}
    </button>
  );
}
