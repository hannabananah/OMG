// import { MutableRefObject, useEffect, useRef } from 'react';

// import { CameraControls } from '@react-three/drei';
// import { useControls } from 'leva';
// import { create } from 'zustand';

// // 카메라 기본 설정값
// export const DEFAULT_FAR = 1000000;
// export const DEFAULT_FOV = 50;

// // 카메라 상태 인터페이스 정의
// interface CameraStore {
//   cameraRef: MutableRefObject<CameraControls> | null;
//   setCamera: (newCameraRef: MutableRefObject<CameraControls>) => void;
//   introScreen: () => void;
//   mainMapScreen: () => void;
//   matchingScreen: () => void;
// }

// // 카메라의 기본 위치
// export const DEFAULT_CAMERA_POSITION = {
//   x: 50000,
//   y: 20000,
//   z: -180000,
// };

// export const useCamera = create<CameraStore>(set => ({
//   cameraRef: null,
//   setCamera: newCameraRef => {
//     set(state => {
//       return { ...state, cameraRef: newCameraRef };
//     });
//   },
//   // 인트로 화면에서 카메라 설정
//   introScreen: () => {
//     set(state => {
//       if (state.cameraRef) {
//         state.cameraRef.current.smoothTime = 2;
//         state.cameraRef.current.setLookAt(
//           // 카메라의 새로운 위치. 이 좌표에 카메라가 배치됨
//           0,
//           50000,
//           0,
//           //   카메라가 바라보는 타겟 좌표
//           0,
//           0,
//           0,
//           //   애니메이션을 적용하여 카메라가 부드럽게 해당 좌표로 이동
//           true,
//         );
//         // 줌 레벨, 줌 애니메이션 적용
//         state.cameraRef.current.zoomTo(1, true);
//       } else {
//         console.error(`Camera not initialized...`);
//       }
//       return { ...state };
//     });
//   },
//   // 메인 화면에서 카메라 설정
//   mainMapScreen: () => {
//     set(state => {
//       if (state.cameraRef) {
//         state.cameraRef.current.smoothTime = 0.25;
//         state.cameraRef.current.setLookAt(
//           -14863,
//           100000,
//           156881,
//           -74590,
//           33819,
//           -101660,
//           true,
//         );
//         state.cameraRef.current.zoomTo(1, true);
//       } else {
//         console.error(`Camera not initialized...`);
//       }
//       return { ...state };
//     });
//   },
//   // 대결
//   matchingScreen: () => {
//     set(state => {
//       if (state.cameraRef?.current) {
//         state.cameraRef.current.setLookAt(
//           -62799,
//           -559,
//           -107983,
//           -30000,
//           0,
//           0,
//           true,
//         );
//         state.cameraRef.current.zoomTo(1, true);
//       } else {
//         console.error(`Camera not initialized...`);
//       }
//       return { ...state };
//     });
//   },
// }));

// // 카메라 초기화 함수
// export const useCameraInit = () => {
//   const cameraRef = useRef<CameraControls>(null!);
//   const { setCamera } = useCamera();

//   // 컴포넌트가 마운트될 때 카메라를 설정
//   useEffect(() => {
//     setCamera(cameraRef);
//   }, [setCamera]);

//   return { cameraRef };
// };

// // 이전 X, Y, Z 좌표값 저장 변수
// let prevX = 0;
// let prevY = 0;
// let prevZ = 0;

// // 카메라 테스트를 위한 함수
// export const useCameraTest = () => {
//   const { cameraRef } = useCamera();

//   // Leva로 카메라 조정 슬라이더 생성
//   useControls({
//     positionX: {
//       value: DEFAULT_CAMERA_POSITION.x,
//       min: -400000,
//       max: 400000,
//       step: 10000,
//       onChange: nextX => {
//         if (cameraRef) {
//           const { x, y, z } = cameraRef.current.camera.position;
//           cameraRef.current.setPosition(nextX, y, z);
//         }
//       },
//     },
//     positionY: {
//       value: DEFAULT_CAMERA_POSITION.y,
//       min: -400000,
//       max: 400000,
//       step: 10000,
//       onChange: nextY => {
//         if (cameraRef) {
//           const { x, y, z } = cameraRef.current.camera.position;
//           cameraRef.current.setPosition(x, nextY, z);
//         }
//       },
//     },
//     positionZ: {
//       value: DEFAULT_CAMERA_POSITION.z,
//       min: -400000,
//       max: 400000,
//       step: 10000,
//       onChange: nextZ => {
//         if (cameraRef) {
//           const { x, y, z } = cameraRef.current.camera.position;
//           cameraRef.current.setPosition(x, y, nextZ);
//         }
//       },
//     },
//     targetX: {
//       value: prevX,
//       min: -400000,
//       max: 400000,
//       step: 10000,
//       onChange: nextX => {
//         if (cameraRef) {
//           prevX = nextX;
//           cameraRef.current.setLookAt(
//             DEFAULT_CAMERA_POSITION.x,
//             DEFAULT_CAMERA_POSITION.y,
//             DEFAULT_CAMERA_POSITION.z,
//             prevX,
//             prevY,
//             prevZ,
//             true,
//           );
//         }
//       },
//     },
//     targetY: {
//       value: prevY,
//       min: -400000,
//       max: 400000,
//       step: 10000,
//       onChange: nextY => {
//         if (cameraRef) {
//           prevY = nextY;
//           cameraRef.current.setLookAt(
//             DEFAULT_CAMERA_POSITION.x,
//             DEFAULT_CAMERA_POSITION.y,
//             DEFAULT_CAMERA_POSITION.z,
//             prevX,
//             prevY,
//             prevZ,
//             true,
//           );
//         }
//       },
//     },
//     targetZ: {
//       value: prevZ,
//       min: -400000,
//       max: 400000,
//       step: 10000,
//       onChange: nextZ => {
//         if (cameraRef) {
//           prevZ = nextZ;
//           cameraRef.current.setLookAt(
//             DEFAULT_CAMERA_POSITION.x,
//             DEFAULT_CAMERA_POSITION.y,
//             DEFAULT_CAMERA_POSITION.z,
//             prevX,
//             prevY,
//             prevZ,
//             true,
//           );
//         }
//       },
//     },
//   });
// };
