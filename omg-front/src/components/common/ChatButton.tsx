interface ChatButtonProps {
  isWhite?: boolean;
}

export default function ChatButton({ isWhite = false }: ChatButtonProps) {
  const openChattingModal = () => {
    alert('채팅 모달을 엽니다.');
  };

  return (
    <button onClick={openChattingModal}>
      {isWhite ? (
        <img src='/assets/white-chat.png' alt='chatting' />
      ) : (
        <img src='/assets/chat.png' alt='chatting' />
      )}
    </button>
  );
}
