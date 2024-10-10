interface LeftTimeProps {
  message: string;
}

export default function LeftTimeAlert({ message }: LeftTimeProps) {
  // message에 따라 background 색상을 동적으로 설정
  const backgroundColorClass = message.includes('30')
    ? 'bg-blue'
    : message.includes('10')
      ? 'bg-red'
      : 'bg-blue';

  return (
    <div
      className={`absolute w-[40%] -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 p-4 pb-6 text-center ${backgroundColorClass} rounded-20 drop-shadow-xl text-omg-40b text-white font-omg-event-title`}
    >
      <p className='blink-animation'>{message}</p>
    </div>
  );
}

// message 예시
// 30 초 남았습니다!
