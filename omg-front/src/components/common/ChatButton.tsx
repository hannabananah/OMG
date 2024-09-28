import { IoChatbubbleEllipsesSharp } from 'react-icons/io5';

export default function ChatButton() {
  const openChattingModal = () => {
    alert('채팅 모달을 엽니다.');
  };

  return (
    <button onClick={openChattingModal}>
      <IoChatbubbleEllipsesSharp />
    </button>
  );
}
