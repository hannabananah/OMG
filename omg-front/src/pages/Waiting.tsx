import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { SocketContext } from '@/utils/SocketContext';

export default function Waiting() {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const {
    socket,
    online,
    players,
    waitingSubscription,
    disconnect,
    leaveRoom,
    chatSubscription,
    sendMessage,
  } = useContext(SocketContext);

  if (!roomId) {
    console.error('Room ID is undefined');
    return null;
  }

  const [isRoomFull, setIsRoomFull] = useState(false);
  const [msg, setMsg] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<string[]>([]);

  useEffect(() => {
    if (online && socket) {
      waitingSubscription();
      // TODO: 임시 채팅 구독
      chatSubscription();
    }
  }, [online, socket, waitingSubscription]);

  useEffect(() => {
    setIsRoomFull(players.length >= 4);
  }, [socket, players]);

  const handleClick = () => {
    if (isRoomFull) {
      navigate('/game');
    }
  };

  const handleExit = () => {
    // TODO: 유저 네임 바꿔야함
    leaveRoom('testUser13');
    disconnect();
    navigate(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMsg(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (msg.trim()) {
      // 서버로 메시지 전송
      sendMessage(msg);
      setChatMessages(prev => [...prev, msg]);
      setMsg('');
    }
  };

  return (
    <div className='relative flex flex-col items-center justify-center w-full h-screen p-10 bg-lime-100'>
      <button className='absolute right-1 bottom-1' onClick={handleExit}>
        <p>대기방 나가기</p>
      </button>
      <h2 className='text-lime-700'>대기 중인 플레이어 수: {players.length}</h2>
      <ul>
        {players.map((player, index) => (
          <li key={index} className='text-lime-500'>
            {player}
          </li>
        ))}
      </ul>
      <button onClick={handleClick} disabled={!isRoomFull}>
        START
      </button>
      <div className='mt-4'>
        <h3 className='text-lime-700'>채팅:</h3>
        <div className='p-2 overflow-y-auto border max-h-40 border-lime-500'>
          {chatMessages.map((message, index) => (
            <p key={index} className='text-lime-600'>
              {message}
            </p>
          ))}
        </div>
        <form onSubmit={handleSubmit} className='flex mt-2'>
          <input
            type='text'
            className='p-2 border rounded-l border-lime-500'
            onChange={handleInputChange}
            value={msg}
            placeholder='메시지를 입력하세요...'
          />
          <button
            type='submit'
            className='p-2 text-white rounded-r bg-lime-500'
          >
            전송
          </button>
        </form>
      </div>
    </div>
  );
}
