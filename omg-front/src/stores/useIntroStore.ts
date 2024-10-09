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
      showIntro: true, // 처음에는 true로 설정
      setShowIntro: () => {
        set({ showIntro: false }); // 호출되면 false로 변경
      },
    }),
    {
      name: 'intro-animation',
      storage: createJSONStorage(() => sessionStorage), // 세션 스토리지에 상태 저장
    },
  ),
);
