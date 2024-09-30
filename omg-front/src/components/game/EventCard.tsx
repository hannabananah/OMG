import { useRef } from 'react';
import { useGesture } from 'react-use-gesture';

import { animated, useSpring } from '@react-spring/web';

const calcX = (y: number, ly: number) =>
  -(y - ly - window.innerHeight / 2) / 20;
const calcY = (x: number, lx: number) => (x - lx - window.innerWidth / 2) / 20;
export default function EventCard() {
  const domTarget = useRef(null);
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
            대공황 발생!
          </h2>
          <span className='text-blue text-omg-18'>금리 하락 4%</span>
          <p className='font-omg-body text-omg-20'>
            월스트리트 대폭락으로 시작되어, 미국을 중심으로 세계적으로 경제
            침체가 발생했습니다. 이로 인해 실업률 급증과 빈곤이 확산되었으며,
            금융 시스템 붕괴와 물가 하락으로 인한 어려움이 지속됐습니다.
          </p>
        </div>
      </animated.div>
    </div>
  );
}
