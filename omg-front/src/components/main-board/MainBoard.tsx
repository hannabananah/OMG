import Gauge from '@/components/common/Gauge';
import Item from '@/components/stock-market/Item';
import { useGameStore } from '@/stores/useGameStore';
import useModalStore from '@/stores/useModalStore';
import { stockItems } from '@/types';
import { Html } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import {
  EffectComposer,
  Outline,
  Selection,
} from '@react-three/postprocessing';

import BackButton from '../common/BackButton';

export default function MainBoard() {
  const { modals, closeModal } = useModalStore();
  const { gameData } = useGameStore();
  const { stockPrices, tradableStockCnt } = gameData || {};

  const infoItems = [
    { label: '금리', value: `${gameData.currentInterestRate}%` },
    { label: '물가 수준', value: `${gameData.currentStockPriceLevel}/9` },
    { label: '거래 가능 수량', value: `${tradableStockCnt}개` },
  ];

  const spacing = 0.8;
  const startPosition = -(stockItems.length - 1) * (spacing / 2);

  const handleCloseMainBoard = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && modals.mainBoard) {
      closeModal('mainBoard');
    }
  };

  const handleBackButton = () => {
    closeModal('mainBoard');
  };

  const handleItemClick = (itemName: string) => {
    console.log(`Item clicked: ${itemName}`);
  };

  return (
    <div
      className='fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-opacity-70'
      onClick={handleCloseMainBoard}
    >
      <div className='modal-container w-[70%] h-[80%] bg-white p-8'>
        <section className='relative flex items-center justify-center w-full h-[14%] px-10 py-10 text-black text-omg-40b'>
          <div
            className='absolute flex items-center left-10'
            onClick={handleBackButton}
          >
            <BackButton onClick={handleBackButton} />
          </div>
        </section>

        <div className='flex h-full'>
          {/* 왼쪽 절반 공간 */}
          <div className='flex flex-col justify-between w-3/5 h-full gap-8'>
            {/* 위 */}
            <div className='flex w-full mx-auto h-1/2'>
              <Canvas>
                <Html position={[startPosition, 3.9, 0]}>
                  <h2 className='-ml-2 break-keep text-nowrap font-omg-body text-omg-30'>
                    주가 알림표
                  </h2>
                </Html>
                <ambientLight intensity={5} />
                <directionalLight position={[5, 5, 5]} intensity={7} />
                <pointLight position={[0, 10, 0]} intensity={3} />
                <Selection>
                  <EffectComposer multisampling={8} autoClear={false}>
                    <Outline
                      blur
                      visibleEdgeColor={0x0371f8}
                      edgeStrength={100}
                      width={1000}
                    />
                  </EffectComposer>

                  {stockItems.map((item, itemIndex) => {
                    const positionX = startPosition + itemIndex * spacing;

                    return (
                      <group
                        key={item.itemName}
                        position={[positionX, -2, 2.5]}
                      >
                        {/* 3D 아이템 */}
                        <Item
                          itemName={item.itemName}
                          position={{ x: positionX, y: 2, z: item.position.z }}
                          onClick={() => handleItemClick(item.itemName)}
                          disabled={false}
                        />

                        {/* HTML 요소 */}
                        <Html position={[positionX, 1, 0]} center>
                          <div className='flex flex-col h-20 gap-2 text-center text-omg-14'>
                            <div>{item.itemName}</div>
                            {stockPrices &&
                              stockPrices[itemIndex] !== undefined && ( // itemIndex에 해당하는 주가가 있는지 확인
                                <div className='text-omg-18'>
                                  {stockPrices[itemIndex]}{' '}
                                  {/* itemIndex에 해당하는 주가 표시 */}
                                </div>
                              )}
                          </div>
                        </Html>
                      </group>
                    );
                  })}
                </Selection>

                {/* 카메라 위치 설정 */}
                <perspectiveCamera
                  position={[0, 2, 5]}
                  rotation={[-0.5, 0, 0]}
                />
              </Canvas>
            </div>
            {/* 아래 */}
            {gameData && gameData.goldPrice && (
              <section className='flex flex-col w-full mx-auto h-1/2'>
                <h2 className='flex justify-center w-full break-keep text-nowrap font-omg-body text-omg-30b'>
                  금 시세 현황
                </h2>
                <div className='flex items-center flex-grow w-full text-center'>
                  {/* 금괴 에셋 시각화하여 보여주기 */}
                  <span className='justify-center w-full text-omg-28'>
                    {gameData.goldPrice}
                  </span>
                </div>
              </section>
            )}
          </div>

          <div className='flex flex-col w-2/5 h-full'>
            <div className='h-1/2'>
              <ul className='flex flex-col w-full h-full text-omg-24 font-omg-body'>
                {infoItems.map((item, index) => (
                  <li key={index} className='flex justify-between flex-grow'>
                    <h3 className='w-1/2 break-keep text-nowrap'>
                      {item.label}
                    </h3>
                    <span>{item.value}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className='flex flex-col items-center w-full text-center h-1/2 justify-evenly'>
              <h3 className='text-omg-24b font-omg-body'>
                가격 변동까지 남은 게이지
              </h3>
              <Gauge />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
