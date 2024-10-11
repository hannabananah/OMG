import { Suspense, lazy } from 'react';

import { GameLoader } from '@/components/game';

const MainMap = lazy(() => import('@/components/main-map/MainMap'));

export default function Game() {
  return (
    <Suspense fallback={<GameLoader />}>
      <MainMap />
    </Suspense>
  );
}
