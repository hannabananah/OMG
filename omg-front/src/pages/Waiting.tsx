import { useCallback, useContext, useEffect } from 'react';
import { FaCrown } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';

import useUser from '@/stores/useUser';
import { SocketContext } from '@/utils/SocketContext';
import { ToastAlert } from '@/utils/ToastAlert';

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
    hostPlayer,
    startGame,
  } = useContext(SocketContext);
  const { nickname } = useUser();

  if (!roomId) {
    console.error('Room ID is undefined');
    return null;
  }

  const isRoomFull = player.length >= 4;

  useEffect(() => {
    if (online && socket) {
      roomSubscription();
    }
  }, [online, socket]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard
      .writeText(roomId)
      .then(() => {
        ToastAlert('해당 방 ID가 복사되었습니다.');
      })
      .catch(err => {
        console.error('복사 중 오류 발생:', err);
      });
  }, [roomId]);

  const handleGameStart = () => {
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
    <div className='relative flex flex-col items-center justify-center w-full h-screen p-10 text-white font-omg-body'>
      <img
        src={'/assets/game-bg.png'}
        alt='대기방 배경'
        className='absolute w-full h-screen'
      />
      <span className='absolute right-4 top-4 text-omg-11'>
        방 ID:
        <button className='select-text' onClick={copyToClipboard}>
          {roomId}
        </button>
      </span>
      <button className='absolute right-4 bottom-4' onClick={handleExit}>
        <p>대기방 나가기</p>
      </button>
      <div className='flex flex-col justify-between w-2/3 text-center h-2/3'>
        <div className='flex flex-col justify-between gap-10'>
          <h2 className='relative tracking-wider text-omg-40b'>
            대기방 ({player.length}/4)
          </h2>
          <ul className='flex flex-col mx-auto h-52 text-omg-24'>
            {player.map((currentPlayer, index) => (
              <li key={index} className='relative flex items-center'>
                {currentPlayer}
                {currentPlayer === hostPlayer && (
                  <FaCrown className='mb-1 ml-2 text-yellow-500' />
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className='relative'>
          {hostPlayer === nickname ? (
            <button
              onClick={handleGameStart}
              disabled={!isRoomFull}
              className={
                isRoomFull
                  ? 'transition-all duration-1000 animate-shake hover:bg-gradient-animation hover:scale-90'
                  : ''
              }
            >
              {isRoomFull ? (
                <span className='text-omg-100b'>GAME START</span>
              ) : (
                <p className='text-white text-omg-30b'>
                  {4 - player.length}명의 플레이어를 기다리고 있습니다.
                </p>
              )}
            </button>
          ) : (
            <p className='text-omg-30b'>
              {isRoomFull
                ? '방장의 게임 시작을 기다리는 중입니다.'
                : `${4 - player.length}명의 플레이어를 기다리고 있습니다.`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
