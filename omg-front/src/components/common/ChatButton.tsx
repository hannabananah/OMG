import { ToastAlert } from '@/utils/ToastAlert';

interface ChatButtonProps {
  isWhite?: boolean;
  onClick?: () => void;
}

export default function ChatButton({
  isWhite = false,
  onClick,
}: ChatButtonProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      ToastAlert('채팅 모달을 엽니다.');
    }
  };

  return (
    <button onClick={handleClick} aria-label='채팅 모달 열기'>
      <img
        src={isWhite ? '/assets/white-chat.png' : '/assets/chat.png'}
        alt='채팅 아이콘'
      />
    </button>
  );
}
