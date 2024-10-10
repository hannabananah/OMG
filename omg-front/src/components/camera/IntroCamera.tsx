import { useEffect, useRef, useState } from 'react';

import useModalStore from '@/stores/useModalStore';
import useUser from '@/stores/useUser';
import { PerspectiveCamera } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { useIntroStore } from '../../stores/useIntroStore';

interface IntroCameraProps {
  characterPosition: THREE.Vector3;
  characterDirection: THREE.Vector3;
  isInStockMarketZone: boolean;
  isInLoanMarketZone: boolean;
  isInGoldMarketZone: boolean;
  isModalOpen: boolean;
}

export default function IntroCamera({
  characterPosition,
  characterDirection,
  isInStockMarketZone,
  isInLoanMarketZone,
  isInGoldMarketZone,
  isModalOpen,
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

  const { modals, openModal } = useModalStore();
  const { nickname } = useUser();

  const [isCircling, setIsCircling] = useState(false);
  const loanRoomTarget = new THREE.Vector3(
    53.477760993312415,
    0,
    79.89317445200676,
  );
  const circleRadius = 8;
  const circleSpeed = 0.3;
  const [circleProgress, setCircleProgress] = useState(0);

  // 특정 거래소 좌표에 입장/퇴장한 유저에게만 해당 거래소 모달 열고 닫기
  const openModalForPlayer = (modalId: string, playerNickname: string) => {
    if (!modals[playerNickname]?.[modalId]) {
      openModal(modalId, playerNickname);
    }
  };

  // 거래소 진입 시 카메라 전환
  useEffect(() => {
    if (isInLoanMarketZone && !isCircling) {
      setIsCircling(true);
    }
  }, [isInLoanMarketZone]);

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
    } // 인트로, 캐릭터 줌인 끝나고 캐릭터 따라다니는 카메라 상태
    else {
      // 거래소 진입
      if (!isModalOpen) {
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
      } else if (isCircling) {
        console.log('대출방 관련 되서 테스트1');
        openModalForPlayer('loanMarket', nickname);
        const angle = circleProgress * (Math.PI / 3);
        camera.position.set(
          loanRoomTarget.x + Math.cos(angle) * circleRadius,
          loanRoomTarget.y - 2,
          loanRoomTarget.z + Math.sin(angle) * circleRadius,
        );
        camera.lookAt(loanRoomTarget);

        setCircleProgress(prev => prev + circleSpeed * delta);

        // 회전 완료
        if (circleProgress >= 1) {
          // 서클링 종료 후 카메라 위치 고정
          console.log('여기 들어옴? 대출방');
          setCircleProgress(1);
          setIsCircling(false);
        }
      } else {
        // 모달이 열려 있는 동안 카메라가 loanRoomTarget에 고정됨
        console.log('대출방 관련 되서 테스트2');
        camera.position.set(
          loanRoomTarget.x,
          loanRoomTarget.y - 2,
          loanRoomTarget.z,
        );
        camera.lookAt(loanRoomTarget);
      }
    }
  });

  return <PerspectiveCamera ref={cameraRef} makeDefault near={3} />;
}

// 이징 함수: 부드러운 애니메이션을 위해 사용
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
