import { create } from 'zustand';

interface SocketMessageState {
  roomMessage: any;
  gameMessage: any;
  setRoomMessage: (newRoomMessage: any) => void;
  setGameMessage: (newGameMessage: any) => void;
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
