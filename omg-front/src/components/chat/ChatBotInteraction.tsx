import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useSoundStore, useUser } from '@/stores';

import { requestChatBot } from '../../apis/room/roomAPI';

export default function ChatBotInteraction() {
  const { roomId } = useParams<{ roomId: string }>();
  const { nickname } = useUser();
  const { playGetChatAlertSound, playTypingSound } = useSoundStore();

  const [requestMessage, setRequestMessage] = useState<string>('');
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const chatBotRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
    setIsOpen(true);
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
      const response = await requestChatBot(roomId, nickname, requestMessage);

      if (response && response.result) {
        setResponseMessage(response.result);
        setRequestMessage('');

        if (nickname) {
          playGetChatAlertSound();
        }
      }
    } catch (error) {
      setResponseMessage(
        '이 뤼치뤼치가 시장 상황을 봤을 때에는 호황기는 아닐 듯하군. 이럴 때에는 안전자산인 금을 사놓는 게 좋을 거야~ 금 가격이 오르기 전에 얼른 가서 매입하라구~!',
      );
      setRequestMessage('');
      console.error('챗봇 요청 실패:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRequestMessage(e.target.value);
    if (nickname) {
      playTypingSound();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleChatBotMessage();
    }
  };

  const buttonClass = requestMessage.trim() !== '' ? 'bg-gray' : 'bg-lightgray';

  return (
    <div
      ref={chatBotRef}
      className={`absolute right-0 p-6 bottom-56 w-[540px] max-h-[300px] overflow-hidden bg-white rounded-20 bg-opacity-80 
        ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'} 
        transition-all duration-500 ease-in-out`}
    >
      <div className='flex items-center justify-center w-full gap-4'>
        <input
          ref={inputRef}
          type='text'
          placeholder='뤼치돌프에게 투자 조언을 구해보세요!'
          value={requestMessage}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className='w-full px-4 py-2 text-black rounded-10 text-omg-24'
        />
        <button
          onClick={handleChatBotMessage}
          className={`w-[20%] p-2 text-white rounded-10 text-omg-24 ${buttonClass}`}
          disabled={requestMessage.trim() === ''}
        >
          전송
        </button>
      </div>

      {responseMessage && (
        <div className='flex flex-col gap-4 p-2 mt-2 overflow-y-auto max-h-[200px] text-black border text-omg-20'>
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
}
