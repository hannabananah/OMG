import { useEffect, useState } from 'react';

export default function Timer({ time }: { time: number }) {
  const [remainingTime, setRemainingTime] = useState(time);

  useEffect(() => {
    if (!time) return;
    setRemainingTime(time);
  }, [time]);

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return <p className='text-white text-omg-40b'>{formatTime(remainingTime)}</p>;
}
