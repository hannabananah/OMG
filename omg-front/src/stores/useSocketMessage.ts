import { create } from 'zustand';

interface EventMessage {
  roundStatus: string;
  title: string;
  content: string;
  value: number;
}

interface SocketMessageState {
  roomMessage: unknown;
  gameMessage: unknown;
  buyStockMessage?: { message: string; isCompleted: boolean };
  sellStockMessage?: { message: string; isCompleted: boolean };
  loanMessage?: { message: string; isCompleted: boolean };
  repayLoanMessage?: { message: string; isCompleted: boolean };
  goldPurchaseMessage?: { message: string; isCompleted: boolean };
  eventCardMessage: EventMessage;
  eventEffectMessage: Pick<EventMessage, 'roundStatus' | 'value'>;
  gameRoundMessage: { roundStatus: string; message?: string };
  setRoomMessage: (newRoomMessage: unknown) => void;
  setGameMessage: (newGameMessage: unknown) => void;
  setBuyMessage: (newBuyMessage: {
    message: string;
    isCompleted: boolean;
  }) => void;
  setSellMessage: (newSellMessage: {
    message: string;
    isCompleted: boolean;
  }) => void;
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
  setEventCardMessage: (newEventMessage: EventMessage) => void;
  setEventEffectMessage: (
    newEventEffectMessage: Pick<EventMessage, 'roundStatus' | 'value'>,
  ) => void;
  setGameRoundMessage: (newGameRoundMessage: {
    roundStatus: string;
    message: string;
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
  buyStockMessage: { message: null, isCompleted: false },
  setBuyMessage: newBuyMessage => {
    set(state => ({
      ...state,
      buyStockMessage: newBuyMessage,
    }));
  },
  sellStockMessage: { message: null, isCompleted: false },
  setSellMessage: newSellMessage => {
    set(state => ({
      ...state,
      sellStockMessage: newSellMessage,
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
  eventCardMessage: {
    roundStatus: '',
    title: '',
    content: '',
    value: 0,
  },
  setEventCardMessage: newEventMessage => {
    set(state => ({
      ...state,
      eventCardMessage: newEventMessage,
    }));
  },
  eventEffectMessage: {
    roundStatus: '',
    value: 0,
  },
  setEventEffectMessage: newEventEffectMessage => {
    set(state => ({
      ...state,
      eventEffectMessage: newEventEffectMessage,
    }));
  },
  gameRoundMessage: { roundStatus: null, message: null },
  setGameRoundMessage: newGameRoundMessage => {
    set(state => ({
      ...state,
      gameRoundMessage: newGameRoundMessage,
    }));
  },
}));
