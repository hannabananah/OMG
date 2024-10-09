import { create } from 'zustand';

interface PlayerResult {
  nickname: string;
  finalCash: number;
  finalGoldCnt: number;
  finalStockCnt: number[];
  finalNetWorth: number;
  finalDebt: number;
}

interface GameResultData {
  finalGoldPrice: number;
  finalStockPrice: number[];
  playerResults: PlayerResult[];
}

export const useGameResultStore = create<{
  finalGoldPrice: number;
  finalStockPrice: number[];
  playerResults: PlayerResult[];
  setGameResultData: (data: GameResultData) => void;
}>(set => ({
  finalGoldPrice: 0,
  finalStockPrice: [],
  playerResults: [],

  setGameResultData: data =>
    set({
      finalGoldPrice: data.finalGoldPrice,
      finalStockPrice: data.finalStockPrice,
      playerResults: data.playerResults,
    }),
}));
