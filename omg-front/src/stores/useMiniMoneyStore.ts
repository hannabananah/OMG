import { create } from 'zustand';

interface MoneyPoint {
  pointId?: string;
  moneyCoordinates: number[];
  moneyStatus: number;
}

interface GameState {
  roomId: string;
  playerCash: number;
  moneyPoints: MoneyPoint[];

  getPlayerCash: (cash: number) => void;

  updateMoneyPoints: (points: MoneyPoint[]) => void;

  setCoordinates: (coordinates: MoneyPoint[]) => void;

  resetCoordinateState: () => void;
}

export const useMiniMoneyStore = create<GameState>(set => ({
  roomId: '',
  playerCash: 0,
  moneyPoints: [],
  ranking: { playerRanking: [] },

  getPlayerCash: cash => {
    set(() => ({
      playerCash: cash,
    }));
  },

  updateMoneyPoints: points => {
    set(() => ({
      moneyPoints: points,
    }));
  },

  setCoordinates: coordinates => {
    set(state => {
      const existingCoordinatesSet = new Set(
        state.moneyPoints.map(point => point.moneyCoordinates.join(',')),
      );

      const newPoints = coordinates.filter(
        point => !existingCoordinatesSet.has(point.moneyCoordinates.join(',')),
      );

      return {
        moneyPoints: [
          ...state.moneyPoints,
          ...newPoints.map(point => ({
            ...point,
            pointId: point.pointId || `point${state.moneyPoints.length + 1}`,
            moneyStatus:
              point.moneyStatus !== undefined ? point.moneyStatus : 0,
          })),
        ],
      };
    });
  },

  resetCoordinateState: () => {
    set(() => ({
      moneyPoints: [],
    }));
  },
}));
