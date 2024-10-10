import { useEffect } from 'react';

interface StockChangeProps {
  message: string;
}

export default function StockChangeAlert({ message }: StockChangeProps) {
  useEffect(() => {
    console.log('여기까지 들어오냐 제발', message);
  }, []);
  return <div>{message}</div>;
}

// import { useEffect, useState } from 'react';
// import { Fragment } from 'react/jsx-runtime';

// import { treeItemImagePaths } from '@/assets/data/stockMarketData';

// interface StockChangeProps {
//   message: string;
// }

// export default function StockChangeAlert({ message }: StockChangeProps) {
//   const [gridImages, setGridImages] = useState<string[][]>([]);

//   useEffect(() => {
//     const shuffleImages = () => {
//       const shuffledImages = [...treeItemImagePaths].sort(
//         () => Math.random() - 0.5,
//       );
//       const grid: string[][] = [];

//       for (let row = 0; row < 10; row++) {
//         const rowImages: string[] = [];
//         for (let col = 0; col < 10; col++) {
//           const randomIndex = Math.floor(Math.random() * shuffledImages.length);
//           rowImages.push(shuffledImages[randomIndex]);
//         }
//         grid.push(rowImages);
//       }

//       setGridImages(grid);
//     };

//     shuffleImages();

//     const intervalId = setInterval(() => {
//       shuffleImages();
//     }, 3000); // 3초로 간격 늘리기 (테스트용)

//     return () => clearInterval(intervalId);
//   }, []);

//   const formattedMessage = message.includes('!')
//     ? message.split('!').map((part, index) => (
//         <Fragment key={index}>
//           {part}
//           {index === 0 && '!'}
//           {index === 0 && <br />} {/* 첫 번째 문장 뒤에 줄바꿈 적용 */}
//         </Fragment>
//       ))
//     : message;

//   return (
//     <div className='absolute z-50 w-full h-full bg-white'>
//       <div className='absolute top-0 left-0 grid w-full h-full grid-cols-10 grid-rows-10'>
//         {/* 격자 이미지를 표시할 부분 */}
//         {gridImages.map((row, rowIndex) =>
//           row.map((image, colIndex) => (
//             <div
//               key={`${rowIndex}-${colIndex}`}
//               className='w-full h-full'
//               style={{
//                 backgroundImage: `url(${image})`,
//                 backgroundSize: '50px 50px',
//                 backgroundRepeat: 'no-repeat',
//                 backgroundPosition: 'center',
//                 transform: 'rotate(45deg)',
//                 opacity: 0.5,
//               }}
//             ></div>
//           )),
//         )}
//       </div>

//       <div className='absolute z-50 text-center -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 text-omg-50b font-omg-event-title'>
//         <p className='animate-shake whitespace-nowrap'>{formattedMessage}</p>
//       </div>
//     </div>
//   );
// }

// // message 예시
// // 주가가 변동되었습니다! 5초 후 게임이 재개됩니다
