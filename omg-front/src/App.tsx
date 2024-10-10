import { lazy } from 'react';
import Modal from 'react-modal';
import { Route, Routes } from 'react-router-dom';

import SocketProvider from '@/utils/SocketContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

Modal.setAppElement('#root');

const Lobby = lazy(() => import('@/pages/Lobby'));
const Waiting = lazy(() => import('@/pages/Waiting'));
const Game = lazy(() => import('@/pages/Game'));

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
      </Routes>
    </QueryClientProvider>
  );
}
