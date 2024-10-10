import { useEffect, useRef, useState } from 'react';

import { PerspectiveCamera } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { useIntroStore } from '../../stores/useIntroStore';

interface IntroCameraProps {
  characterPosition: THREE.Vector3;
  characterDirection: THREE.Vector3;
  isModalOpen: boolean;
  setIsCircling: React.Dispatch<React.SetStateAction<boolean>>;
  marketType: 'loanMarket' | 'stockMarket' | 'goldMarket' | null;
}

export default function IntroCamera({
  characterPosition,
  characterDirection,
  isModalOpen,
  setIsCircling,
  marketType,
}: IntroCameraProps) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const { showIntro, setShowIntro } = useIntroStore();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionStartTime = useRef(0);
  const startPosition = useRef(new THREE.Vector3());
  const startDirection = useRef(new THREE.Vector3());
  const startRotation = useRef(new THREE.Euler());
  const radius = 100;
  const speed = 0.85;
  const transitionDuration = 4; // 전환 애니메이션 지속 시간

  const loanMarketTarget = new THREE.Vector3(
    44.80202477299613,
    0,
    72.08060339923867,
  );
  const stockMarketTarget = new THREE.Vector3(
    45.1858401585588,
    0,
    8.732926525388786,
  );
  const goldMarketTarget = new THREE.Vector3(
    -12.130037404695917,
    0,
    -28.586191813284028,
  );
  const circleRadius = 8;
  const circleSpeed = 0.3;
  const [circleProgress, setCircleProgress] = useState(0);

  // 초기 카메라 설정
  useEffect(() => {
    if (!cameraRef.current || showIntro) return;

    const camera = cameraRef.current;

    // 캐릭터 위치 기반으로 카메라 위치 설정
    camera.position.set(
      characterPosition.x,
      characterPosition.y - 3,
      characterPosition.z - 11.3,
    );

    camera.lookAt(characterPosition);

    // 카메라 회전 설정
    camera.rotation.set(0, Math.PI, 0);
  }, [characterPosition, showIntro]);

  useFrame((state, delta) => {
    if (!cameraRef.current) return;

    const camera = cameraRef.current;
    const elapsedTime = state.clock.getElapsedTime();

    // 원 그리면서 전체 맵 돌기
    if (showIntro) {
      const targetZoom = 5;
      const x = Math.cos(elapsedTime * speed) * radius;
      const z = Math.sin(elapsedTime * speed) * radius;

      const zoomFactor = Math.max(20 - elapsedTime * 2, targetZoom);
      camera.position.set(x - 10, zoomFactor + 20, z); // 카메라 위치 수정
      camera.lookAt(-1, 0, 0);

      if (zoomFactor <= targetZoom) {
        setIsTransitioning(true);
        transitionStartTime.current = elapsedTime;
        startPosition.current.copy(camera.position);
        camera.getWorldDirection(startDirection.current);
        startRotation.current.copy(camera.rotation);
        setShowIntro();
      }
    } // 전체 맵 다 돌고 캐릭터 줌인하면서 카메라 전환 중
    else if (isTransitioning) {
      const transitionTime = elapsedTime - transitionStartTime.current;
      const progress = Math.min(transitionTime / transitionDuration, 1);
      const easeProgress = easeInOutCubic(progress); //전환 진행될수록 0에서 1로 증가

      const currentRadius = radius * (1 - easeProgress * 0.9);
      const rotationSpeed = speed * (1 - easeProgress);
      const roundX = Math.cos(elapsedTime * rotationSpeed) * currentRadius;
      const roundZ = Math.sin(elapsedTime * rotationSpeed) * currentRadius;

      // 줌인 후 카메라 최종 위치
      const targetPosition = new THREE.Vector3(
        characterPosition.x,
        characterPosition.y - 3,
        characterPosition.z - 11.3,
      );
      // current 붙은 거는 원 그리면서 이동할 때만 필요
      const currentPosition = new THREE.Vector3(
        roundX,
        characterPosition.y - 3,
        roundZ,
      ).lerp(targetPosition, easeProgress);
      camera.position.copy(currentPosition);

      //최종 카메라 방향 - 시작 방향에서 목표 방향으로 전환
      const targetDirection = characterDirection.clone().normalize();

      const currentDirection = new THREE.Vector3().lerpVectors(
        startDirection.current, // 초기 카메라 방향
        targetDirection, // 캐릭터 목표 방향
        easeProgress,
      );

      const lookAtPosition = camera.position.clone().add(currentDirection);
      camera.lookAt(lookAtPosition);

      if (progress === 1) {
        setIsTransitioning(false);
      }
    }
    // showintro, 캐릭터 줌인 끝나고 캐릭터 따라다니는 카메라 상태
    else {
      // 1. 거래소 제외한 일반 캐릭터 카메라 - 기본(코드 수정하면 안됨)
      if (!isModalOpen) {
        console.log('대출방 여기 찍히나요?');
        const cameraDistance = 15; // 카메라와 캐릭터 사이의 거리

        // 캐릭터의 방향 벡터에서 카메라가 뒤에 위치하도록 설정
        const directionNormalized = characterDirection.clone().normalize();

        // 카메라의 새로운 위치는 캐릭터의 위치에서 'direction'의 반대 방향으로 cameraDistance만큼 떨어진 위치
        const cameraOffset =
          directionNormalized.multiplyScalar(-cameraDistance);

        // 캐릭터의 위치에서 카메라를 배치할 위치 계산
        const newCameraPosition = new THREE.Vector3(
          characterPosition.x + cameraOffset.x,
          characterPosition.y - 1, // 카메라가 캐릭터 위에 위치하게 설정
          characterPosition.z + cameraOffset.z,
        );

        // 카메라의 새로운 위치 설정
        camera.position.copy(newCameraPosition);

        const targetDirection = characterDirection.clone().normalize();

        const lookAtPosition = camera.position.clone().add(targetDirection);
        camera.lookAt(lookAtPosition);

        setCircleProgress(0);
      }
      // 2. 거래소 진입해서 원 돌 때
      else if (circleProgress < 1) {
        console.log('대출방 관련 되서 테스트1');
        let targetPosition;

        if (marketType === 'loanMarket') {
          targetPosition = loanMarketTarget;
        } else if (marketType === 'stockMarket') {
          targetPosition = stockMarketTarget;
        } else if (marketType === 'goldMarket') {
          targetPosition = goldMarketTarget;
        }

        const angle = circleProgress * (Math.PI / 3);
        camera.position.set(
          targetPosition.x + Math.cos(angle) * circleRadius,
          targetPosition.y + 1,
          targetPosition.z + Math.sin(angle) * circleRadius,
        );
        camera.lookAt(targetPosition);

        setCircleProgress(prev => prev + circleSpeed * delta);

        // 회전 완료
        if (circleProgress >= 0.9) {
          // 서클링 종료 후 카메라 위치 고정
          camera.position.set(
            targetPosition.x,
            targetPosition.y,
            targetPosition.z,
          );
          camera.lookAt(targetPosition);
          setCircleProgress(1);
          setIsCircling(false);
        }
      }
    }
  });

  return <PerspectiveCamera ref={cameraRef} makeDefault near={3} />;
}

// 이징 함수: 부드러운 애니메이션을 위해 사용
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
