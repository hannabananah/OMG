import { useLoanStore } from '@/stores/useLoanStore';
import formatNumberWithCommas from '@/utils/formatNumberWithCommas';
import { formatTime } from '@/utils/formatTime';

const TableHeader = ({ headers }: { headers: string[] }) => (
  <thead>
    <tr className='text-omg-14'>
      {headers.map((header, index) => (
        <th key={index} className='w-1/5 p-4 text-left bg-white'>
          {header}
        </th>
      ))}
    </tr>
  </thead>
);

const TableCell = ({ value }: { value: string | number }) => (
  <td className='w-1/5 p-4 text-omg-14'>{value}</td>
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
    '대출한 시각',
    '금리',
    '갚아야 할 돈',
    '해당 상품에 적용된 이자액',
  ];

  return (
    <div className='flex flex-col items-center w-full h-full px-6 py-10'>
      <div className='w-full h-full'>
        <table className='min-w-full bg-white table-fixed'>
          <TableHeader headers={headers} />
        </table>

        <div className='h-[330px] overflow-y-auto scrollbar-hidden'>
          <table className='min-w-full bg-white shadow-xl table-fixed'>
            <tbody>
              {loanProducts.map((product, index) => (
                <tr key={index}>
                  <TableCell value={`${product.round} 라운드`} />
                  <TableCell
                    value={formatTime(product.loanTimestampInSeconds)}
                  />
                  <TableCell value={`${product.interestRate}%`} />
                  <TableCell
                    value={`$${formatNumberWithCommas(product.loanPrincipal)}`}
                  />
                  <TableCell
                    value={`$${formatNumberWithCommas(product.loanInterest)}`}
                  />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
