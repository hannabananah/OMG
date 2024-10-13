import { useEffect, useState } from 'react';

import { RoundProps } from '@/components/common/Round';
import { formatTime } from '@/utils/formatTime';

export default function Timer({
  time,
  presentRound,
}: { time: number } & RoundProps) {
  const [remainingTime, setRemainingTime] = useState(time);

  useEffect(() => {
    if (!time) return;
    setRemainingTime(time);
  }, [time]);

  const isOddRound = presentRound % 2 !== 0;

  return (
    <p
      className={`text-omg-50b drop-shadow-xl fade-in ${remainingTime <= 5 ? 'text-red animate-shake' : isOddRound ? 'text-black' : 'text-white'}`}
    >
      {formatTime(remainingTime)}
    </p>
  );
}
