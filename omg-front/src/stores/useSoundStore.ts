import { create } from 'zustand';

interface SoundStore {
  bgm: HTMLAudioElement | null;
  isMuted: boolean;
  setBgm: (audio: HTMLAudioElement) => void;
  toggleMute: () => void;
  playNotificationSound: () => void;
  playSuccessStockSound: () => void;
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

  playNotificationSound: () => {
    const alertSound = new Audio('/music/bell-alert.mp3');
    alertSound.play();
    setTimeout(() => {
      set(state => {
        if (state.bgm && !state.isMuted) {
          state.bgm.play();
        }
        return {};
      });
    }, 2000);
  },

  playSuccessStockSound: () => {
    const alertSound = new Audio('/music/stock-alert.mp3');
    alertSound.play();

    setTimeout(() => {
      set(state => {
        if (state.bgm && !state.isMuted) {
          state.bgm.play();
        }
        return {};
      });
    }, 2000);
  },
}));
