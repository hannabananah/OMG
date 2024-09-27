import { useContext, useEffect, useState } from 'react';
import { FaCrown } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';

import Chatting from '@/components/chat/Chatting';
import useUser from '@/stores/useUser';
import { SocketContext } from '@/utils/SocketContext';

export default function Waiting() {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const {
    socket,
    online,
    player,
    roomSubscription,
    disconnect,
    leaveRoom,
    chatSubscription,
    hostPlayer,
    startGame,
  } = useContext(SocketContext);
  const { nickname } = useUser();

  if (!roomId) {
    console.error('Room ID is undefined');
    return null;
  }
  const [isRoomFull, setIsRoomFull] = useState(false);

  useEffect(() => {
    if (online && socket) {
      roomSubscription();
      // TODO: 임시 채팅 구독
      chatSubscription();
    }
  }, [online, socket]);

  useEffect(() => {
    setIsRoomFull(player.length >= 4);
  }, [socket, player]);

  const handleClick = () => {
    if (isRoomFull) {
      startGame();
    }
  };

  const handleExit = () => {
    leaveRoom();
    disconnect();
    navigate(-1);
  };

  return (
    <div className='relative flex flex-col items-center justify-center w-full h-screen p-10 bg-lime-100'>
      <button className='absolute right-1 bottom-1' onClick={handleExit}>
        <p>대기방 나가기</p>
      </button>
      <h2 className='text-lime-700'>대기 중인 플레이어 수: {player.length}</h2>
      <ul>
        {player.map((currentPlayer, index) => (
          <li key={index} className='flex items-center text-lime-500'>
            {currentPlayer}
            {currentPlayer === hostPlayer && (
              <FaCrown className='ml-2 text-yellow-500' />
            )}
          </li>
        ))}
      </ul>

      {hostPlayer === nickname && (
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
