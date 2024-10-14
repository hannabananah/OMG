import { useGameResultStore } from '@/stores/useGameResultStore';
import useUser from '@/stores/useUser';
import formatNumberWithCommas from '@/utils/formatNumberWithCommas';

export default function GamePersonalResult() {
  const { playerResults, finalGoldPrice, finalStockPrice } =
    useGameResultStore();
  const { nickname } = useUser();

  const currentUser = playerResults.find(
    player => player.nickname === nickname,
  );

  if (!currentUser) {
    return <div>유저 데이터를 찾을 수 없습니다.</div>;
  }

  return (
    <div className='flex flex-col justify-between h-full'>
      <div className='flex flex-col border-4 border-black'>
        <h3 className='text-center text-omg-20'>🎅 나의 최종 보유자산 🦌</h3>
        <p className='text-center text-omg-40b'>
          {formatNumberWithCommas(currentUser.finalNetWorth)}
        </p>
      </div>
      <div className='flex justify-between w-full px-6 mt-5'>
        <div className='flex flex-col items-center'>
          <span className='text-omg-18'>💸 보유 현금액</span>
          <span className='text-omg-24'>
            ${formatNumberWithCommas(currentUser.finalCash)}
          </span>
        </div>
        <div className='flex flex-col items-center'>
          <span className='text-omg-18'>🎁 각 주가 * 주식 수</span>
          {currentUser.finalStockCnt.map((stockCount, idx) => (
            <span key={idx} className='text-omg-14'>
              ${formatNumberWithCommas(finalStockPrice[idx])} * {stockCount} 주
            </span>
          ))}
        </div>
        <div className='flex flex-col items-center'>
          <span className='text-omg-18'>금 가격 * 개수</span>
          <span className='text-omg-24'>
            ${formatNumberWithCommas(finalGoldPrice)} *
            {currentUser.finalGoldCnt}
          </span>
        </div>
        <div className='flex flex-col items-center'>
          <span className='text-omg-18'>💰 대출액</span>
          <span className='text-omg-24'>
            {formatNumberWithCommas(currentUser.finalDebt)}
          </span>
        </div>
      </div>
    </div>
  );
}
