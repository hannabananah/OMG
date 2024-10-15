import { useMainBoardStore } from '@/stores';

export default function Gauge() {
  const { remainingUntilChange } = useMainBoardStore();

  return (
    <div className='relative w-[200px] h-8 bg-white1 rounded-100 overflow-hidden'>
      <p className='absolute -translate-x-1/2 left-1/2 text-omg-18'>
        {remainingUntilChange}%
      </p>
      <div
        className='h-full transition-all duration-300 bg-skyblue'
        style={{ width: `${remainingUntilChange}%` }}
      ></div>
    </div>
  );
}
