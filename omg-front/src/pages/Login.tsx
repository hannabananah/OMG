import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/lobby');
  };

  return (
    <div className='flex flex-col justify-center w-full h-screen p-10'>
      <div className='flex flex-col items-center justify-center w-full h-full gap-10'>
        <button className='py-2 text-omg-40b' onClick={handleClick}>
          카카오 로그인
        </button>
        <button className='py-2 text-omg-40b'>카카오로 시작하기</button>
      </div>
    </div>
  );
}
