import { create } from 'zustand';
// 상태 지속적으로 저장
import { createJSONStorage, persist } from 'zustand/middleware';

interface IntroStore {
  showIntro: boolean;
  setShowIntro: () => void;
}

export const useIntroStore = create<IntroStore>()(
  persist(
    set => ({
      showIntro: false,
      setShowIntro: () => {
        set(state => ({ ...state, showIntro: false }));
      },
    }),
    {
      name: 'intro-animation',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
