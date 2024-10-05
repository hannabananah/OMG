import { useLoanStore } from '@/stores/useLoanStore';
import { formatTime } from '@/utils/formatTime';

const TableHeader = ({ headers }: { headers: string[] }) => (
  <thead>
    <tr className='text-omg-14'>
      {headers.map((header, index) => (
        <th key={index} className='p-4 text-left bg-white'>
          {header}
        </th>
      ))}
    </tr>
  </thead>
);

const TableCell = ({ value }: { value: string | number }) => (
  <td className='p-4 text-omg-14'>{value}</td>
);

export default function LoanSheet() {
  const { loanProducts } = useLoanStore();

  if (loanProducts.length === 0) {
    return (
      <div className='flex items-center justify-center h-5/6'>
        <h2 className='text-omg-20'>대출한 상품이 없습니다.</h2>
      </div>
    );
  }

  const headers = [
    '대출한 라운드',
    '대출 시각',
    '금리',
    '대출 원금',
    '현재 대출상품에 적용된 이자',
  ];

  return (
    <div className='flex flex-col items-center w-full h-[440px] p-10'>
      <div className='w-full h-full'>
        <table className='min-w-full bg-white shadow-xl'>
          <TableHeader headers={headers} />
        </table>

        <div className='h-[360px] overflow-y-auto scrollbar-hidden'>
          <table className='min-w-full bg-white'>
            <tbody>
              {loanProducts.map((product, index) => (
                <tr key={index} className='border-b'>
                  <TableCell value={product.round} />
                  <TableCell value={formatTime(product.loanTimestampInSeconds)} />
                  <TableCell value={`${product.interestRate}%`} />
                  <TableCell value={product.loanPrincipal} />
                  <TableCell value={product.loanInterest} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
