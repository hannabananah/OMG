import { Fragment } from 'react/jsx-runtime';

interface RoundEndProps {
  message: string;
}

export default function RoundEndAlert({ message }: RoundEndProps) {
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
    <div className='relative w-full h-full bg-white bg-opacity-80'>
      {/* 돈 애니메이션 */}
      <div className='absolute top-0 left-0 w-full h-full money-pattern'></div>

      <div className='absolute text-center -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 text-omg-50b font-omg-event-title'>
        <p className='animate-subtle-pulse whitespace-nowrap'>
          {formattedMessage}
        </p>
      </div>
    </div>
  );
}

// message 예시
// 2라운드가 종료되었습니다! 대출상품에 대한 이자가 추가됩니다!
