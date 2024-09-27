import { useCallback, useEffect, useRef, useState } from 'react';

import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
// import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';

export const Vector3 = THREE.Vector3;
export const Group = THREE.Group;

interface Props {
  position?: number[];
  onLoadComplete?: () => void;
}

export default function GingerBread({ position, onLoadComplete }: Props) {
  const loadCompleteCalled = useRef(false);
  const { scene, animations } = useGLTF('/models/gingerbread/gingerbread.gltf');

  const mixer = useRef<THREE.AnimationMixer | null>(null);
  const [action, setAction] = useState<THREE.AnimationAction | null>(null);
  const [movementState, setMovementState] = useState<
    'idle' | 'walking' | 'running'
  >('idle');

  const [rotation, setRotation] = useState(0); // 캐릭터의 회전을 관리
  const [characterPosition, setCharacterPosition] = useState(
    new THREE.Vector3(0, -7.8, 10),
  ); // 캐릭터 기본 위치

  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null); // 카메라 참조

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
      } else if (event.key === ' ') {
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

  // 위치를 서버로 전송하는 함수
  const sendPositionToServer = (position: THREE.Vector3, rotation: number) => {
    const directionVector = new THREE.Vector3(
      Math.sin(rotation),
      0,
      Math.cos(rotation),
    );

    const startMessagePayload = {
      roomId: 'example-room-id',
      nickname: 'example-nickname',
      position: [position.x, position.y, position.z],
      direction: [directionVector.x, directionVector.y, directionVector.z], // 올바른 방향 값
    };
    console.log('서버로 전송할 좌표:', startMessagePayload);
    // 여기에 WebSocket이나 다른 통신 방법을 사용해 좌표를 전송하는 로직을 추가하세요
  };

  // 매 프레임마다 카메라가 캐릭터 뒤를 따라가도록 업데이트
  useFrame((state, delta) => {
    mixer.current?.update(delta);

    if (scene) {
      scene.rotation.y = rotation;
      if (movementState === 'walking' || movementState === 'running') {
        const moveSpeed = movementState === 'walking' ? 0.05 : 0.1;
        const forwardDirection = new THREE.Vector3(
          Math.sin(rotation),
          0,
          Math.cos(rotation),
        );
        const newPosition = characterPosition
          .clone()
          .add(forwardDirection.multiplyScalar(moveSpeed));
        setCharacterPosition(newPosition);
        scene.position.copy(newPosition); // 실제 씬의 위치 업데이트
      }

      // 카메라가 캐릭터의 뒤에서 따라가도록 설정
      if (cameraRef.current) {
        const offset = 24; // 캐릭터와 카메라 사이의 거리
        const cameraPosition = new THREE.Vector3(
          characterPosition.x - Math.sin(rotation) * offset,
          characterPosition.y + 8, // 캐릭터보다 약간 위에 위치
          characterPosition.z - Math.cos(rotation) * offset,
        );
        cameraRef.current.position.copy(cameraPosition); // 카메라를 캐릭터 뒤에 위치
        cameraRef.current.lookAt(characterPosition); // 카메라가 캐릭터를 바라보도록
      }
    }
  });

  // 2초마다 포지션을 서버로 전송
  useEffect(() => {
    const interval = setInterval(() => {
      if (scene) {
        const position = scene.position;
        sendPositionToServer(position, rotation); // 회전 값을 함께 전송
      }
    }, 2000);

    return () => clearInterval(interval); // 컴포넌트 언마운트 시 클리어
  }, [scene, rotation]);

  return (
    <>
      {/* <RigidBody> */}
      {/* 캐릭터 렌더링 */}
      <primitive
        object={scene}
        scale={[1, 1, 1]}
        position={characterPosition}
      />

      {/* <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        fov={100}
        position={[0, 0.1, 13]}
        near={0.1}
        far={1000}
      /> */}
      {/* </RigidBody> */}
    </>
  );
}
