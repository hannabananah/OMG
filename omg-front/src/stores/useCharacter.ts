import { useCallback, useContext, useEffect, useRef, useState } from 'react';

import { SocketContext } from '@/utils/SocketContext';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface Props {
  onMovementChange: (movementState: 'idle' | 'walking' | 'running') => void;
  onRotationChange: (rotation: number) => void;
  onPositionChange: (position: THREE.Vector3) => void;
  onActionToggleChange: (actionToggle: boolean) => void;

  characterURL: string;
  isOwnCharacter: boolean;
}

export const useCharacter = ({
  onMovementChange,
  onRotationChange,
  characterURL,
  isOwnCharacter,
  onActionToggleChange,
}: Props) => {
  const { scene, animations } = useGLTF(characterURL);
  const mixer = useRef<THREE.AnimationMixer | null>(null);
  const [action, setAction] = useState<THREE.AnimationAction | null>(null);
  const [_movementState, setMovementState] = useState<
    'idle' | 'walking' | 'running'
  >('idle');
  const { allRendered } = useContext(SocketContext);

  const [rotation, setRotation] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const clock = useRef(new THREE.Clock());
  const runTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeKeys = useRef(new Set<string>());

  useEffect(() => {
    if (!allRendered) return;

    if (animations.length > 0 && scene) {
      mixer.current = new THREE.AnimationMixer(scene);
      const idleAction = mixer.current.clipAction(animations[0]);
      idleAction.play();
      setAction(idleAction);
    }
  }, [animations, scene, allRendered]);

  const setAnimationState = (state: 'idle' | 'walking' | 'running') => {
    if (!mixer.current) return;

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
    const duration = 0.05;
    const updateRotation = () => {
      const elapsed = clock.current.getElapsedTime();
      const progress = Math.min(elapsed / duration, 1);
      const currentRotation =
        initialRotation + (newRotation - initialRotation) * progress;
      setRotation(currentRotation);
      onRotationChange(currentRotation);

      if (progress < 1) {
        requestAnimationFrame(updateRotation);
      } else {
        if (isMoving) {
          setAnimationState('walking');
        }
      }
    };

    clock.current.start();
    updateRotation();
  };

  const handleMovementStart = (
    direction: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight',
  ) => {
    let newRotation = rotation;

    // 만약 회전이 필요하다면 회전 적용
    if (newRotation !== rotation) {
      rotateCharacterSmoothly(newRotation);
    } else {
      setAnimationState('walking');
    }
    // 일정 시간 후 달리기 애니메이션으로 전환
    runTimeoutRef.current = setTimeout(() => {
      if (isMoving) {
        setAnimationState('running');
      }
    }, 200);
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    if (!isOwnCharacter) return;
    if (
      !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)
    )
      return;

    activeKeys.current.delete(event.key);

    // activeKeys가 비어 있으면 캐릭터를 idle 상태로 전환
    if (activeKeys.current.size === 0) {
      setAnimationState('idle'); // 캐릭터를 idle 상태로 설정
      setIsMoving(false); // 이동 중인 상태를 false로 설정
      if (runTimeoutRef.current) {
        clearTimeout(runTimeoutRef.current);
        runTimeoutRef.current = null;
      }
    }
  };

  const pickUpAnimation = () => {
    const pickUpAction = mixer.current!.clipAction(animations[1]);
    action?.stop();
    pickUpAction.reset().setLoop(THREE.LoopOnce, 1).clampWhenFinished = true;
    pickUpAction.play();
    setAction(pickUpAction);
    onActionToggleChange(true);
    setTimeout(() => {
      onActionToggleChange(false);
    }, 160);
  };

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOwnCharacter) return;

      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)
      ) {
        activeKeys.current.add(event.key);
        if (!isMoving) {
          handleMovementStart(
            event.key as 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight',
          );
          setIsMoving(true);
        }
      }

      if (event.key === ' ') {
        pickUpAnimation();
      }
    },
    [isOwnCharacter, isMoving],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown]);

  return { scene, mixer, pickUpAnimation };
};
