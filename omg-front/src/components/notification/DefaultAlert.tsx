import { Fragment } from 'react/jsx-runtime';

interface DefaultAlertProps {
  message: string;
}

export default function DefaultAlert({ message }: DefaultAlertProps) {
  const formattedMessage = message.includes('!')
    ? message.split('!').map((part, index) => (
        <Fragment key={index}>
          {part}
          {index === 0 && '!'}
          {index === 0 && <br />} {/* 첫 번째 문장 뒤에 줄바꿈 적용 */}
        </Fragment>
      ))
    : message;

  return (
    <div className='absolute w-[55%] -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 p-4 pb-6 text-center bg-white rounded-20 bg-opacity-70 drop-shadow-xl text-omg-40b font-omg-event-title'>
      <p className='bounce-animation'>{formattedMessage}</p>
    </div>
  );
}

// message 예시
// 1라운드가 시작됩니다!
// 곧 4 라운드가 시작됩니다...
// 게임이 종료되었습니다! 결과를 합산중입니다...
