import { Suspense, lazy } from 'react';

import Loading from '@/components/common/Loading';

const MainMap = lazy(() => import('@/pages/MainMap'));

export default function Game() {
  return (
    <Suspense fallback={<Loading />}>
      <MainMap />
    </Suspense>
  );
}
