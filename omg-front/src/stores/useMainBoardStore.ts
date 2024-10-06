import { create } from 'zustand';

interface MainBoardStore {
  stockPrices: number[];
  goldPrice: number;
  currentInterestRate: number;
  currentStockPriceLevel: number;
  tradableStockCnt: number;
  remainingUntilChange: number;

  // 새로운 메인 보드 데이터 업데이트
  setMainBoardData: (data: Omit<MainBoardStore, 'setMainBoardData'>) => void;
}

export const useMainBoardStore = create<MainBoardStore>(set => ({
  stockPrices: [0, 8, 8, 8, 8, 8],
  goldPrice: 20,
  currentInterestRate: 5,
  currentStockPriceLevel: 0,
  tradableStockCnt: 1,
  remainingUntilChange: 0,

  setMainBoardData: data =>
    set(() => ({
      ...data,
    })),
}));
