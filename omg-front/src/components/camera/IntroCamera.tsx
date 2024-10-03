import { useEffect, useRef, useState } from 'react';

import { PerspectiveCamera } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { useIntroStore } from '../../stores/intro';

interface IntroCameraProps {
  characterPosition: THREE.Vector3;
}

export default function IntroCamera({ characterPosition }: IntroCameraProps) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const { showIntro, setShowIntro } = useIntroStore();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionStartTime = useRef(0);
  const startPosition = useRef(new THREE.Vector3());
  const startDirection = useRef(new THREE.Vector3());
  const radius = 100;
  const speed = 0.85;
  const transitionDuration = 4; // 전환 애니메이션 지속 시간

  // 초기 카메라 설정을 위한 useEffect
  useEffect(() => {
    if (!cameraRef.current || showIntro) return;

    const camera = cameraRef.current;

    // 캐릭터 위치 기반으로 카메라 위치 설정
    camera.position.set(
      characterPosition.x,
      characterPosition.y - 3,
      characterPosition.z - 11.3,
    );

    // 카메라가 캐릭터를 바라보도록 설정
    camera.lookAt(characterPosition);

    // 카메라 회전 설정
    camera.rotation.set(0, Math.PI, 0);
  }, [characterPosition, showIntro]);

  useFrame((state, delta) => {
    if (!cameraRef.current) return;

    const camera = cameraRef.current;
    const elapsedTime = state.clock.getElapsedTime();

    if (showIntro) {
      const targetZoom = 5;
      const x = Math.cos(elapsedTime * speed) * radius;
      const z = Math.sin(elapsedTime * speed) * radius;

      // 줌인 애니메이션을 적용하면서 원을 돌게 만듦
      const zoomFactor = Math.max(20 - elapsedTime * 2, targetZoom);
      camera.position.set(x - 10, zoomFactor + 20, z); // 카메라 위치 수정
      camera.lookAt(-1, 0, 0);

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

      // 줌인 후 카메라 최종 위치
      const targetPosition = new THREE.Vector3(
        characterPosition.x,
        characterPosition.y - 3,
        characterPosition.z - 11.3,
      );

      camera.position.lerp(targetPosition, easeProgress);

      const targetDirection = new THREE.Vector3(
        characterPosition.x,
        characterPosition.y,
        characterPosition.z,
      )
        .sub(targetPosition)
        .normalize();

      const currentDirection = new THREE.Vector3().lerpVectors(
        startDirection.current,
        targetDirection,
        easeProgress,
      );

      const lookAtPosition = camera.position.clone().add(currentDirection);
      camera.lookAt(lookAtPosition);

      const targetRotation = new THREE.Euler(0, Math.PI, 0);
      camera.rotation.x = THREE.MathUtils.lerp(
        camera.rotation.x,
        targetRotation.x,
        easeProgress,
      );
      camera.rotation.y = THREE.MathUtils.lerp(
        camera.rotation.y,
        targetRotation.y,
        easeProgress,
      );
      camera.rotation.z = THREE.MathUtils.lerp(
        camera.rotation.z,
        targetRotation.z,
        easeProgress,
      );

      if (progress === 1) {
        setIsTransitioning(false);
      }
    }
  });

  return <PerspectiveCamera ref={cameraRef} makeDefault near={3} />;
}

// 이징 함수: 부드러운 애니메이션을 위해 사용
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
