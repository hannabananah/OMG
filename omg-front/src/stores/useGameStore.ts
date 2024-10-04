import type { MarketStock, Player } from '@/types';
import { create } from 'zustand';

interface ExtendedGameData extends GameData {
  tradableStockCnt?: number | null;
}

interface GameData {
  currentInterestRate: number;
  currentStockPriceLevel: number;
  economicEvent: number[];
  gameId: string;
  gameStatus: string;
  goldBuyTrack: number[];
  goldPrice: number;
  goldPriceIncreaseCnt: number;
  isPaused: boolean;
  marketStocks: MarketStock[];
  message: string;
  pauseTime: number;
  paused: boolean;
  players: Player[];
  round: number;
  roundStatus: string;
  stockBuyTrack: number[];
  stockSellTrack: number[];
  stockTokensPocket: number[];
  time: number;
}

interface GameStore {
  gameData: ExtendedGameData | null;
  carryingCount: number[]; // 기존 carryingCount를 carryingCount로 변경
  selectedCount: number[]; // 새로운 selectedCount 추가
  setGameData: (data: ExtendedGameData) => void;
  setCarryingCount: (
    data: number[] | ((prevData: number[]) => number[]),
  ) => void;
  setSelectedCount: (
    data: number[] | ((prevData: number[]) => number[]),
  ) => void;
}

export const useGameStore = create<GameStore>(set => ({
  gameData: null,
  carryingCount: [0, 0, 0, 0, 0, 0],
  selectedCount: [0, 0, 0, 0, 0, 0],
  setGameData: (data: ExtendedGameData) => {
    set({
      gameData: {
        ...data,
        tradableStockCnt: data.tradableStockCnt ?? 1,
      },
    });
  },
  setCarryingCount: (data: number[] | ((prevData: number[]) => number[])) => {
    if (typeof data === 'function') {
      set(prev => ({ carryingCount: data(prev.carryingCount) }));
    } else {
      set({ carryingCount: data });
    }
  },
  setSelectedCount: (data: number[] | ((prevData: number[]) => number[])) => {
    if (typeof data === 'function') {
      set(prev => ({ selectedCount: data(prev.selectedCount) }));
    } else {
      set({ selectedCount: data });
    }
  },
}));
