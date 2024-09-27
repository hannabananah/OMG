// import { useEffect, useRef } from 'react';

// import { CameraControls } from '@react-three/drei';

// // import { useCamera } from '../../stores/camera';
// import { useScreenControl } from '../../stores/screen';

// // GingerBread 위치 제어

// export default function Camera() {
//   const cameraRef = useRef<CameraControls>(null!);

//   const { setCamera, mainMapScreen, introScreen } = useCamera();

//   const { showIntro, setHideIntro, setMainScreen } = useScreenControl();

//   const gingerbreadPosition = { x: 0, y: 0, z: 0 }; // GingerBread 위치

//   useEffect(() => {
//     setCamera(cameraRef);

//     if (showIntro) {
//       // 첫 로드 시, 인트로를 보여주고 줌인 처리
//       introScreen();

//       // 인트로 후에 중앙으로 줌인
//       setTimeout(() => {
//         mainMapScreen(); // 맵 중앙으로 카메라 이동
//         setHideIntro(); // 인트로가 끝난 후에는 false로 설정하여 두 번째부터는 인트로를 건너뜀
//         setMainScreen(); // 메인 화면 상태로 전환
//       }, 5000); // 5초 후 줌인 시작
//     } else {
//       // 두 번째부터는 바로 GingerBread 시점으로 시작
//       cameraRef.current.setLookAt(
//         gingerbreadPosition.x,
//         gingerbreadPosition.y,
//         gingerbreadPosition.z, // 카메라를 GingerBread 위치로 이동
//         0,
//         0,
//         0, // 맵의 중앙을 타겟으로 지정 (필요에 따라 조정 가능)
//         true,
//       );
//       setMainScreen();
//     }
//   }, [
//     showIntro,
//     setMainScreen,
//     setCamera,
//     mainMapScreen,
//     introScreen,
//     setHideIntro,
//   ]);

//   return (
//     <>
//       <CameraControls ref={cameraRef} />
//     </>
//   );
// }
