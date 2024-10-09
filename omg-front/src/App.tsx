import Modal from 'react-modal';
import { Route, Routes } from 'react-router-dom';

import SocketProvider from '@/utils/SocketContext';
import loadable from '@loadable/component';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

Modal.setAppElement('#root');

const Lobby = loadable(() => import('@/pages/Lobby'), {
  fallback: <div>로비 입장 로딩중</div>,
});
const Waiting = loadable(() => import('@/pages/Waiting'), {
  fallback: <div>대기방 로딩중</div>,
});
const Game = loadable(() => import('@/pages/Game'), {
  fallback: <div>게임화면 로딩중</div>,
});
const MainMap = loadable(() => import('@/components/main-map/MainMap'), {
  fallback: <div>메인 맵 로딩중</div>,
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path='/' element={<Lobby />} />

        <Route
          path='/waiting/:roomId'
          element={
            <SocketProvider>
              <Waiting />
            </SocketProvider>
          }
        />

        <Route
          path='/game/:roomId'
          element={
            <SocketProvider>
              <Game />
            </SocketProvider>
          }
        />

        <Route
          path='/mainmap'
          element={
            <SocketProvider>
              <MainMap />
            </SocketProvider>
          }
        />
      </Routes>
    </QueryClientProvider>
  );
}
