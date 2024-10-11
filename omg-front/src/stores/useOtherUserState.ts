import { create } from 'zustand';

interface OtherUserState {
  otherUsers: Array<{
    id: string;
    characterType: number;
    position: number[];
    startPosition: number[];
    direction: number[];
    actionToggle: boolean;
    isTrading: boolean;
    isCarrying: boolean;
    animation: 'idle' | 'walking' | 'running';
  }>;
  setOtherUsers: (
    users: Array<{
      id: string;
      characterType: number;
      position: number[];
      startPosition: number[];
      direction: number[];
      actionToggle: boolean;
      isTrading: boolean;
      isCarrying: boolean;
      animation: 'idle' | 'walking' | 'running';
    }>,
  ) => void;
  updateUserPosition: (
    id: string,
    position: number[],
    direction: number[],
    actionToggle: boolean,
    isTrading: boolean,
    isCarrying: boolean,
    animation: 'idle' | 'walking' | 'running',
  ) => void;

  transactionMessage: {
    userNickname: string;
    message: string;
  } | null;
  setTransactionMessage: (userNickname: string, message: string) => void;
}

export const useOtherUserStore = create<OtherUserState>(set => ({
  otherUsers: [],
  setOtherUsers: users => set({ otherUsers: users }),
  updateUserPosition: (
    id,
    position,
    direction,
    actionToggle,
    isTrading,
    isCarrying,
    animation,
  ) =>
    set(state => ({
      otherUsers: state.otherUsers.map(user =>
        user.id === id
          ? {
              ...user,
              position,
              direction,
              actionToggle,
              isTrading,
              isCarrying,
              animation,
            }
          : user,
      ),
    })),

  transactionMessage: null,
  setTransactionMessage: (userNickname, message) =>
    set({
      transactionMessage: {
        userNickname,
        message,
      },
    }),
}));
