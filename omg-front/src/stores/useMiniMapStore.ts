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
    set(state => ({
      playerMinimap: state.playerMinimap.map(player =>
        player.nickname === nickname
          ? { ...player, position: newPosition }
          : player,
      ),
    }));
  },
}));
