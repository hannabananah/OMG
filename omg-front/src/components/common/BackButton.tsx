import { IoMdArrowRoundBack } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';

export default function BackButton() {
  const navigate = useNavigate();

  const goToMainMap = () => {
    navigate('/mainmap');
  };

  return (
    <button onClick={goToMainMap}>
      <IoMdArrowRoundBack />
    </button>
  );
}
