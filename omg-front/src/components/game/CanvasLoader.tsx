import { Html, useProgress } from '@react-three/drei';

export default function CanvasLoader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className='relative flex flex-col items-center justify-center w-screen h-screen'>
        <img
          src={'/assets/game-bg.png'}
          alt='맵으로 이동 중 로딩 배경'
          className='absolute z-0 w-full h-screen'
        />
        <div className='z-10 w-48'>
          <img src='/assets/logo.png' className='w-full' alt='로고 이미지' />
        </div>

        <p className='z-10 text-center text-white text-omg-30b font-omg-event-title'>
          크리스마스 마을로 이동 중...
        </p>

        <span className='z-10 text-white font-omg-body text-omg-24'>
          {progress.toFixed(0)}%
        </span>

        <img
          src='/assets/slough.png'
          className='z-10 w-1/4 mt-4'
          alt='썰매 이미지'
        />
      </div>
    </Html>
  );
}
