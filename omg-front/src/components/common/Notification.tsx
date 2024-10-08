// Notification.js
import { useEffect, useMemo, useState } from 'react';
import { FaInfoCircle } from 'react-icons/fa';

import { useOtherUserStore } from '@/stores/useOtherUserState';
import { animated, useTransition } from '@react-spring/web';

interface Item {
  key: number;
  msg: string;
}

interface NotificationProps {
  onNewNotification: () => void;
}

export default function Notification({ onNewNotification }: NotificationProps) {
  const refMap = useMemo(() => new WeakMap(), []);
  const cancelMap = useMemo(() => new WeakMap(), []);
  const [items, setItems] = useState<Item[]>([]);
  const { transactionMessage } = useOtherUserStore();

  const timeout = 3000;
  const transitions = useTransition(items, {
    from: { opacity: 0, transform: 'translateX(100%)', height: 0 },
    keys: item => item.key,
    enter: item => async (next, cancel) => {
      cancelMap.set(item, cancel);
      await next({
        opacity: 1,
        height: refMap.get(item).offsetHeight,
        transform: 'translateX(0)',
      });
    },
    leave: { opacity: 0, transform: 'translateX(100%)', height: 0 },
  });

  let lastKey = Date.now();

  useEffect(() => {
    if (transactionMessage) {
      const newItem = { key: (lastKey += 1), msg: transactionMessage };
      setItems(prevItems => [...prevItems, newItem]);
      onNewNotification();

      const timeoutId = setTimeout(() => {
        setItems(prevItems =>
          prevItems.filter(item => item.key !== newItem.key),
        );
      }, timeout);

      return () => clearTimeout(timeoutId);
    }
  }, [transactionMessage]);

  return (
    <div className='fixed z-50 space-y-2 top-48 right-5'>
      {transitions((style, item) => (
        <animated.div
          key={item.key}
          ref={ref => refMap.set(item, ref)}
          style={style}
          className='flex items-center px-4 py-6 drop-shadow-lg rounded-10 text-gray bg-white1'
        >
          <FaInfoCircle className='mr-2' size={20} />
          {item.msg}
        </animated.div>
      ))}
    </div>
  );
}
