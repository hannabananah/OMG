import { create } from 'zustand';

interface LoanState {
  loanPrincipal: number;
  loanInterest: number;
  totalDebt: number;
  cash: number;
  loanLimit: number;
  setLoanData: (data: {
    loanPrincipal: number;
    loanInterest: number;
    totalDebt: number;
    cash: number;
  }) => void;
  setLoanLimit: (limit: number) => void;
}

export const useLoanStore = create<LoanState>(set => ({
  loanPrincipal: 0,
  loanInterest: 0,
  totalDebt: 0,
  cash: 0,
  loanLimit: 0,

  // 대출 관련 데이터 업데이트
  setLoanData: ({ loanPrincipal, loanInterest, totalDebt, cash }) =>
    set(() => ({
      loanPrincipal,
      loanInterest,
      totalDebt,
      cash,
    })),

  // 대출 한도 업데이트
  setLoanLimit: (limit: number) =>
    set(() => ({
      loanLimit: limit,
    })),
}));
