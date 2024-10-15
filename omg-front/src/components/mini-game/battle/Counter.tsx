// 모달로 들어갈 미니게임 배틀 클릭 수 대결!(각 캐릭터가 얼마나 많이 앞으로 가는지)
import { useEffect, useRef, useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  // const [opponentCount, setOpponentCount] = useState(50);
  const maxClicks = 100;

  const inc = () => setCount(count => Math.min(count + 1, maxClicks));

  const id = useRef<number | null>(null);
  const clear = () => window.clearInterval(id.current!);

  useEffect(() => {
    id.current = window.setInterval(() => setTimeLeft(time => time - 1), 1000);
    return clear;
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      clear();
    }
  }, [timeLeft]);

  const myProgress = (count / maxClicks) * 100;
  // const opponentProgress = (opponentCount / maxClicks) * 100;

  return (
    <div className='flex flex-col items-center justify-center w-full h-screen'>
      <h1 className='font-omg-title text-omg-50b'>My Count: {count}</h1>
      <p className='font-omg-body text-omg-30'>Time left: {timeLeft}</p>

      {timeLeft !== 0 ? (
        <button
          className='w-40 h-40 bg-sky-200 text-omg-30'
          onClick={inc}
          aria-label='개수 클릭 버튼'
        >
          +
        </button>
      ) : (
        <button
          className='w-40 h-40 bg-slate-200'
          disabled
          aria-label='개수 클릭 비활성화 버튼'
        ></button>
      )}

      {/* 내 progress bar */}
      <div className='relative w-full h-10 max-w-xl mt-10'>
        <div className='absolute left-0 w-full h-1 bg-gray-300 top-1/2'></div>
        <div
          className='absolute w-10 h-10 transition-transform duration-300 ease-out transform -translate-y-1/2 rounded-full top-1/2 bg-skyblue'
          style={{ left: `${myProgress}%` }}
        ></div>
      </div>

      <p className='mt-4 font-omg-body text-omg-30'>상대방</p>

      {/* 상대방 progress bar */}
      <div className='relative w-full h-10 max-w-xl mt-5'>
        <div className='absolute left-0 w-full h-1 bg-gray-300 top-1/2'></div>
        <div
          className='absolute w-10 h-10 transition-transform duration-300 ease-out transform -translate-y-1/2 bg-red-500 rounded-full top-1/2'
          // style={{ left: `${opponentProgress}%` }}
        ></div>
      </div>
    </div>
  );
}
