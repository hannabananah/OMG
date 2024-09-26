import { useContext } from 'react';

import type { Player } from '@/types';
import { SocketContext } from '@/utils/SocketContext';
import { create } from 'zustand';

interface CharacterStore {
  players: Record<string, Player>;
  initPlayer: (nickname: string, playerData: Player) => void;
  setPlayer: (nickname: string, playerData: Partial<Player>) => void;
  setPlayerPosition: (nickname: string, position: number[]) => void;
  setPlayerDirection: (nickname: string, direction: number[]) => void;
  setPlayerAction: (nickname: string, actionToggle: boolean | null) => void;
  updatePlayer: (messageData: {
    nickname: string;
    playerData: Partial<Player>;
  }) => void;
}

export const useCharacter = create<CharacterStore>(set => ({
  players: {},
  initPlayer: (nickname, playerData) => {
    set(state => ({
      players: {
        ...state.players,
        [nickname]: playerData,
      },
    }));
  },

  setPlayer: (nickname: string, playerData) => {
    set(state => ({
      players: {
        ...state.players,
        [nickname]: {
          ...state.players[nickname],
          ...playerData,
        },
      },
    }));
  },

  setPlayerPosition: (nickname, position) => {
    set(state => ({
      players: {
        ...state.players,
        [nickname]: {
          ...state.players[nickname],
          position,
        },
      },
    }));
  },

  setPlayerDirection: (nickname, direction) => {
    set(state => ({
      players: {
        ...state.players,
        [nickname]: {
          ...state.players[nickname],
          direction,
        },
      },
    }));
  },

  setPlayerAction: (nickname, actionToggle) => {
    set(state => {
      const player = state.players[nickname];
      if (!player) return state;

      return {
        players: {
          ...state.players,
          [nickname]: {
            ...player,
            actionToggle,
          },
        },
      };
    });
  },

  updatePlayer: messageData => {
    const { nickname, playerData } = messageData;
    set(state => ({
      players: {
        ...state.players,
        [nickname]: {
          ...state.players[nickname],
          ...playerData,
        },
      },
    }));
  },
}));

export const useUpdatedCharacterStore = () => {
  const { moveCharacter } = useContext(SocketContext);
  const store = useCharacter();
  const { players } = store;

  const updatePlayerPosition = (nickname: string, position: number[]) => {
    store.setPlayerPosition(nickname, position);
    const player = players[nickname];
    if (player) {
      moveCharacter(position, player.direction);
    }
  };

  const updatePlayerDirection = (nickname: string, direction: number[]) => {
    store.setPlayerDirection(nickname, direction);
    const player = players[nickname];
    if (player) {
      moveCharacter(player.position, direction);
    }
  };

  return { ...store, updatePlayerPosition, updatePlayerDirection };
};
