import { create } from 'zustand';

interface SocketMessageState {
  roomMessage: unknown;
  gameMessage: unknown;
  loanMessage?: { message: string; isCompleted: boolean };
  repayLoanMessage?: { message: string; isCompleted: boolean };
  goldPurchaseMessage?: { message: string; isCompleted: boolean };
  setRoomMessage: (newRoomMessage: unknown) => void;
  setGameMessage: (newGameMessage: unknown) => void;
  setLoanMessage: (newLoanMessage: {
    message: string;
    isCompleted: boolean;
  }) => void;
  setRepayLoanMessage: (newRepayLoanMessage: {
    message: string;
    isCompleted: boolean;
  }) => void;
  setGoldPurchaseMessage: (newGoldPurchaseMessage: {
    message: string;
    isCompleted: boolean;
  }) => void;
}

export const useSocketMessage = create<SocketMessageState>(set => ({
  roomMessage: {},
  setRoomMessage: newRoomMessage => {
    set(state => ({
      ...state,
      roomMessage: newRoomMessage,
    }));
  },
  gameMessage: {},
  setGameMessage: newGameMessage => {
    set(state => ({
      ...state,
      gameMessage: newGameMessage,
    }));
  },
  loanMessage: { message: null, isCompleted: false },
  setLoanMessage: newLoanMessage => {
    set(state => ({
      ...state,
      loanMessage: newLoanMessage,
    }));
  },
  repayLoanMessage: { message: null, isCompleted: false },
  setRepayLoanMessage: newRepayLoanMessage => {
    set(state => ({
      ...state,
      repayLoanMessage: newRepayLoanMessage,
    }));
  },
  goldPurchaseMessage: { message: null, isCompleted: false },
  setGoldPurchaseMessage: newGoldPurchaseMessage => {
    set(state => ({
      ...state,
      goldPurchaseMessage: newGoldPurchaseMessage,
    }));
  },
}));
