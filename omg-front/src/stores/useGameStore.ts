import type { MarketStock, Player } from '@/types';
import { create } from 'zustand';

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
  gameData: GameData | null;
  carryingData: number[];
  setGameData: (data: GameData) => void;
  setCarryingData: (
    data: number[] | ((prevData: number[]) => number[]),
  ) => void;
}

export const useGameStore = create<GameStore>(set => ({
  gameData: null,
  carryingData: [0, 0, 0, 0, 0],
  setGameData: (data: GameData) => set({ gameData: data }),
  setCarryingData: (data: number[] | ((prevData: number[]) => number[])) => {
    if (typeof data === 'function') {
      set(prev => ({ carryingData: data(prev.carryingData) }));
    } else {
      set({ carryingData: data });
    }
  },
}));
