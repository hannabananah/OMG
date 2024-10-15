import { useEffect, useState } from 'react';

import { useSocketMessage } from '@/stores';

export default function EventEffect() {
  const { eventEffectMessage } = useSocketMessage();
  const [eventCardValue, setEventCardValue] = useState(0);
  const [isPositive, setIsPositive] = useState(false);
  const [isBlinking, setIsBlinking] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!eventEffectMessage.value) return;

    setEventCardValue(eventEffectMessage.value);
    setIsPositive(eventEffectMessage.value >= 0);

    setIsBlinking(true);
    const timeout = setTimeout(() => {
      setIsBlinking(false);
      setIsExiting(true);
    }, 4000);

    return () => clearTimeout(timeout);
  }, [eventEffectMessage]);

  return (
    <div className='relative flex items-center justify-center w-full h-full text-center text-omg-30b font-omg-event-title'>
      <div className='absolute z-30 w-full h-screen bg-white bg-opacity-90'></div>
      <div className='relative z-40'>
        <p
          className={`${isExiting ? (isPositive ? 'rocket-exit' : 'shake-exit') : ''}`}
        >
          이전 라운드 뉴스의 영향으로
          <br />
          금리가
          <span
            className={`${isPositive ? 'text-red' : 'text-blue'} ${isBlinking && 'blink-animation'}`}
          >
            &nbsp;{eventCardValue}%&nbsp;
          </span>
          {isPositive ? '상승' : '하락'}했습니다.
        </p>
      </div>
    </div>
  );
}
