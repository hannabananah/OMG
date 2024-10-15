import { useLoanStore } from '@/stores';
import { formatNumberWithCommas, formatTime } from '@/utils';

const headers = [
  '대출한 ROUND',
  '대출 시각',
  '(대출시점) 금리',
  '대출 원금',
  '발생한 이자',
];

const TableHeader = ({ headers }: { headers: string[] }) => (
  <thead>
    <tr>
      {headers.map((header, index) => (
        <th key={index} className='w-1/5 px-3 py-4 text-center text-omg-20'>
          {header}
        </th>
      ))}
    </tr>
  </thead>
);

const TableCell = ({ value }: { value: string | number }) => (
  <td className='w-1/5 p-4 text-center text-omg-18'>{value}</td>
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

  return (
    <div className='flex flex-col items-center w-full h-full px-6 py-10'>
      <div className="mt-4 w-full max-h-[450px] overflow-y-scroll bg-[url('/assets/loan-sheet.jpg')] bg-cover rounded-20 shadow-xl">
        <table className='min-w-full table-fixed bg-lightgray bg-opacity-70'>
          <TableHeader headers={headers} />
        </table>

        <div className='overflow-y-auto scrollbar-hidden'>
          <table className='min-w-full table-fixed'>
            <tbody>
              {loanProducts.map((product, index) => (
                <tr key={index}>
                  <TableCell value={`${product.round} ROUND`} />
                  <TableCell
                    value={`${formatTime(product.loanTimestampInSeconds)} 초`}
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
