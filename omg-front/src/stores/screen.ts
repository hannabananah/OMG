import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// 화면 타입을 정의하는 유니온 타입
type ScreenType = 'MAINMAP' | 'MATCHING';

// 스크린 컨트롤 상태 인터페이스 정의
interface ScreenControlStore {
  screen: ScreenType;
  showIntro: boolean;
  // setScreen: (newScreen: ScreenType) => void;
  setMainScreen: () => void;
  setShowIntro: () => void;
  setHideIntro: () => void;
}

export const useScreenControl = create<ScreenControlStore>()(
  persist(
    set => ({
      // 초기 상태
      screen: 'MAINMAP',
      showIntro: false,

      // 인트로 표시 상태를 true로 설정
      setShowIntro: () => {
        set(state => ({ ...state, showIntro: true }));
      },

      setHideIntro: () => {
        set(state => ({ ...state, showIntro: false })); // 인트로 후에 이 값을 false로 설정
      },

      // setScreen: newScreen => {
      //   set(state => ({ ...state, screen: newScreen }));
      // },

      setMainScreen: () => {
        set(state => ({ ...state, screen: 'MAINMAP' }));
      },
    }),
    {
      // persist 미들웨어 설정
      name: 'intro-animation',
      storage: createJSONStorage(() => sessionStorage),
      // showIntro 상태만 저장
      partialize: state => ({ showIntro: state.showIntro }),
    },
  ),
);
