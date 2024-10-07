import { useEffect, useState } from 'react';

import { formatTime } from '@/utils/formatTime';

export default function Timer({ time }: { time: number }) {
  const [remainingTime, setRemainingTime] = useState(time);

  useEffect(() => {
    if (!time) return;
    setRemainingTime(time);
  }, [time]);

  return (
    <p
      className={`text-omg-40b drop-shadow-xl ${remainingTime <= 5 ? 'text-red animate-shake' : 'text-black'}`}
    >
      {formatTime(remainingTime)}
    </p>
  );
}
