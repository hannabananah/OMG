import { create } from 'zustand';

interface PersonalBoardStore {
  action: string | null;
  carryingGolds: number;
  carryingStocks: number[];
  cash: number;
  currentLoanPrincipal: number;
  goldOwned: number;
  loanLimit: number;
  loanProducts: []; // 따로 TreeSet<LoanProduct> 있음
  state: string;
  stock: number[];
  totalDebt: number;

  setPersonalBoardData: (
    data: Omit<PersonalBoardStore, 'setPersonalBoardData'>,
  ) => void;
}

export const usePersonalBoardStore = create<PersonalBoardStore>(set => ({
  action: null,
  carryingGolds: 0,
  carryingStocks: [0, 0, 0, 0, 0, 0],
  cash: 100,
  currentLoanPrincipal: 0,
  goldOwned: 0,
  loanLimit: 0,
  loanProducts: [], // 따로 TreeSet<LoanProduct> 있음
  state: '',
  stock: [0, 0, 0, 0, 0, 0],
  totalDebt: 0,

  setPersonalBoardData: data =>
    set(() => ({
      ...data,
    })),
}));
