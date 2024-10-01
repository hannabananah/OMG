import { useEffect, useRef, useState } from 'react';
import { useGesture } from 'react-use-gesture';

import { useSocketMessage } from '@/stores/useSocketMessage';
import { animated, useSpring } from '@react-spring/web';

const calcX = (y: number, ly: number) =>
  -(y - ly - window.innerHeight / 2) / 20;
const calcY = (x: number, lx: number) => (x - lx - window.innerWidth / 2) / 20;
export default function EventCard() {
  const { eventCardMessage } = useSocketMessage();
  const [eventCardTitle, setEventCardTitle] = useState('');
  const [eventCardContent, setEventCardContent] = useState('');
  const [eventCardValue, setEventCardValue] = useState(0);
  const [isPositive, setIsPositive] = useState(false);

  useEffect(() => {
    if (!eventCardMessage.title) return;

    setEventCardTitle(eventCardMessage.title);
    setEventCardContent(eventCardMessage.content);
    setEventCardValue(eventCardMessage.value);
    setIsPositive(eventCardMessage.value >= 0);
  }, [eventCardMessage]);

  const domTarget = useRef<HTMLDivElement | null>(null);
  const [{ x, y, rotateX, rotateY, scale }, api] = useSpring(() => ({
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    x: 0,
    y: 0,
    config: { mass: 20, tension: 100, friction: 80 },
  }));

  useGesture(
    {
      onMove: ({ offset: [px, py] }) => {
        if (domTarget.current) {
          api.start({
            rotateX: calcX(py, y.get()),
            rotateY: calcY(px, x.get()),
            scale: 1.1,
          });
        }
      },
      onMoveEnd: () => {
        if (domTarget.current) {
          api.start({
            rotateX: 0,
            rotateY: 0,
            scale: 1.0,
          });
        }
      },
    },
    { domTarget },
  );
  return (
    <div
      className='flex items-center justify-center w-[360px] h-[500px]'
      ref={domTarget}
    >
      <animated.div
        className='relative w-[360px] h-[500px] rounded-md bg-white-trans90 p-10 rounded-20'
        style={{
          transform: 'perspective(600px)',
          x,
          y,
          scale,
          rotateX,
          rotateY,
        }}
      >
        <div className='flex flex-col items-center h-full justify-evenly'>
          <h2 className='basis-1/6 text-omg-30b font-omg-title'>
            {eventCardTitle}
          </h2>
          <span
            className={`${isPositive ? 'text-red' : 'text-blue'} text-omg-18`}
          >
            {isPositive ? '금리 상승' : '금리 하락'} {eventCardValue}%
          </span>
          <p className='font-omg-body text-omg-20'>{eventCardContent}</p>
        </div>
      </animated.div>
    </div>
  );
}
