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
  const [randomImage, setRandomImage] = useState('');

  useEffect(() => {
    if (!eventCardMessage.title) return;
    if (randomImage) {
      setRandomImage('');
    }
    setEventCardTitle(eventCardMessage.title);
    setEventCardContent(eventCardMessage.content);

    const randomNum = Math.floor(Math.random() * 3) + 1;
    setRandomImage(`/assets/event-card${randomNum}.jpg`);
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
      className='relative bg-cover bg-center flex items-center justify-center w-[420px] h-[520px]'
      ref={domTarget}
    >
      <animated.div
        className='relative w-[420px] h-[520px] rounded-md bg-white-trans90 rounded-20 overflow-hidden bg-center bg-cover text-white'
        style={{
          transform: 'perspective(600px)',
          x,
          y,
          scale,
          rotateX,
          rotateY,
        }}
      >
        <img
          src={randomImage}
          className='w-full h-full'
          alt='event background'
        />

        <div className='absolute top-0 flex flex-col items-center justify-start w-full h-full px-5'>
          <p className='w-full mt-5 mb-3 text-center underline font-omg-body text-omg-18 break-keep'>
            *해당 뉴스는 다음 라운드의 금리 변동에 영향을 줍니다.
          </p>
          <div className='flex flex-col justify-center mt-20'>
            <h2 className='text-center text-omg-30b font-omg-event-title break-keep text-balance'>
              {eventCardTitle}
            </h2>
            <p className='mt-20 text-center break-keep font-omg-event-body text-omg-24 text-balance'>
              {eventCardContent}
            </p>
          </div>
        </div>
      </animated.div>
    </div>
  );
}
