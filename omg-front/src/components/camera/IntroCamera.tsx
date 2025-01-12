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
  isColliding: boolean;
}

export default function IntroCamera({
  characterPosition,
  characterDirection,
  isModalOpen,
  setIsCircling,
  marketType,
  isColliding,
}: IntroCameraProps) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const { showIntro, setShowIntro, openTutorialModal } = useIntroStore();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionStartTime = useRef(0);
  const startPosition = useRef(new THREE.Vector3());
  const startDirection = useRef(new THREE.Vector3());
  const startRotation = useRef(new THREE.Euler());
  const radius = 100;
  const speed = 0.85;
  const transitionDuration = 4; // 전환 애니메이션 지속 시간

  const [collisionCameraLocked, setCollisionCameraLocked] = useState(false); // 충돌 후 고정 상태
  const collisionTimeRef = useRef<number | null>(null); // 충돌 시점 기록
  const lastCameraPositionRef = useRef(new THREE.Vector3()); // 마지막 카메라 위치 저장

  const loanMarketTarget = new THREE.Vector3(
    47.54649835206037,
    0,
    98.5218742720992,
  );
  const stockMarketTarget = new THREE.Vector3(
    45.1858401585588,
    0,
    8.732926525388786,
  );
  const goldMarketTarget = new THREE.Vector3(
    -12.130037404695917,
    0,
    -20.586191813284028,
  );
  const circleRadius = 8;
  const circleSpeed = 0.3;
  const [circleProgress, setCircleProgress] = useState(0);

  // [카메라 오류 수정중]
  useEffect(() => {
    if (isColliding) {
      // 충돌이 발생한 경우, 현재 카메라 위치를 저장하고 고정
      lastCameraPositionRef.current.copy(cameraRef.current!.position);
      setCollisionCameraLocked(true);
      collisionTimeRef.current = null; // 충돌이 끝난 후 대기 시간을 위한 타이머 초기화
    } else if (!isColliding && collisionCameraLocked) {
      // 충돌이 끝났을 때 타이머 시작
      if (!collisionTimeRef.current) {
        collisionTimeRef.current = Date.now();
      }
    }
  }, [isColliding]);

  // 1. 초기 카메라 설정 - 이거 건들면 시작 때 다 망함
  useEffect(() => {
    if (!cameraRef.current || showIntro) return;

    const camera = cameraRef.current;
    camera.position.set(
      characterPosition.x,
      characterPosition.y - 3,
      characterPosition.z - 11.3,
    );

    camera.lookAt(characterPosition);
    camera.rotation.set(0, Math.PI, 0);
  }, [characterPosition, showIntro]);

  useFrame((state, delta) => {
    if (!cameraRef.current) return;

    const camera = cameraRef.current;
    const elapsedTime = state.clock.getElapsedTime();

    //  2. 원 그리면서 전체 맵 돌기
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
      return;
    }

    // 3. 캐릭터 줌인하면서 캐릭터 카메라로 전환
    if (isTransitioning) {
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
        openTutorialModal();
      }
      return;
    }

    // 4. 거래소 제외한 일반 캐릭터 카메라 - 기본(코드 수정하면 안됨)
    if (!isModalOpen) {
      const cameraDistance = 15; // 카메라와 캐릭터 사이의 거리

      // 캐릭터의 방향 벡터에서 카메라가 뒤에 위치하도록 설정
      const directionNormalized = characterDirection.clone().normalize();

      // 카메라의 새로운 위치는 캐릭터의 위치에서 'direction'의 반대 방향으로 cameraDistance만큼 떨어진 위치
      const cameraOffset = directionNormalized.multiplyScalar(-cameraDistance);

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
      return;
    }

    if (collisionCameraLocked) {
      // 충돌 중일 때는 마지막 위치로 카메라 고정
      camera.position.copy(lastCameraPositionRef.current);

      // 충돌이 끝난 후 1초 대기 후 다시 캐릭터를 따라감
      if (!isColliding && collisionTimeRef.current) {
        const timeSinceCollision =
          (Date.now() - collisionTimeRef.current) / 1000;
        if (timeSinceCollision >= 1) {
          setCollisionCameraLocked(false); // 1초 후 고정 해제
        }
      }
      return;
    }

    // 5. 거래소 진입해서 원 돌 때
    if (circleProgress < 0.9) {
      let targetPosition;
      let angle;

      if (marketType === 'loanMarket') {
        targetPosition = loanMarketTarget;
        angle = circleProgress * (Math.PI / 3);
      } else if (marketType === 'stockMarket') {
        targetPosition = stockMarketTarget;
        angle = (1 - circleProgress) * (Math.PI / 3);
      } else if (marketType === 'goldMarket') {
        targetPosition = goldMarketTarget;
        angle = (1 - circleProgress) * (Math.PI / 3);
      }

      // const angle = circleProgress * (Math.PI / 3);
      camera.position.set(
        targetPosition.x + Math.cos(angle) * circleRadius,
        targetPosition.y + 1,
        targetPosition.z + Math.sin(angle) * circleRadius,
      );
      camera.lookAt(targetPosition);

      setCircleProgress(prev => prev + circleSpeed * delta);
    }

    // 6. 회전 완료
    if (circleProgress >= 0.9) {
      // 서클링 종료 후 카메라 위치 고정
      let finalPosition;

      if (marketType === 'loanMarket') {
        finalPosition = loanMarketTarget;
      } else if (marketType === 'stockMarket') {
        // targetPosition = stockMarketTarget;
        finalPosition = new THREE.Vector3(
          stockMarketTarget.x + Math.cos(0) * circleRadius,
          stockMarketTarget.y + 1,
          stockMarketTarget.z + Math.sin(0) * circleRadius,
        );
      } else if (marketType === 'goldMarket') {
        // targetPosition = goldMarketTarget;
        // goldMarket은 원의 시작 위치로 고정
        finalPosition = new THREE.Vector3(
          goldMarketTarget.x + Math.cos(0) * circleRadius,
          goldMarketTarget.y + 1,
          goldMarketTarget.z + Math.sin(0) * circleRadius,
        );
      }

      camera.position.set(finalPosition.x, finalPosition.y, finalPosition.z);
      camera.lookAt(
        marketType === 'loanMarket'
          ? loanMarketTarget
          : marketType === 'stockMarket'
            ? stockMarketTarget
            : goldMarketTarget,
      );
      setCircleProgress(1);
      setIsCircling(false);
      return;
    }
  });

  return <PerspectiveCamera ref={cameraRef} makeDefault near={3} />;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
