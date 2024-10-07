import Button from '../common/Button';

interface LoanActionButtonProps {
  actionType: 'take' | 'repay';
  buttonText: string;
  onAction: (amount: number) => void;
  disabled?: boolean;
}

export default function LoanActionButton({
  actionType,
  buttonText,
  onAction,
  disabled = false,
}: LoanActionButtonProps) {
  const handleClick = () => {
    const promptMessage =
      actionType === 'take'
        ? '대출할 액수를 입력하세요.'
        : '상환할 대출 액수를 입력하세요.';

    const amount = Number(prompt(promptMessage)?.trim());
    if (isNaN(amount) || amount <= 0) {
      alert(
        actionType === 'take'
          ? '대출할 액수를 다시 입력해주세요.'
          : '상환액을 다시 입력해주세요.',
      );
      return;
    }
    onAction(amount);
  };

  return (
    <div className='flex items-center justify-center'>
      <Button
        text={buttonText}
        type='trade'
        onClick={handleClick}
        disabled={disabled}
      />
    </div>
  );
}
