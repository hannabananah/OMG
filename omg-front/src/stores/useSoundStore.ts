import { create } from 'zustand';

interface SoundStore {
  bgm: HTMLAudioElement | null;
  isMuted: boolean;
  setBgm: (audio: HTMLAudioElement) => void;
  toggleMute: () => void;
  playNotificationSound: () => void;
  playSuccessStockSound: () => void;
  playSuccessLoanSound: () => void;
  playSuccessGoldSound: () => void;
  playGetItemSound: () => void;
  playGetCoinSound: () => void;
  playGetChatAlertSound: () => void;
  playClickChatSound: () => void;
  playTypingSound: () => void;
  playLeftTimeAlertSound: () => void;
  playEndRoundSound: () => void;
  playChangePriceSound: () => void;
  playFinishGameSound: () => void;
  pauseBgmTemporarily: () => Promise<void>;
}

export const useSoundStore = create<SoundStore>(set => ({
  bgm: null,
  isMuted: false,
  setBgm: bgm => set({ bgm }),
  toggleMute: () =>
    set(state => {
      if (state.bgm) {
        state.isMuted ? state.bgm.play() : state.bgm.pause();
      }
      return { isMuted: !state.isMuted };
    }),

  pauseBgmTemporarily: async () => {
    set(state => {
      if (state.bgm) {
        state.bgm.pause();
      }
      return {};
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    set(state => {
      if (state.bgm && !state.isMuted) {
        state.bgm.play();
      }
      return {};
    });
  },

  playNotificationSound: () => {
    const alertSound = new Audio('/music/bell-alert.mp3');
    useSoundStore.getState().pauseBgmTemporarily();
    alertSound.play();
  },

  playSuccessStockSound: () => {
    const alertSound = new Audio('/music/stock-alert.mp3');
    alertSound.play();
  },

  playSuccessLoanSound: () => {
    const alertSound = new Audio('/music/loan-alert.mp3');
    alertSound.play();
  },

  playSuccessGoldSound: () => {
    const alertSound = new Audio('/music/gold-alert.mp3');
    useSoundStore.getState().pauseBgmTemporarily();

    alertSound.play();

    setTimeout(() => {
      alertSound.pause();
      alertSound.currentTime = 0;
    }, 2000);
  },

  playGetItemSound: () => {
    const alertSound = new Audio('/music/get-item-alert.mp3');
    alertSound.play();
  },

  playGetCoinSound: () => {
    const alertSound = new Audio('/music/get-coin-alert.mp3');
    alertSound.play();
  },

  playGetChatAlertSound: () => {
    const alertSound = new Audio('/music/chat-alert.mp3');
    useSoundStore.getState().pauseBgmTemporarily();
    alertSound.play();
  },

  playClickChatSound: () => {
    const alertSound = new Audio('/music/click-chat-alert.mp3');
    alertSound.play();
  },

  playTypingSound: () => {
    const alertSound = new Audio('/music/typing-sound.mp3');
    alertSound.play();
  },

  playLeftTimeAlertSound: () => {
    const alertSound = new Audio('/music/left-time-alert.mp3');
    useSoundStore.getState().pauseBgmTemporarily();
    alertSound.play();
  },

  playEndRoundSound: () => {
    const alertSound = new Audio('/music/round-end-alert.mp3');
    useSoundStore.getState().pauseBgmTemporarily();
    alertSound.play();
  },

  playChangePriceSound: () => {
    const alertSound = new Audio('/music/change-price-alert.mp3');
    useSoundStore.getState().pauseBgmTemporarily();
    alertSound.play();
  },

  playFinishGameSound: () => {
    const alertSound = new Audio('/music/finish-game-alert.mp3');
    useSoundStore.getState().pauseBgmTemporarily();
    alertSound.play();
  },
}));
