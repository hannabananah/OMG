import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import useUser from '@/stores/useUser';

import { requestChatBot } from '../../apis/room/roomAPI';

const ChatBotInteraction = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { nickname } = useUser();

  const [requestMessage, setRequestMessage] = useState<string>(''); // 사용자 요청 메시지
  const [responseMessage, setResponseMessage] = useState<string | null>(null); // API 응답 메시지

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChatBotMessage = async () => {
    if (requestMessage.trim() === '') {
      setResponseMessage(
        `안녕! 투자 조언을 얻으려고 나를 찾아왔구나? 질문을 입력해야 분석해 줄 수 있어!`,
      );
      return;
    } else {
      setResponseMessage('잠시만 기다려줘. 시장을 분석 해볼게!');
    }
    try {
      const response = await requestChatBot(nickname, roomId, requestMessage);
      if (response) {
        setResponseMessage(response);
        setRequestMessage('');
      }
    } catch (error) {
      setResponseMessage(
        '시장이 과열되어 서버가 다운 되어 버렸어! 나중에 다시 질문하러 와줘.',
      );
      console.error('챗봇 요청 실패:', error);
    }
  };

  return (
    <div className='absolute right-0 p-10 overflow-y-auto bottom-56 w-[540px] max-h-[300px] bg-white rounded-20 bg-opacity-80'>
      {/* 채팅 입력 받기 */}
      <div className='flex items-center justify-center w-full gap-4'>
        <input
          ref={inputRef}
          type='text'
          placeholder='루돌프에게 투자 조언을 구해보세요!'
          value={requestMessage}
          onChange={e => setRequestMessage(e.target.value)}
          className='w-full px-4 py-2 text-black rounded-10 text-omg-24'
        />
        <button
          onClick={handleChatBotMessage}
          className='w-[20%] p-2 text-white bg-gray rounded-10 text-omg-24'
        >
          전송
        </button>
      </div>

      {/* 응답 메시지 표시 */}
      {responseMessage && (
        <div className='flex flex-col gap-4 p-2 mt-6 text-black border text-omg-20'>
          <div className='flex items-center gap-2'>
            <img
              src='/assets/rudolph.png'
              alt='rudolph'
              className='w-10 h-10'
            />
            <p>[투자 전문가 뤼치돌프씨]</p>
          </div>
          <p>{responseMessage}</p>
        </div>
      )}
    </div>
  );
};

export default ChatBotInteraction;