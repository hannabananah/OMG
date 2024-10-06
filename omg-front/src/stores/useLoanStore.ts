import { create } from 'zustand';

interface LoanProduct {
  interestRate: number;
  loanPrincipal: number;
  loanInterest: number;
  round: number;
  loanTimestampInSeconds: number;
}

interface LoanState {
  loanPrincipal: number;
  loanInterest: number;
  totalDebt: number;
  cash: number;
  loanLimit: number;
  interestRate: number;
  loanProducts: LoanProduct[];
  stock: number[];
  goldOwned: number;
  carryingStocks: number[];
  carryingGolds: number;
  action: string | null;
  state: string | null;

  setLoanData: (data: {
    loanPrincipal?: number;
    loanInterest?: number;
    totalDebt: number;
    cash: number;
    loanLimit?: number;
    interestRate?: number;
    loanProducts?: LoanProduct[];
    stock?: number[];
    goldOwned?: number;
    carryingStocks?: number[];
    carryingGolds?: number;
    action?: string | null;
    state?: string | null;
  }) => void;
}

export const useLoanStore = create<LoanState>(set => ({
  loanPrincipal: 0,
  loanInterest: 0,
  totalDebt: 0,
  cash: 0,
  loanLimit: 0,
  interestRate: 0,
  loanProducts: [],
  stock: [0, 0, 0, 0, 0, 0],
  goldOwned: 0,
  carryingStocks: [0, 0, 0, 0, 0, 0],
  carryingGolds: 0,
  action: null,
  state: null,

  setLoanData: data =>
    set(prevState => ({
      ...prevState,
      ...data,
    })),

  setLoanProducts: (products: LoanProduct[]) =>
    set(prevState => ({
      ...prevState,
      loanProducts: products,
    })),
}));
