import Button from '../common/Button';
import PossessionChart from './PossessionChart';

export default function StockSell() {
  // 매도 버튼: 서버로 판매 수량 전송 !
  const handleSelling = () => {};

  return (
    <div className='flex justify-between w-full h-full'>
      {/* 주식 별 지분 */}
      <section className='flex justify-between w-[50%]'>
        <PossessionChart />
      </section>

      {/* 트리 장식 판매 */}
      <section className='w-[50%] flex justify-center items-center'>
        <div className='flex flex-col w-full h-full gap-10 px-20 py-10 bg-skyblue'>
          {/* 집에서 가져온 트리 장식 렌더링 */}
          {/* 매도 버튼 */}
          <div className='flex items-center justify-center'>
            <Button text='매도하기' type='trade' onClick={handleSelling} />
          </div>
        </div>
      </section>
    </div>
  );
}
