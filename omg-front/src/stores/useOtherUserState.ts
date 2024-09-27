import { create } from 'zustand';

interface OtherUserState {
  otherUsers: Array<{
    id: string;
    characterType: number;
    position: number[];
    direction: number[];
  }>;
  setOtherUsers: (
    users: Array<{
      id: string;
      characterType: number;
      position: number[];
      direction: number[];
    }>,
  ) => void;
  updateUserPosition: (
    id: string,
    position: number[],
    direction: number[],
  ) => void;
}

export const useOtherUserStore = create<OtherUserState>(set => ({
  otherUsers: [],
  setOtherUsers: users => set({ otherUsers: users }),
  updateUserPosition: (id, position) =>
    set(state => ({
      otherUsers: state.otherUsers.map(user =>
        user.id === id ? { ...user, position } : user,
      ),
    })),
}));
