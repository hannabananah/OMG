type ChoiceTransactionProps = {
  type: 'buy-stock' | 'sell-stock' | 'take-loan' | 'repay-loan';
  onClick: () => void;
};

export default function ChoiceTransaction({
  type,
  onClick,
}: ChoiceTransactionProps) {
  const buttonText = (() => {
    switch (type) {
      case 'buy-stock':
        return '구매하기';
      case 'sell-stock':
        return '판매하기';
      case 'take-loan':
        return '대출';
      case 'repay-loan':
        return '상환';
      default:
        return '';
    }
  })();

  return (
    <button
      onClick={onClick}
      className='flex items-center justify-center w-1/4 bg-white rounded-lg h-3/5 bg-opacity-90 rounded-30'
    >
      <span className='text-black font-omg-title text-omg-50b'>
        {buttonText}
      </span>
    </button>
  );
}
