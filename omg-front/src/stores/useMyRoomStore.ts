import { create } from 'zustand';

interface MyRoomStore {
  isEnteringRoom: { [playerNickname: string]: boolean };
  isExitingRoom: { [playerNickname: string]: boolean };
  setIsEnteringRoom: (playerNickname: string, value: boolean) => void;
  setIsExitingRoom: (playerNickname: string, value: boolean) => void;

  isFadingOut: boolean;
  setIsFadingOut: (value: boolean) => void;
}

export const useMyRoomStore = create<MyRoomStore>(set => ({
  isEnteringRoom: {},
  isExitingRoom: {},
  setIsEnteringRoom: (playerNickname, value) =>
    set(state => ({
      isEnteringRoom: {
        ...state.isEnteringRoom,
        [playerNickname]: value,
      },
    })),
  setIsExitingRoom: (playerNickname, value) =>
    set(state => ({
      isExitingRoom: {
        ...state.isExitingRoom,
        [playerNickname]: value,
      },
    })),
  isFadingOut: false,
  setIsFadingOut: value =>
    set(() => ({
      isFadingOut: value,
    })),
}));
