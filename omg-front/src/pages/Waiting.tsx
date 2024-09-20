import { useNavigate } from 'react-router-dom';

export default function Waiting() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/game');
  };
  return (
    <div>
      <h2 className='text-lime-700'>waiting</h2>
      <button onClick={handleClick}>START</button>
    </div>
  );
}
