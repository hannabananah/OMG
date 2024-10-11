import { Html, useProgress } from '@react-three/drei';

export default function CanvasLoader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div
        className='flex flex-col items-center justify-center w-screen h-screen text-omg-30b'
        style={{ backgroundImage: 'url("/assets/game-bg.png")' }}
      >
        <div className='w-48'>
          <img src='/assets/logo.png' className='w-full' alt='로고 이미지' />
        </div>
        <p className='text-center text-white font-omg-event-title'>
          크리스마스 마을로 이동 중...
        </p>
        <span className='font-omg-body text-omg-24'>
          {progress.toFixed(0)}%
        </span>
        <img
          src='/assets/slough.png'
          className='w-1/4 mt-4'
          alt='썰매 이미지'
        />
      </div>
    </Html>
  );
}
