import { useGameResultStore } from "@/stores/useGameResultStore";
import useUser from '@/stores/useUser';

export default function GameTotalResult() {
  const { playerResults, finalGoldPrice, finalStockPrice } = useGameResultStore();
  const { nickname } = useUser();

  return (
    <table className='w-full text-left '>
      <thead className='text-omg-20'>
        <tr>
          <th>순위</th>
          <th>유저 아이디</th>
          <th>주식 최종액</th>
          <th> </th>
          <th>금괴 최종액</th>
          <th> </th>
          <th>대출액</th>
          <th> </th>
          <th>총자산</th>
        </tr>
      </thead>
      <tbody>
        {playerResults.map((player, index) => {
          const rank = index + 1;
          const isCurrentUser = player.nickname === nickname;

          const totalStockValue = player.finalStockCnt.reduce((acc, stockCount, idx) => {
            const price = finalStockPrice[idx] || 0;
            const count = stockCount || 0;
            return acc + count * price;
          }, 0);

          const totalGoldValue = (player.finalGoldCnt || 0) * (finalGoldPrice || 0);

          const totalNetWorth = player.finalNetWorth;

          return (
            <tr key={player.nickname} className={` text-omg-14 ${isCurrentUser ? 'font-bold text-green' : ''}`}>
              <td>{rank}</td>
              <td>{player.nickname}</td>
              <td>${totalStockValue.toLocaleString()}</td>
              <td>+</td>
              <td>${totalGoldValue.toLocaleString()}</td>
              <td>-</td>
              <td>{(player.finalDebt || 0).toLocaleString()}</td>
              <td>=</td>
              <td>${totalNetWorth.toLocaleString()}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
