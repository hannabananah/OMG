import { Suspense, lazy, useEffect } from 'react';

import Loading from '@/components/common/Loading';

const MainMap = lazy(() => import('@/components/main-map/MainMap'));

export default function Game() {
  useEffect(() => {
    const bgm = new Audio('/music/background.mp3');
    bgm.autoplay = true;
    bgm.loop = true;
    bgm.play();

    return () => {
      bgm.pause();
      bgm.currentTime = 0;
    };
  }, []);

  return (
    <Suspense fallback={<Loading />}>
      <MainMap />
    </Suspense>
  );
}
