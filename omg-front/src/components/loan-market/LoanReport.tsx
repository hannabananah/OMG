import { useState } from 'react';
import { useDrag } from 'react-use-gesture';

import { useLoanStore } from '@/stores/useLoanStore';
import { formatTime } from '@/utils/formatTime';
import { animated, useSprings } from '@react-spring/web';

const to = (i: number) => ({
  x: 0,
  y: i * 4,
  scale: 1,
  rot: -10 + Math.random() * 20,
});

const from = (_i: number) => ({ x: 0, rot: 0, scale: 1.5, y: 1000 });

function Deck() {
  const { loanProducts } = useLoanStore();
  const [gone] = useState(() => new Set<number>());

  const reversedLoanProducts = [...loanProducts].reverse();
  const [props, api] = useSprings(reversedLoanProducts.length, i => ({
    ...to(i),
    from: from(i),
  }));

  const bind = useDrag(
    ({ args: [index], down, movement: [mx], direction: [xDir], velocity }) => {
      const trigger = velocity > 0.2;
      const dir = xDir < 0 ? -1 : 1;
      if (!down && trigger) gone.add(index);
      api.start(i => {
        if (index !== i) return;

        const isGone = gone.has(index);
        const x = isGone ? (200 + window.innerWidth) * dir : down ? mx : 0;
        const rot = mx / 100 + (isGone ? dir * 10 * velocity : 0);
        const scale = down ? 1.1 : 1;
        return {
          x,
          rot,
          scale,
          delay: undefined,
          config: { friction: 50, tension: down ? 800 : isGone ? 200 : 500 },
        };
      });

      if (!down && gone.size === reversedLoanProducts.length) {
        setTimeout(() => {
          gone.clear();
          api.start(i => to(i));
        }, 600);
      }
    },
  );

  if (loanProducts.length === 0) {
    return (
      <div className='flex items-center justify-center h-5/6'>
        <h2 className='text-omg-20'>대출한 상품이 없습니다.</h2>
      </div>
    );
  }

  return (
    <>
      {props.map(({ x, y, rot, scale }, i) => {
        const product = reversedLoanProducts[i];
        const index = loanProducts.length - i;
        return (
          <animated.div
            className='absolute w-[460px] h-[300px] will-change-transform flex items-center justify-center touch-none'
            key={i}
            style={{ x, y, rotate: rot, scale }}
            {...bind(i)}
          >
            <div className='flex flex-col w-full h-full p-2 bg-white rounded-lg shadow-2xl will-change-transform'>
              <h2 className='my-8 font-medium text-center text-omg-24'>
                대출 상품 {index}
              </h2>
              <div className='flex flex-col h-full my-2 justify-evenly'>
                <div className='grid grid-cols-3 gap-4'>
                  <div className='flex flex-col items-center'>
                    <h4 className='text-omg-24'>{product.round}</h4>
                    <span className='text-omg-14 text-gray'>대출한 라운드</span>
                  </div>
                  <div className='flex flex-col items-center'>
                    <h4 className='text-omg-24'>
                      {formatTime(product.loanTimestampInSeconds)}
                    </h4>
                    <span className='text-omg-14 text-gray'>대출 시각</span>
                  </div>
                  <div className='flex flex-col items-center'>
                    <h4 className='text-omg-24'>{product.interestRate}%</h4>
                    <span className='text-omg-14 text-gray'>금리</span>
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-4 mt-4'>
                  <div className='flex flex-col items-center'>
                    <h4 className='text-omg-24'>{product.loanPrincipal}</h4>
                    <span className='text-omg-14 text-gray'>갚아야 할 돈</span>
                  </div>
                  <div className='flex flex-col items-center'>
                    <h4 className='text-omg-24'>{product.loanInterest}</h4>
                    <span className='text-omg-14 text-gray'>
                      현재 대출상품에 적용된 이자
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </animated.div>
        );
      })}
    </>
  );
}

export default function LoanReport() {
  return (
    <div className='flex items-center justify-center h-5/6'>
      <Deck />
    </div>
  );
}
