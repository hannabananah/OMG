import { create } from 'zustand';

interface Player {
  characterType: number;
  nickname: string;
  position: { x: number; y: number; z: number };
  direction: { x: number; y: number; z: number };
  action: string;
}

interface CharacterStore {
  players: Record<string, Player>;
  setPlayer: (nickname: string, playerData: Partial<Player>) => void;
  setPlayerPosition: (
    nickname: string,
    position: { x: number; y: number; z: number },
  ) => void;
  setPlayerDirection: (
    nickname: string,
    direction: { x: number; y: number; z: number },
  ) => void;
  setPlayerAction: (nickname: string, action: string) => void;
}

const useCharacterStore = create<CharacterStore>(set => ({
  players: {},

  setPlayer: (nickname, playerData) =>
    set(state => ({
      players: {
        ...state.players,
        [nickname]: {
          ...state.players[nickname],
          ...playerData,
        },
      },
    })),

  setPlayerPosition: (nickname, position) =>
    set(state => ({
      players: {
        ...state.players,
        [nickname]: {
          ...state.players[nickname],
          position,
        },
      },
    })),

  setPlayerDirection: (nickname, direction) =>
    set(state => ({
      players: {
        ...state.players,
        [nickname]: {
          ...state.players[nickname],
          direction,
        },
      },
    })),

  setPlayerAction: (nickname, action) =>
    set(state => ({
      players: {
        ...state.players,
        [nickname]: {
          ...state.players[nickname],
          action,
        },
      },
    })),
}));

export default useCharacterStore;
