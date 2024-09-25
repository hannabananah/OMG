import { useContext, useEffect } from 'react';

import MainMap from '@/pages/MainMap';
import { SocketContext } from '@/utils/SocketContext';

export default function Game() {
  const { socket, online, rendered_complete } = useContext(SocketContext);

  useEffect(() => {
    if (socket && online) {
      rendered_complete();
    }
  }, [socket, online]);

  return (
    <div>
      <MainMap />
    </div>
  );
}
