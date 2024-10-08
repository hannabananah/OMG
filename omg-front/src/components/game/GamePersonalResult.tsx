import { useGameResultStore } from '@/stores/useGameResultStore';
import useUser from '@/stores/useUser';

export default function GamePersonalResult() {
  const { playerResults, finalGoldPrice, finalStockPrice } = useGameResultStore();
  const { nickname } = useUser();

  const currentUser = playerResults.find(player => player.nickname === nickname);

  if (!currentUser) {
    return <div>유저 데이터를 찾을 수 없습니다.</div>;
  }

  // const totalGoldValue = currentUser.finalGoldCnt * finalGoldPrice;

  // const totalStockValue = currentUser.finalStockCnt.reduce((acc, stockCount, idx) => {
  //   const price = finalStockPrice[idx] || 0;
  //   return acc + stockCount * price;
  // }, 0);

  return (
    <div className='flex flex-col justify-between h-full'>
      <div className='flex flex-col'>
        <h3 className='text-center text-omg-24'>나의 최종 보유자산</h3>
        <p className='text-center text-omg-24b'>{currentUser.finalNetWorth}</p>
      </div>
      <div className='flex justify-between w-full px-6 mt-10'>
        <div className="flex flex-col items-center">
          <span className='text-omg-24'>보유 현금액</span>
          <span className='text-omg-14'>${currentUser.finalCash.toLocaleString()}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className='text-omg-24'>각 주가*주식 수</span>
          {currentUser.finalStockCnt.map((stockCount, idx) => (
            <span key={idx} className='text-omg-14'>
              ${finalStockPrice[idx]} * {stockCount} 주
            </span>
          ))}
        </div>
        <div className="flex flex-col items-center">
          <span className='text-omg-24'>금 가격*금 개수</span>
          <span className='text-omg-14'>${finalGoldPrice} * {currentUser.finalGoldCnt}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className='text-omg-24'>대출액</span>
          <span className='text-omg-14'>{currentUser.finalDebt.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}