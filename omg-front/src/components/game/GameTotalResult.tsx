import { useGameResultStore } from '@/stores/useGameResultStore';
import useUser from '@/stores/useUser';
import formatNumberWithCommas from '@/utils/formatNumberWithCommas';

export default function GameTotalResult() {
  const { playerResults, finalGoldPrice, finalStockPrice } =
    useGameResultStore();
  const { nickname } = useUser();

  return (
    <table className='w-full h-full text-left'>
      <thead className='text-omg-24'>
        <tr>
          <th className='w-16 pb-8'>🏆</th>
          <th className='pb-8'>유저 아이디</th>
          <th className='pb-8'>보유 자산</th>
          <th className='w-24 pb-8'></th>
          <th className='pb-8'>주식 최종액</th>
          <th className='w-24 pb-8'></th>
          <th className='pb-8'>금괴 매입액</th>
          <th className='w-24 pb-8'></th>
          <th className='pb-8'>대출액</th>
          <th className='w-24 pb-8'></th>
          <th className='pb-8'>총자산</th>
        </tr>
      </thead>
      <tbody>
        {playerResults.map((player, index) => {
          const rank = index + 1;
          const isCurrentUser = player.nickname === nickname;

          const finalCash = player.finalCash;
          const totalStockValue = player.finalStockCnt.reduce(
            (acc, stockCount, idx) => {
              const price = finalStockPrice[idx] || 0;
              const count = stockCount || 0;
              return acc + count * price;
            },
            0,
          );

          const totalGoldValue =
            (player.finalGoldCnt || 0) * (finalGoldPrice || 0);

          const totalNetWorth = player.finalNetWorth;

          return (
            <tr
              key={player.nickname}
              className={` text-omg-24 ${isCurrentUser ? 'font-bold text-green' : ''}`}
            >
              <td className='pb-6'>{rank}</td>
              <td className='pb-6'>{player.nickname}</td>
              <td className='pb-6'>${formatNumberWithCommas(finalCash)}</td>
              <td className='pb-6'>+</td>
              <td className='pb-6'>
                ${formatNumberWithCommas(totalStockValue)}
              </td>
              <td className='pb-6'>+</td>
              <td className='pb-6'>
                ${formatNumberWithCommas(totalGoldValue)}
              </td>
              <td className='pb-6'>-</td>
              <td className='pb-6'>
                ${formatNumberWithCommas(player.finalDebt || 0)}
              </td>
              <td className='pb-6'>=</td>
              <td className='pb-6'>${formatNumberWithCommas(totalNetWorth)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
