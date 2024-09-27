import { create } from 'zustand';

interface SocketMessageState {
  roomMessage: unknown;
  gameMessage: unknown;
  setRoomMessage: (newRoomMessage: unknown) => void;
  setGameMessage: (newGameMessage: unknown) => void;
}

export const useSocketMessage = create<SocketMessageState>(set => ({
  roomMessage: {},
  setRoomMessage: newRoomMessage => {
    set(state => {
      return { ...state, roomMessage: newRoomMessage };
    });
  },
  gameMessage: {},
  setGameMessage: newGameMessage => {
    set(state => {
      return { ...state, gameMessage: newGameMessage };
    });
  },
}));
