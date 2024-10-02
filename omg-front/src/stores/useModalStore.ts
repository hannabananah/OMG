import { create } from 'zustand';

interface ModalState {
  modals: { [key: string]: boolean };
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
}

const useModalStore = create<ModalState>(set => ({
  modals: {},
  openModal: modalId =>
    set(state => ({
      modals: { ...state.modals, [modalId]: true },
    })),
  closeModal: modalId =>
    set(state => ({
      modals: { ...state.modals, [modalId]: false },
    })),
}));

export default useModalStore;
