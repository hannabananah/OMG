import { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import './index.css';

const App = lazy(() => import('./App'));

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <BrowserRouter>
      <Suspense fallback={<div>앱 불러오는 중...</div>}>
        <App />
      </Suspense>
    </BrowserRouter>,
  );
} else {
  console.error('Root 요소를 찾을 수 없습니다.');
}
