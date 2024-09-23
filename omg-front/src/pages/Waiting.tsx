import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Chatting from '@/components/chat/Chatting';
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
  } = useContext(SocketContext);

  if (!roomId) {
    console.error('Room ID is undefined');
    return null;
  }

  const [isRoomFull, setIsRoomFull] = useState(false);

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
    // TODO: 임시 채팅 구독

    leaveRoom('testUser12');
    disconnect();
    navigate(-1);
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

      {/* TODO: 임시 테스트 채팅방 */}
      <Chatting />
    </div>
  );
}
