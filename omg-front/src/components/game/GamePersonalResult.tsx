import { useGameResultStore } from "@/stores/useGameResultStore";
import useUser from '@/stores/useUser';

export default function GamePersonalResult() {
  const { playerResults, finalGoldPrice, finalStockPrice } = useGameResultStore();
  const { nickname } = useUser();

  const currentUser = playerResults.find(player => player.nickname === nickname);

  if (!currentUser) {
    return <div>유저 데이터를 찾을 수 없습니다.</div>;
  }

  const totalGoldValue = currentUser.finalGoldCnt * finalGoldPrice;

  return (
    <div className="my-8">
      <h3 className="mb-4 text-xl font-bold text-center text-omg-24">나의 최종 보유자산</h3>
      <p className='text-center'>{currentUser.finalNetWorth}</p>
      <table className="w-full text-left">
        <thead>
          <tr>
            <th>금 가격 * 금 개수</th>
            <th>각 주가 * 주식 수</th>
            <th>대출액</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{finalGoldPrice} 원 * {currentUser.finalGoldCnt} 개</td>
            <td>
              {currentUser.finalStockCnt.map((stockCount, idx) => (
                <div key={idx}>
                  {finalStockPrice[idx]} 원 * {stockCount} 주
                </div>
              ))}
            </td>
            <td>{currentUser.finalDebt} 원</td>
          </tr>
        </tbody>
      </table>

      <div className="mt-4">
        <h4 className="font-bold">총 자산 계산</h4>
        <p>금 자산: {totalGoldValue.toLocaleString()} 원</p>
        <p>주식 자산: {currentUser.finalStockCnt.reduce((acc, stockCount, idx) => {
          const price = finalStockPrice[idx] || 0;
          return acc + stockCount * price;
        }, 0).toLocaleString()} 원</p>
        <p>대출액: {currentUser.finalDebt.toLocaleString()} 원</p>
      </div>
    </div>
  );
}
