import { useRef, useState } from 'react';

import { PerspectiveCamera } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { useIntroStore } from '../../stores/intro';

export default function IntroCamera() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const { showIntro, setShowIntro } = useIntroStore();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionStartTime = useRef(0);
  const startPosition = useRef(new THREE.Vector3());
  const startDirection = useRef(new THREE.Vector3());
  const radius = 100; // 원의 반지름
  const speed = 0.85; // 카메라 회전 속도
  const transitionDuration = 4; // 전환 애니메이션 지속 시간

  useFrame((state, delta) => {
    if (!cameraRef.current) return;

    const camera = cameraRef.current;
    const elapsedTime = state.clock.getElapsedTime();

    if (showIntro) {
      const targetZoom = 5;

      // 카메라 원형 회전
      const x = Math.cos(elapsedTime * speed) * radius;
      const z = Math.sin(elapsedTime * speed) * radius;

      // 줌인 애니메이션을 적용하면서 원을 돌게 만듦
      const zoomFactor = Math.max(20 - elapsedTime * 2, targetZoom); // 점진적 줌인
      camera.position.set(x - 10, zoomFactor + 20, z); // 카메라 위치 수정
      camera.lookAt(-1, 0, 0); // 맵의 중심을 바라봄

      // 줌이 완료되면 상태를 업데이트
      if (zoomFactor <= targetZoom) {
        setShowIntro();
        setIsTransitioning(true);
        transitionStartTime.current = elapsedTime;
        startPosition.current.copy(camera.position);
        camera.getWorldDirection(startDirection.current);
      }
    } else if (isTransitioning) {
      const transitionTime = elapsedTime - transitionStartTime.current;
      const progress = Math.min(transitionTime / transitionDuration, 1);
      const easeProgress = easeInOutCubic(progress); //전환 진행될수록 0에서 1로 증가

      // 회전 움직임 유지
      const currentRadius = radius * (1 - easeProgress * 0.9); // 회전 반경 점진적 감소
      const rotationSpeed = speed * (1 - easeProgress); // 전환이 진행됨에 따라 속도 감소
      const x = Math.cos(elapsedTime * rotationSpeed) * currentRadius;
      const z = Math.sin(elapsedTime * rotationSpeed) * currentRadius;

      // 목표 위치로 카메라를 이동
      const targetPosition = new THREE.Vector3(0, 5, -18);
      const currentPosition = new THREE.Vector3(x, 5, z).lerp(
        targetPosition,
        easeProgress,
      );
      camera.position.copy(currentPosition);

      // 시작 방향에서 목표 방향으로 부드럽게 전환
      const targetDirection = new THREE.Vector3(0, 0, 0)
        .sub(targetPosition)
        .normalize();

      const currentDirection = new THREE.Vector3().lerpVectors(
        startDirection.current,
        targetDirection,
        easeProgress,
      );
      camera.lookAt(camera.position.clone().add(currentDirection));

      if (progress === 1) {
        setIsTransitioning(false);
      }
    }
  });

  // 인트로 이후 새로고침했을 때 카메라 위치
  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[0, 5, -18]}
      fov={40}
    />
  );
}

// 이징 함수: 부드러운 애니메이션을 위해 사용
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
