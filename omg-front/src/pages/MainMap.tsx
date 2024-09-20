import { Suspense, useEffect, useState } from 'react';

import Mickey from '@/components/character/Mickey';
import Map from '@/components/main-map/Map';
import { Canvas } from '@react-three/fiber';

export default function MainMap() {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);

  // 컴포넌트가 처음 렌더링될 때 시작 시간 기록
  useEffect(() => {
    setStartTime(performance.now());
  }, []);

  // 로드가 완료되면 종료 시간 기록
  const handleLoadComplete = () => {
    setEndTime(performance.now());
  };

  // 시간을 계산하여 콘솔에 출력
  useEffect(() => {
    if (startTime !== null && endTime !== null) {
      const loadTime = endTime - startTime;
      console.log(`3D 객체 로딩에 걸린 시간: ${loadTime}ms`);
    }
  }, [startTime, endTime]);

  return (
    <div className='relative w-full h-screen p-1'>
      <Canvas camera={{ position: [0, 4, 10], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Suspense fallback={null}>
          <Map />
          <Mickey position={[0, -1.5, 0]} onLoadComplete={handleLoadComplete} />
        </Suspense>
      </Canvas>
    </div>
  );
}
