import { Route, Routes } from 'react-router-dom';

import loadable from '@loadable/component';

const Login = loadable(() => import('@/pages/Login'), {
  fallback: <div>로그인 로딩중</div>,
});
const Waiting = loadable(() => import('@/pages/Waiting'), {
  fallback: <div>대기방 로딩중</div>,
});
const Game = loadable(() => import('@/pages/Game'), {
  fallback: <div>게임화면 로딩중</div>,
});
const MainMap = loadable(() => import('@/pages/MainMap'), {
  fallback: <div>메인 맵 로딩중</div>,
});

export default function App() {
  return (
    <Routes>
      <Route path='/' element={<Login />}></Route>
      <Route path='/waiting' element={<Waiting />}></Route>
      <Route path='/game' element={<Game />}></Route>
      <Route path='/mainmap' element={<MainMap />}></Route>
    </Routes>
  );
}
