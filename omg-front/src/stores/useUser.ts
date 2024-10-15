import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface userInfoState {
  nickname: string;
  roomId: string;
  characterType: number;
  playerIndex: number;
  setNickname: (value: string) => void;
  setRoomId: (value: string) => void;
  setCharacterType: (value: number) => void;
  setPlayerIndex: (value: number) => void;
}

export const useUser = create<userInfoState>()(
  persist(
    set => ({
      nickname: '',
      roomId: '',
      characterType: 0,
      playerIndex: 0,
      setNickname: (value: string) => set({ nickname: value }),
      setRoomId: (value: string) => set({ roomId: value }),
      setCharacterType: (value: number) => set({ characterType: value }),
      setPlayerIndex: (value: number) => set({ playerIndex: value }),
    }),
    {
      name: 'userInfo',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
