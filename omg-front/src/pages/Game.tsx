import { useContext, useEffect } from 'react';

import MainMap from '@/pages/MainMap';
import { SocketContext } from '@/utils/SocketContext';

export default function Game() {
  const { rendered_complete } = useContext(SocketContext);

  useEffect(() => {
    rendered_complete();
  }, []);

  return (
    <div>
      <MainMap />
    </div>
  );
}
