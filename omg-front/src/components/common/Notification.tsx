import { useEffect, useMemo, useState } from 'react';

import MiniElf from '@/assets/img/mini-elf.svg?react';
import MiniGingerbread from '@/assets/img/mini-gingerbread.svg?react';
import MiniSanta from '@/assets/img/mini-santa.svg?react';
import MiniSnowman from '@/assets/img/mini-snowman.svg?react';
import { useOtherUserStore } from '@/stores/useOtherUserState';
import { animated, useTransition } from '@react-spring/web';

interface Item {
  key: number;
  msg: string;
  userNickname: string;
  characterType: number | undefined;
}

interface NotificationProps {
  onNewNotification: () => void;
}

export default function Notification({ onNewNotification }: NotificationProps) {
  const refMap = useMemo(() => new WeakMap(), []);
  const cancelMap = useMemo(() => new WeakMap(), []);
  const [items, setItems] = useState<Item[]>([]);
  const { otherUsers, transactionMessage } = useOtherUserStore();

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
      const user = otherUsers.find(
        user => user.id === transactionMessage.userNickname,
      );
      const characterType = user ? user.characterType : undefined;
      const newItem = {
        key: (lastKey += 1),
        msg: transactionMessage.message,
        userNickname: transactionMessage.userNickname,
        characterType,
      };

      setItems(prevItems => [...prevItems, newItem]);
      onNewNotification();

      const timeoutId = setTimeout(() => {
        setItems(prevItems =>
          prevItems.filter(item => item.key !== newItem.key),
        );
      }, 5000);

      return () => clearTimeout(timeoutId);
    }
  }, [transactionMessage]);

  const renderMiniCharacterImage = (characterType: number | undefined) => {
    const imageClasses = 'w-12 h-12 drop-shadow-md bounce-animation';

    switch (characterType) {
      case 0:
        return <MiniSanta className={imageClasses} />;
      case 1:
        return <MiniElf className={imageClasses} />;
      case 2:
        return <MiniSnowman className={imageClasses} />;
      case 3:
        return <MiniGingerbread className={imageClasses} />;
      default:
        return null;
    }
  };

  return (
    <div className='fixed z-30 space-y-2 top-60 right-3'>
      {transitions((style, item) => (
        <animated.div
          key={item.key}
          ref={ref => refMap.set(item, ref)}
          style={style}
          className='flex items-center gap-2 px-4 py-8 shadow-inner rounded-10 font-omg-event-content text-omg-24 drop-shadow-lg bg-white1'
        >
          <span className='mb-2'>
            {renderMiniCharacterImage(item.characterType)}
          </span>
          <div className='test_obj'>
            {item.msg.split('').map((char, index) => (
              <span
                key={index}
                className='relative animate-textup'
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {char}
              </span>
            ))}
          </div>
        </animated.div>
      ))}
    </div>
  );
}
