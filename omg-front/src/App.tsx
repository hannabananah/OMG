import Modal from 'react-modal';
import { Route, Routes } from 'react-router-dom';

import SocketProvider from '@/utils/SocketContext';
import loadable from '@loadable/component';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

Modal.setAppElement('#root');

const Login = loadable(() => import('@/pages/Login'), {
  fallback: <div>로그인 로딩중</div>,
});
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
const StockMarket = loadable(() => import('@/pages/StockMarket'), {
  fallback: <div>주식 시장 로드중</div>,
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/lobby' element={<Lobby />} />

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

        <Route
          path='/stockmarket'
          element={
            <SocketProvider>
              <StockMarket />
            </SocketProvider>
          }
        />
      </Routes>
    </QueryClientProvider>
  );
}
