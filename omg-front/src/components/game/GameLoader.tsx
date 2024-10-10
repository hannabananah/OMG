import { useContext, useEffect } from 'react';

import { SocketContext } from '@/utils/SocketContext';
import { useProgress } from '@react-three/drei';

export default function GameLoader(): JSX.Element | null {
  const { rendered_complete } = useContext(SocketContext);
  const { active } = useProgress();

  useEffect(() => {
    if (!active) {
      rendered_complete();
    }
  }, [active]);

  return null;
}
