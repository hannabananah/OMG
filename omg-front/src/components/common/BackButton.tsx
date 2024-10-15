import { IoMdArrowRoundBack } from 'react-icons/io';

interface BackButtonProps {
  onClick: () => void;
}

export default function BackButton({ onClick }: BackButtonProps) {
  return (
    <button onClick={onClick} aria-label='뒤로가기 버튼'>
      <IoMdArrowRoundBack />
    </button>
  );
}
