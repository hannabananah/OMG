export const loanLimitLogic = {
  question: 'Q. 대출 한도는 어떤 방식으로 산정되나요?',
  answer:
    'A. DSR과 소득, 기존 부채를 고려하여 플레이어가 감당할 수 있는 상환액을 이자율로 나누어 대출 가능 금액을 산출하는 방식입니다.',
  steps: [
    {
      title: '연간 소득 대비 DSR 목표 금액 계산',
      formula: 'MaxLoanRepayment = Income × Desired DSR',
    },
    {
      title: '기존 부채 상환액 차감',
      formula: 'AvailableRepaymentCapacity = MaxLoanRepayment – ExistingDebt',
      note: '(단, AvailableRepaymentCapacity가 0 이하인 경우 대출 불가)',
    },
    {
      title: '대출 한도 산정',
      formula: 'LoanLimit = AvailableRepaymentCapacity / MarketInterestRate',
    },
  ],
};
