import { create } from 'zustand';

interface ModalStore {
  modals: { [playerNickname: string]: { [modalId: string]: boolean } };
  openModal: (modalId: string, playerNickname: string) => void;
  closeModal: (modalId: string, playerNickname: string) => void;
}

export const useModalStore = create<ModalStore>(set => ({
  modals: {},
  openModal: (modalId, playerNickname) =>
    set(state => ({
      modals: {
        ...state.modals,
        [playerNickname]: {
          // 플레이어의 모달 상태가 없을 경우 빈 객체로 초기화
          ...(state.modals[playerNickname] || {}),
          [modalId]: true,
        },
      },
    })),
  closeModal: (modalId, playerNickname) =>
    set(state => ({
      modals: {
        ...state.modals,
        [playerNickname]: {
          ...(state.modals[playerNickname] || {}),
          [modalId]: false,
        },
      },
    })),
}));
