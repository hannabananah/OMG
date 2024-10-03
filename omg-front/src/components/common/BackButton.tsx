import { IoMdArrowRoundBack } from 'react-icons/io';

interface BackButtonProps {
  onClick: () => void;
}

export default function BackButton({ onClick }: BackButtonProps) {
  return (
    <button onClick={onClick}>
      <IoMdArrowRoundBack />
    </button>
  );
}
