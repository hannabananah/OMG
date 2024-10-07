import { create } from 'zustand';

interface OtherUserState {
  otherUsers: Array<{
    id: string;
    characterType: number;
    position: number[];
    direction: number[];
    actionToggle: boolean;
  }>;
  setOtherUsers: (
    users: Array<{
      id: string;
      characterType: number;
      position: number[];
      direction: number[];
      actionToggle: boolean;
    }>,
  ) => void;
  updateUserPosition: (
    id: string,
    position: number[],
    direction: number[],
    actionToggle: boolean,
  ) => void;

  transactionMessage: string | null;
  setTransactionMessage: (message: string) => void;
}

export const useOtherUserStore = create<OtherUserState>(set => ({
  otherUsers: [],
  setOtherUsers: users => set({ otherUsers: users }),
  updateUserPosition: (id, position, direction, actionToggle) =>
    set(state => ({
      otherUsers: state.otherUsers.map(user =>
        user.id === id ? { ...user, position, direction, actionToggle } : user,
      ),
    })),

  transactionMessage: null,
  setTransactionMessage: message => set({ transactionMessage: message }),
}));
