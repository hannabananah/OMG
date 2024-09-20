import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/lobby');
  };

  return (
    <div className='flex flex-col items-center justify-center w-full h-screen p-10 bg-yellow-50'>
      <div className='flex flex-col justify-center w-full h-full gap-10'>
        <h2 className='text-center text-omg-lg font-omg-title'>
          로그인 페이지
        </h2>
        <button className='py-2 bg-white text-omg-sm' onClick={handleClick}>
          소셜로그인 버튼
        </button>
      </div>
    </div>
  );
}
