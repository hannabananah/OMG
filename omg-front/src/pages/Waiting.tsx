import { useContext, useEffect, useState } from 'react';
import { FaCrown } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';

import Chatting from '@/components/chat/Chatting';
import { useUserStore } from '@/stores/user';
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
    hostPlayer,
  } = useContext(SocketContext);
  const { name } = useUserStore();

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
    leaveRoom(name);
    disconnect();
    navigate(-1);
  };

  console.log('hostPlayer', hostPlayer);
  console.log('name', name);

  return (
    <div className='relative flex flex-col items-center justify-center w-full h-screen p-10 bg-lime-100'>
      <button className='absolute right-1 bottom-1' onClick={handleExit}>
        <p>대기방 나가기</p>
      </button>
      <h2 className='text-lime-700'>대기 중인 플레이어 수: {players.length}</h2>
      <ul>
        {players.map((player, index) => (
          <li key={index} className='flex items-center text-lime-500'>
            {player}
            {player === hostPlayer && (
              <FaCrown className='ml-2 text-yellow-500' />
            )}
          </li>
        ))}
      </ul>

      {hostPlayer === name && (
        <button onClick={handleClick} disabled={!isRoomFull}>
          {isRoomFull ? (
            <span>START</span>
          ) : (
            <span className='opacity-50'>WAIT</span>
          )}
        </button>
      )}
      {/* TODO: 임시 테스트 채팅방 */}
      <Chatting />
    </div>
  );
}
