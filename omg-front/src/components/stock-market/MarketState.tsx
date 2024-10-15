import { Gauge } from '@/components/common';
import { useMainBoardStore } from '@/stores';

export default function MarketState() {
  const { currentInterestRate, currentStockPriceLevel, tradableStockCnt } =
    useMainBoardStore();

  const items = [
    {
      title: '금리',
      content: `${currentInterestRate}%`,
    },
    {
      title: '물가 수준',
      content: `${currentStockPriceLevel}/9`,
    },
    {
      title: '거래 가능 수량',
      content: `${tradableStockCnt}개`,
    },
  ];

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
          <Gauge />
        </div>
      </div>
    </div>
  );
}
