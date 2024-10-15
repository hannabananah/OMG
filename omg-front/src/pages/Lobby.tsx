import { useCallback, useEffect, useRef, useState } from 'react';
import { FaCopy } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import { ExitButton } from '@/components/common';
import { useCreateWaitingRoom, useHasWaitingRoom } from '@/hooks';
import { useUser } from '@/stores';
import { ToastAlert } from '@/utils';

export default function Lobby() {
  const { nickname, setNickname } = useUser();
  const [roomCode, setRoomCode] = useState<string>('');
  const navigate = useNavigate();
  const [isCopyEnabled, setIsCopyEnabled] = useState(false);
  const roomCodeInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const uniqueId = Math.floor(Math.random() * 9000) + 1000;
    const uniqueNickname = `user${uniqueId}`;
    setNickname(uniqueNickname);
  }, [setNickname]);

  const createRoomMutation = useCreateWaitingRoom();
  const hasRoomMutation = useHasWaitingRoom();

  const handleClickCreateRoom = () => {
    createRoomMutation.mutate(nickname);
  };

  useEffect(() => {
    if (createRoomMutation.isSuccess && createRoomMutation.data) {
      setRoomCode(createRoomMutation.data.result || '');
    }
  }, [createRoomMutation]);

  const handleCopyToClipboard = useCallback(() => {
    if (roomCode.length === 10) {
      navigator.clipboard
        .writeText(roomCode)
        .then(() => ToastAlert('방 코드가 복사되었습니다!'))
        .catch(err => console.error('복사에 실패했습니다.: ', err));
    }
  }, [roomCode]);

  const handleRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomCode(e.target.value);
  };

  useEffect(() => {
    setIsCopyEnabled(roomCode.length === 10);
  }, [roomCode]);

  const handleClickEnterRoom = async () => {
    if (!roomCode.trim()) {
      ToastAlert('코드를 입력해주세요.');
      return;
    }

    try {
      const res = await hasRoomMutation.mutateAsync(roomCode);
      if (res && res.result) {
        navigate(`/waiting/${roomCode}`);
      } else {
        ToastAlert('존재하지 않는 대기방입니다.');
      }
    } catch (error) {
      console.error('대기방 확인 중 오류 발생:', error);
      ToastAlert('대기방 확인 중 오류가 발생했습니다.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleClickEnterRoom();
    }
  };

  useEffect(() => {
    roomCodeInputRef.current?.focus();
  }, []);

  return (
    <div
      className='relative flex flex-col justify-center w-full h-screen p-10'
      style={{
        backgroundImage: 'url("/assets/matrix2.gif")',
      }}
    >
      <div className='absolute right-8 bottom-9 text-omg-30'>
        <ExitButton showText={true} />
      </div>

      <div className='flex flex-col items-center justify-center w-full h-full'>
        <div className='flex flex-col gap-5'>
          <div>
            <button
              onClick={handleClickCreateRoom}
              className='w-full p-2 text-white text-omg-40b'
              disabled={createRoomMutation.isPending}
              aria-label='방 생성 버튼'
            >
              {createRoomMutation.isPending ? '방 생성중...' : '방 생성하기'}
            </button>
            {createRoomMutation.isError && (
              <p className='text-center text-red text-omg-14'>
                {createRoomMutation.error.message}
              </p>
            )}
          </div>
          <div className='flex items-center justify-center w-full gap-5'>
            <div className='relative'>
              <input
                type='text'
                minLength={10}
                placeholder='코드 입력하기'
                value={roomCode}
                onChange={handleRoomCodeChange}
                onKeyDown={handleKeyPress}
                ref={roomCodeInputRef}
                className='w-full py-2 pl-10 pr-20 border-4 border-black rounded-40 text-omg-24'
              />
              <button
                className='absolute -translate-y-1/2 right-10 top-1/2'
                onClick={handleCopyToClipboard}
                disabled={!isCopyEnabled}
                aria-label='코드 복사 버튼'
              >
                <FaCopy
                  className={`text-omg-24 ${isCopyEnabled ? 'text-black' : 'text-white3'}`}
                />
              </button>
            </div>

            <button
              className='w-1/4 text-white text-omg-40b'
              onClick={handleClickEnterRoom}
              aria-label='대기방 입장 버튼'
            >
              입장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
