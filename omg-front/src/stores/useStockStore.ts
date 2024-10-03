import { create } from 'zustand';

interface StockStore {
  stockPriceChangeInfo: number[][]; // 6 * 61 짜리 주가 차트 데이터 (graph)
  playerNicknames: string[];
  playerStockShares: number[][]; // 6 * 4 짜리 플레이어 별 보유 주식 개수 배열 (bar)
  leftStocks: number[];
  stockPrices: number[];

  // 새로운 주식 데이터 업데이트
  setStockMarketData: (data: StockStore) => void;
}

export const useStockStore = create<StockStore>(set => ({
  stockPriceChangeInfo: Array(6)
    .fill(0)
    .map(() => [8, ...Array(60).fill(0)]),
  playerNicknames: ['플레이어 1', '플레이어 2', '플레이어 3', '플레이어 4'],
  playerStockShares: Array(6)
    .fill(0)
    .map(() => Array(4).fill(0)),
  leftStocks: Array(6).fill(0),
  stockPrices: Array(6).fill(0),

  setStockMarketData: data => {
    set(data);
  },
}));
