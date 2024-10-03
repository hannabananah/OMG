import { useEffect, useRef, useState } from 'react';

import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  characterPosition: THREE.Vector3;
  rotation: number;
  isTransitioning: boolean;
}

export default function Camera({
  characterPosition,
  rotation,
  isTransitioning,
}: Props): JSX.Element | null {
  const { camera } = useThree();
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const zoomStartTime = useRef(0);
  const transitionDuration = 3; // 줌인 전환 시간
  const offset = new THREE.Vector3(0, 5, -10); // 카메라 기본 오프셋
  const animateId = useRef<number>();

  // 부드러운 카메라 이동 함수
  const smoothTransition = (
    currentPos: THREE.Vector3,
    targetPos: THREE.Vector3,
    easeProgress: number,
  ) => {
    camera.position.lerp(targetPos, easeProgress);
    camera.lookAt(characterPosition);
  };

  useEffect(() => {
    if (isTransitioning) {
      zoomStartTime.current = performance.now();
      setIsZoomedIn(true);
    }
  }, [isTransitioning]);

  useEffect(() => {
    if (isZoomedIn) {
      const handleZoomIn = () => {
        const elapsedTime = (performance.now() - zoomStartTime.current) / 1000;
        const progress = Math.min(elapsedTime / transitionDuration, 1);
        const easeProgress = easeInOutCubic(progress);

        const zoomOffset = offset.clone().multiplyScalar(1 - easeProgress);
        const zoomedPosition = characterPosition.clone().add(zoomOffset);
        camera.position.lerp(zoomedPosition, easeProgress);

        if (progress === 1) {
          setIsZoomedIn(false);
        }
      };

      const animate = () => {
        if (isZoomedIn) {
          handleZoomIn();
          requestAnimationFrame(animate);
        }
      };
      animate();
    }
  }, [isZoomedIn, characterPosition]);

  useEffect(() => {
    if (!isZoomedIn) {
      // 캐릭터의 뒤를 따라가는 기본 카메라 오프셋 적용
      const cameraOffset = offset.clone();
      cameraOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotation);
      const newCameraPosition = characterPosition.clone().add(cameraOffset);

      camera.position.lerp(newCameraPosition, 0.1);
      camera.lookAt(characterPosition);
    }
  }, [characterPosition, rotation, isZoomedIn]);

  return null;
}

// 이징 함수: 부드러운 애니메이션을 위해 사용
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
