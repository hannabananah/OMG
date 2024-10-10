import type { GameEvent, MarketStock, Player } from '@/types';
import { create } from 'zustand';

interface GameData {
  currentEvent: GameEvent | null;
  currentInterestRate: number;
  currentStockPriceLevel: number;
  economicEvent: number[];
  gameId: string;
  gameStatus: string;
  goldBuyTrack: number[];
  goldPrice: number;
  goldPriceChart: number[];
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
  stockPriceChangeInfo: number[][];
  stockSellTrack: number[];
  stockTokensPocket: number[];
  time: number;
  playerRanking?: string[];
}

interface GameStore {
  gameData: GameData | null;
  carryingToMarketCount: number[];
  carryingToHomeCount: number[];
  selectedCount: number[];
  setGameData: (data: Partial<GameData>) => void; // Partial 타입 사용하여 일부 필드만 업데이트 가능하도록 설정
  setCarryingToMarketCount: (
    data: number[] | ((prevData: number[]) => number[]),
  ) => void;
  setCarryingToHomeCount: (
    data: number[] | ((prevData: number[]) => number[]),
  ) => void;
  setSelectedCount: (
    data: number[] | ((prevData: number[]) => number[]),
  ) => void;
}

export const useGameStore = create<GameStore>(set => ({
  gameData: null,
  carryingToMarketCount: [0, 0, 0, 0, 0, 0],
  carryingToHomeCount: [0, 0, 0, 0, 0, 0],
  selectedCount: [0, 0, 0, 0, 0, 0],
  // 일부 데이터만 업데이트
  setGameData: (data: Partial<GameData>) => {
    set(state => ({
      gameData: {
        ...state.gameData, // 기존 데이터 유지
        ...data, // 새로운 데이터로 덮어쓰기 (일부 필드만 업데이트)
      },
    }));
  },

  setCarryingToMarketCount: (
    data: number[] | ((prevData: number[]) => number[]),
  ) => {
    if (typeof data === 'function') {
      set(prev => ({
        carryingToMarketCount: data(prev.carryingToMarketCount),
      }));
    } else {
      set({ carryingToMarketCount: data });
    }
  },
  setCarryingToHomeCount: (
    data: number[] | ((prevData: number[]) => number[]),
  ) => {
    if (typeof data === 'function') {
      set(prev => ({
        carryingToHomeCount: data(prev.carryingToHomeCount),
      }));
    } else {
      set({ carryingToHomeCount: data });
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
