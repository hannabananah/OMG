import { useContext, useEffect } from 'react';

import { SocketContext } from '@/utils/SocketContext';

import MainMap from '../components/game/MainMap';

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
