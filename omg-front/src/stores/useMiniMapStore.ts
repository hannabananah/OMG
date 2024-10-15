import { create } from 'zustand';

interface PlayerMinimapStore {
  nickname: string;
  position: [number, number];
}

interface MiniMapStore {
  playerMinimap: PlayerMinimapStore[];
  setPlayerMinimap: (data: PlayerMinimapStore[]) => void;
  updatePlayerPosition: (
    nickname: string,
    newPosition: [number, number],
  ) => void;
}

export const useMiniMapStore = create<MiniMapStore>(set => ({
  playerMinimap: [],
  setPlayerMinimap: (data: PlayerMinimapStore[]) => {
    set({ playerMinimap: data });
  },
  updatePlayerPosition: (nickname: string, newPosition: [number, number]) => {
    set(state => {
      const playerToUpdate = state.playerMinimap.find(
        player => player.nickname === nickname,
      );

      if (
        (playerToUpdate && playerToUpdate.position[0] !== newPosition[0]) ||
        playerToUpdate.position[1] !== newPosition[1]
      ) {
        return {
          playerMinimap: state.playerMinimap.map(player =>
            player.nickname === nickname
              ? { ...player, position: newPosition }
              : player,
          ),
        };
      }

      return state;
    });
  },
}));
