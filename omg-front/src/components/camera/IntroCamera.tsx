import { useEffect, useRef, useState } from 'react';

import useModalStore from '@/stores/useModalStore';
import { PerspectiveCamera } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { useIntroStore } from '../../stores/useIntroStore';

interface IntroCameraProps {
  characterPosition: THREE.Vector3;
  characterDirection: THREE.Vector3;
  characterRotation: THREE.Euler;
  scale: number[];
  isInLoanMarketZone: boolean;
}

export default function IntroCamera({
  characterPosition,
  characterDirection,
  characterRotation,
  scale,
  isInLoanMarketZone,
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

  const { openModal } = useModalStore();

  const [isCircling, setIsCircling] = useState(false);
  const loanRoomTarget = new THREE.Vector3(
    50.934777281838066,
    0,
    77.69974776769165,
  );
  const circleRadius = 10;
  const circleSpeed = 0.02;
  const [circleProgress, setCircleProgress] = useState(0);

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

    camera.lookAt(characterPosition);

    // 카메라 회전 설정
    camera.rotation.set(0, Math.PI, 0);
  }, [characterPosition, showIntro]);

  useEffect(() => {
    if (isInLoanMarketZone && !isCircling) {
      setIsCircling(true); // 대출방에 진입하면 카메라 원 이동 시작
    }
  }, [isInLoanMarketZone]);

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
        startRotation.current.copy(camera.rotation);
      }
    } else if (isTransitioning) {
      const transitionTime = elapsedTime - transitionStartTime.current;
      const progress = Math.min(transitionTime / transitionDuration, 1);
      const easeProgress = easeInOutCubic(progress); //전환 진행될수록 0에서 1로 증가

      // 회전 움직임 유지 - 수정
      const currentRadius = radius * (1 - easeProgress * 0.9); // 회전 반경 점진적 감소
      const rotationSpeed = speed * (1 - easeProgress); // 전환이 진행됨에 따라 속도 감소
      const roundX = Math.cos(elapsedTime * rotationSpeed) * currentRadius;
      const roundZ = Math.sin(elapsedTime * rotationSpeed) * currentRadius;

      // 줌인 후 카메라 최종 위치
      const targetPosition = new THREE.Vector3(
        characterPosition.x,
        characterPosition.y - 3,
        characterPosition.z - 11.3,
      );
      const currentPosition = new THREE.Vector3(
        roundX,
        characterPosition.y - 3,
        roundZ,
      ).lerp(targetPosition, easeProgress);
      camera.position.copy(currentPosition);

      //최종 카메라 방향 - 시작 방향에서 목표 방향으로 전환
      const targetDirection = characterDirection.clone().normalize();

      const currentDirection = new THREE.Vector3().lerpVectors(
        startDirection.current,
        targetDirection,
        easeProgress,
      );

      const lookAtPosition = camera.position.clone().add(currentDirection);
      camera.lookAt(lookAtPosition);

      if (progress === 1) {
        setIsTransitioning(false);
      }
    } else {
      if (isCircling) {
        const angle = circleProgress * Math.PI * 2;
        camera.position.set(
          loanRoomTarget.x + Math.cos(angle) * circleRadius,
          loanRoomTarget.y + 5,
          loanRoomTarget.z + Math.sin(angle) * circleRadius,
        );
        camera.lookAt(loanRoomTarget);

        setCircleProgress(prev => prev + circleSpeed * delta);

        if (circleProgress >= 1) {
          setIsCircling(false);
          setCircleProgress(0);
          openModal('loanMarket', 'nickname');
        }
      } else {
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

        const currentDirection = new THREE.Vector3().lerpVectors(
          startDirection.current,
          targetDirection,
          0.5,
        );

        const lookAtPosition = camera.position.clone().add(currentDirection);
        camera.lookAt(lookAtPosition);
      }
    }
  });

  return <PerspectiveCamera ref={cameraRef} makeDefault near={3} />;
}

// 이징 함수: 부드러운 애니메이션을 위해 사용
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
