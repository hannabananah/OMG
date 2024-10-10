import create from 'zustand';

interface AlertStore {
  isStockChangeAlertVisible: boolean;
  stockChangeAlertMessage: string | null;
  setStockChangeAlertVisible: (visible: boolean) => void;
  setStockChangeAlertMessage: (message: string) => void;
}

export const useAlertStore = create<AlertStore>(set => ({
  isStockChangeAlertVisible: false,
  stockChangeAlertMessage: null,
  setStockChangeAlertVisible: (visible: boolean) =>
    set({ isStockChangeAlertVisible: visible }),
  setStockChangeAlertMessage: (message: string) =>
    set({ stockChangeAlertMessage: message }),
}));
