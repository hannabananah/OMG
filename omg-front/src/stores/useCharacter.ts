import { useEffect, useRef, useState } from 'react';

import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface Props {
  onMovementChange: (movementState: 'idle' | 'walking' | 'running') => void;
  onRotationChange: (rotation: number) => void;
  onPositionChange: (position: THREE.Vector3) => void;
}

export const useCharacter = ({
  onMovementChange,
  onRotationChange,
  onPositionChange,
}: Props) => {
  const { scene, animations } = useGLTF('/models/gingerbread/gingerbread.gltf');

  const mixer = useRef<THREE.AnimationMixer | null>(null);
  const [action, setAction] = useState<THREE.AnimationAction | null>(null);
  const [movementState, setMovementState] = useState<
    'idle' | 'walking' | 'running'
  >('idle');
  const [rotation, setRotation] = useState(0);
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    if (animations.length > 0 && scene) {
      mixer.current = new THREE.AnimationMixer(scene);
      const idleAction = mixer.current.clipAction(animations[0]); // 대기
      idleAction.play();
      setAction(idleAction);
    }
  }, [animations, scene]);

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

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowUp') {
      if (!isMoving) {
        setAnimationState('walking');
        setIsMoving(true);
      }
    } else if (event.key === 'ArrowLeft') {
      const turnLeftAction = mixer.current!.clipAction(animations[3]);
      action?.stop();
      turnLeftAction.reset().setLoop(THREE.LoopOnce, 1).clampWhenFinished =
        true;
      turnLeftAction.play();
      setAction(turnLeftAction);
      setRotation(prev => prev + Math.PI / 2);
      onRotationChange(rotation + Math.PI / 2);
      setAnimationState('idle');
    } else if (event.key === 'ArrowRight') {
      const turnRightAction = mixer.current!.clipAction(animations[4]);
      action?.stop();
      turnRightAction.reset().setLoop(THREE.LoopOnce, 1).clampWhenFinished =
        true;
      turnRightAction.play();
      setAction(turnRightAction);
      setRotation(prev => prev - Math.PI / 2);
      onRotationChange(rotation - Math.PI / 2);
      setAnimationState('idle');
    } else if (event.key === ' ') {
      const pickUpAction = mixer.current!.clipAction(animations[1]);
      action?.stop();
      pickUpAction.reset().setLoop(THREE.LoopOnce, 1).clampWhenFinished = true;
      pickUpAction.play();
      setAction(pickUpAction);
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === 'ArrowUp') {
      setAnimationState('idle');
      setIsMoving(false);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp, movementState, isMoving]);

  return { scene, mixer };
};
