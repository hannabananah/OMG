import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface userInfoState {
  nickname: string;
  roomId: string;
  setNickname: (value: string) => void;
  setRoomId: (value: string) => void;
}

const useUser = create<userInfoState>()(
  persist(
    set => ({
      nickname: '',
      roomId: '',
      setNickname: (value: string) => set({ nickname: value }),
      setRoomId: (value: string) => set({ roomId: value }),
    }),
    {
      name: 'userInfo',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

export default useUser;
