import { useEffect, useRef, useState } from 'react';

import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface Props {
  onMovementChange: (movementState: 'idle' | 'walking' | 'running') => void;
  onRotationChange: (rotation: number) => void;
  onPositionChange: (position: THREE.Vector3) => void;

  characterURL: string;
  isOwnCharacter: boolean;
}

export const useCharacter = ({
  onMovementChange,
  onRotationChange,
  characterURL,
  isOwnCharacter,
}: Props) => {
  const { scene, animations } = useGLTF(characterURL);
  const mixer = useRef<THREE.AnimationMixer | null>(null);
  const [action, setAction] = useState<THREE.AnimationAction | null>(null);
  const [movementState, setMovementState] = useState<
    'idle' | 'walking' | 'running'
  >('idle');
  const [rotation, setRotation] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const clock = useRef(new THREE.Clock());
  const [isRotating, setIsRotating] = useState(false); // 회전 중인지 확인
  const runTimeoutRef = useRef<NodeJS.Timeout | null>(null); // 달리기 상태 타임아웃
  const activeKeys = useRef(new Set<string>()); // 현재 눌린 키 추적

  useEffect(() => {
    if (animations.length > 0 && scene) {
      mixer.current = new THREE.AnimationMixer(scene);
      const idleAction = mixer.current.clipAction(animations[0]);
      idleAction.play();
      setAction(idleAction);
    }
  }, [animations, scene]);

  const setAnimationState = (state: 'idle' | 'walking' | 'running') => {
    if (!mixer.current || !animations.length) return;

    const animationIndex = state === 'idle' ? 0 : state === 'walking' ? 5 : 2;
    const newAction = mixer.current.clipAction(animations[animationIndex]);

    action?.fadeOut(0.2);
    newAction.reset().fadeIn(0.2).play();
    setAction(newAction);
    setMovementState(state);
    onMovementChange(state);
  };

  const rotateCharacterSmoothly = (newRotation: number) => {
    const initialRotation = rotation;
    const duration = 0.05; // 회전이 걸리는 시간
    setIsRotating(true);
    
    const updateRotation = () => {
      const elapsed = clock.current.getElapsedTime();
      const progress = Math.min(elapsed / duration, 1); // 진행률 계산
      const currentRotation = initialRotation + (newRotation - initialRotation) * progress;
      setRotation(currentRotation);
      onRotationChange(currentRotation);

      if (progress < 1) {
        requestAnimationFrame(updateRotation);
      } else {
        setIsRotating(false); // 회전 완료
        if (isMoving) {
          setAnimationState('walking');
        }
      }
    };

    clock.current.start();
    updateRotation();
  };

  const handleMovementStart = (direction: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight') => {
    let newRotation = rotation;
    if (direction === 'ArrowUp') newRotation = 0; // 전방
    if (direction === 'ArrowDown') newRotation = Math.PI; // 후방
    if (direction === 'ArrowLeft') newRotation = Math.PI / 2; // 좌측
    if (direction === 'ArrowRight') newRotation = -Math.PI / 2; // 우측

    if (newRotation !== rotation) {
      // 새로운 방향으로 회전 필요
      rotateCharacterSmoothly(newRotation);
    } else {
      // 이미 회전 완료, 바로 걷기 상태로
      setAnimationState('walking');
    }

  runTimeoutRef.current = setTimeout(() => {
    if (isMoving) {
      setAnimationState('running'); 
    }
  }, 200); 
};

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isOwnCharacter) return;

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      activeKeys.current.add(event.key); // 누른 키 추가


    // 이미 이동 중이 아니라면 이동 시작 처리
    if (!isMoving) {

      handleMovementStart(event.key as 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight');
      setIsMoving(true);

    }
  }
  };
  
  const handleKeyUp = (event: KeyboardEvent) => {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;

    activeKeys.current.delete(event.key); // 떼어진 키 제거

    if (activeKeys.current.size > 0) {
      // 아직 눌린 키가 있으면 계속 이동
      const remainingKey = [...activeKeys.current][0]; 
      handleMovementStart(remainingKey as 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight');
    } else {
      setAnimationState('idle');
      setIsMoving(false);

      if (runTimeoutRef.current) {
        clearTimeout(runTimeoutRef.current);
        runTimeoutRef.current = null;
      }
    }
  };


  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return { scene, mixer };
};