import { create } from 'zustand';

interface LoanState {
  loanPrincipal: number;
  loanInterest: number;
  totalDebt: number;
  cash: number;
  loanLimit: number;
  interestRate: number;
  setLoanData: (data: {
    loanPrincipal?: number;
    loanInterest?: number;
    totalDebt: number;
    cash: number;
    loanLimit?: number;
    interestRate?: number;
  }) => void;
}

export const useLoanStore = create<LoanState>(set => ({
  loanPrincipal: 0,
  loanInterest: 0,
  totalDebt: 0,
  cash: 0,
  loanLimit: 0,
  interestRate: 0,

  setLoanData: ({
    loanPrincipal,
    loanInterest,
    totalDebt,
    cash,
    loanLimit,
    interestRate,
  }) =>
    set(() => ({
      loanPrincipal,
      loanInterest,
      totalDebt,
      cash,
      loanLimit,
      interestRate,
    })),
}));
