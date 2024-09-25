import { useCallback, useEffect, useRef, useState } from 'react';

import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  position?: number[];
  onLoadComplete?: () => void;
}

export default function Elf({ position, onLoadComplete }: Props) {
  const loadCompleteCalled = useRef(false);
  const { scene, animations } = useGLTF('/models/elf/elf.gltf');

  const mixer = useRef<THREE.AnimationMixer | null>(null);
  const [action, setAction] = useState<THREE.AnimationAction | null>(null);
  const [movementState, setMovementState] = useState<
    'idle' | 'walking' | 'running'
  >('idle');

  const [rotation, setRotation] = useState(0); // 캐릭터의 회전을 관리

  const runningCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const keyPressStartTime = useRef<number | null>(null);

  // 애니메이션 로드 시 onLoadComplete 호출
  useEffect(() => {
    if (!loadCompleteCalled.current && scene) {
      loadCompleteCalled.current = true;
      if (onLoadComplete) {
        onLoadComplete();
      }
    }
  }, [scene, onLoadComplete]);

  // 애니메이션 설정
  useEffect(() => {
    if (animations.length > 0 && scene) {
      console.log(animations);
      mixer.current = new THREE.AnimationMixer(scene);
      const idleAction = mixer.current.clipAction(animations[0]); // 대기
      // const idleAction = mixer.current.clipAction(animations[1]); // 줍기
      // const idleAction = mixer.current.clipAction(animations[2]); // 달리기
      // const idleAction = mixer.current.clipAction(animations[3]); // 왼쪽 돌기
      // const idleAction = mixer.current.clipAction(animations[4]); // 오른쪽 돌기
      // const idleAction = mixer.current.clipAction(animations[5]); // 걷기
      idleAction.play();
      setAction(idleAction);
    }
  }, [animations, scene]);

  const setAnimationState = useCallback(
    (state: 'idle' | 'walking' | 'running') => {
      if (!mixer.current) return;

      const animationIndex = state === 'idle' ? 0 : state === 'walking' ? 5 : 2;
      const newAction = mixer.current.clipAction(animations[animationIndex]);

      action?.fadeOut(0.2);
      newAction.reset().fadeIn(0.2).play();
      setAction(newAction);
      setMovementState(state);
    },
    [animations, action],
  );

  const startRunningCheck = useCallback(() => {
    if (runningCheckIntervalRef.current) {
      clearInterval(runningCheckIntervalRef.current);
    }
    // 100ms 마다 체크하면서 1초가 지나면 running 상태로 전환
    runningCheckIntervalRef.current = setInterval(() => {
      if (
        keyPressStartTime.current &&
        Date.now() - keyPressStartTime.current >= 1000 &&
        movementState === 'walking'
      ) {
        setAnimationState('running');
        clearInterval(runningCheckIntervalRef.current!);
        runningCheckIntervalRef.current = null;
      }
    }, 100); // 100ms마다 체크
  }, [setAnimationState, movementState]);

  // 키보드 입력 처리
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp') {
        if (movementState === 'idle') {
          keyPressStartTime.current = Date.now();
          setAnimationState('walking');
        }
        // walking에서 1초 지나면 running으로 전환
        if (movementState === 'walking' && !runningCheckIntervalRef.current) {
          startRunningCheck();
        }
      } else if (event.key === 'ArrowLeft') {
        // 왼쪽 돌기 애니메이션
        const turnLeftAction = mixer.current!.clipAction(animations[3]);
        action?.stop();
        turnLeftAction.reset().play();
        setAction(turnLeftAction);

        // 회전 적용 후 대기 상태로 전환
        setTimeout(() => {
          setRotation(prev => prev + Math.PI / 2); // 90도 왼쪽 회전

          // 회전 후 대기 상태로 전환
          const idleAction = mixer.current!.clipAction(animations[0]); // 대기
          turnLeftAction.stop();
          idleAction.reset().play();
          setAction(idleAction);
          setMovementState('idle');
        }, 500); // 애니메이션이 끝날 때쯤 회전 적용 및 대기 상태로 전환
      } else if (event.key === 'ArrowRight') {
        // 오른쪽 돌기 애니메이션
        const turnRightAction = mixer.current!.clipAction(animations[4]);
        action?.stop();
        turnRightAction.reset().play();
        setAction(turnRightAction);

        // 회전 적용 후 대기 상태로 전환
        setTimeout(() => {
          setRotation(prev => prev - Math.PI / 2); // 90도 오른쪽 회전

          // 회전 후 대기 상태로 전환
          const idleAction = mixer.current!.clipAction(animations[0]); // 대기
          turnRightAction.stop();
          idleAction.reset().play();
          setAction(idleAction);
          setMovementState('idle');
        }, 500); // 애니메이션이 끝날 때쯤 회전 적용 및 대기 상태로 전환
      } else if (event.key === 'ArrowDown') {
        // 줍기 애니메이션
        const pickUpAction = mixer.current!.clipAction(animations[1]);
        action?.stop();
        pickUpAction.reset().setLoop(THREE.LoopOnce, 1).clampWhenFinished =
          true; // 한번만 실행되도록 설정 & 애니메이션 끝나면 마지막 프레임에서 멈추도록
        pickUpAction.play();
        setAction(pickUpAction);

        // 줍기 애니메이션 끝나면 대기 상태로 전환
        mixer.current!.addEventListener('finished', () => {
          const idleAction = mixer.current!.clipAction(animations[0]); // 대기 애니메이션
          idleAction.reset().play();
          setAction(idleAction);
        });
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp') {
        keyPressStartTime.current = null;

        if (runningCheckIntervalRef.current) {
          clearInterval(runningCheckIntervalRef.current);
          runningCheckIntervalRef.current = null;
        }

        if (movementState === 'running') {
          // 걷기 애니메이션
          const walkingAction = mixer.current!.clipAction(animations[5]);
          action?.fadeOut(0.2);
          walkingAction.reset().fadeIn(0.2).play();
          setAction(walkingAction);

          // 걷기 애니메이션 1초 후, 대기 상태로 전환
          setTimeout(() => {
            walkingAction.fadeOut(0.2);
            setAnimationState('idle');
          }, 1000);
        } else if (movementState === 'walking') {
          setAnimationState('idle');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (runningCheckIntervalRef.current)
        clearInterval(runningCheckIntervalRef.current);
    };
  }, [animations, action, movementState, setAnimationState, startRunningCheck]);

  // 매 프레임마다 애니메이션 업데이트 및 회전 적용
  useFrame((_, delta) => {
    mixer.current?.update(delta);
    if (scene) {
      scene.rotation.y = rotation; // 회전 적용
    }
  });

  return (
    <>
      {/* 캐릭터 렌더링 */}
      <primitive object={scene} scale={[3, 3, 3]} position={position} />
    </>
  );
}
