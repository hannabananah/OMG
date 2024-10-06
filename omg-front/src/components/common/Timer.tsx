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
      className={`text-omg-40b ${remainingTime <= 5 ? 'text-red animate-shake' : 'text-white'}`}
    >
      {formatTime(remainingTime)}
    </p>
  );
}
