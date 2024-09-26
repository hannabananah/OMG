import { useContext, useEffect } from 'react';

import { useSocketMessage } from '@/stores/useSocketMessage';
import useUser from '@/stores/useUser';
import { SocketContext } from '@/utils/SocketContext';
import { useProgress } from '@react-three/drei';

export default function Loading(): JSX.Element | null {
  const { socket, online, rendered_complete } = useContext(SocketContext);
  const { nickname } = useUser();
  const { active } = useProgress();
  const { roomMessage } = useSocketMessage();

  console.log('룸메세지', roomMessage);

  useEffect(() => {
    if (!active && socket && online && roomMessage.sender !== nickname) {
      rendered_complete();
    }
  }, [active]);

  return null;
}
