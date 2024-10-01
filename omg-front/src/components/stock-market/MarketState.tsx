import { useState } from 'react';

export default function MarketState() {
  const items = [
    {
      title: '금리',
      content: '5%',
    },
    {
      title: '물가 수준',
      content: '0/9',
    },
    {
      title: '거래 가능 수량',
      content: '1개',
    },
  ];

  const [progress, setProgress] = useState(20); // 초기값 20

  // TODO: 추후 삭제 필요
  console.log('빌드 에러 해결을 위한 임시 setProgress 콘솔', setProgress(10));

  return (
    <div className='flex items-center gap-20 text-omg-20'>
      <ul className='flex items-center gap-6'>
        {items.map((item, index) => (
          <li key={index} className='flex items-center gap-2'>
            <p>{item.title}</p>
            <p>{item.content}</p>
          </li>
        ))}
      </ul>

      <div className='flex items-center gap-6'>
        <p>가격 변동 까지 남은 게이지</p>
        <div className='relative w-[200px] h-8 bg-white2 rounded-100 overflow-hidden'>
          <p className='absolute -translate-x-1/2 left-1/2'>{progress}%</p>
          <div
            className='h-full transition-all duration-300 bg-skyblue'
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
