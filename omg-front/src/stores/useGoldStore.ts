import { create } from 'zustand';

interface GoldStore {
  goldPriceChart: number[]; // 1 * 61 짜리 금 시세 차트 데이터 (graph)
  playerNicknames: string[];
  playerGoldCounts: number[]; // 1 * 4 짜리 플레이어 별 보유 금 개수 배열 (bar)
  goldPrice: number;

  // 새로운 금 데이터 업데이트
  setGoldMarketData: (data: GoldStore) => void;
}

export const useGoldStore = create<GoldStore>(set => ({
  goldPriceChart: Array(61)
    .fill(0)
    .map((_, index) => (index === 0 ? 20 : 0)), // 0번 인덱스만 20(금 초기 가격)으로 설정
  playerNicknames: ['User 1', 'User 2', 'User 3', 'User 4'],
  playerGoldCounts: Array(4).fill(0),
  goldPrice: 20,

  setGoldMarketData: data => {
    set(data);
  },
}));
