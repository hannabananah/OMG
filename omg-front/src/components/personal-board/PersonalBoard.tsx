import Item from '@/components/stock-market/Item';
import { treeItemNameInKorean } from '@/hooks/useStock';
import { useGameStore } from '@/stores/useGameStore';
import useModalStore from '@/stores/useModalStore';
import useUser from '@/stores/useUser';
import { stockItems } from '@/types';
import { Html } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import {
  EffectComposer,
  Outline,
  Selection,
} from '@react-three/postprocessing';

import BackButton from '../common/BackButton';

export default function PersonalBoard() {
  const { modals, closeModal } = useModalStore();

  const { gameData } = useGameStore();
  const { players } = gameData || {};

  const { nickname } = useUser();

  // 내 nickname에 해당하는 플레이어 정보 찾기
  const myPlayerInfo = Array.isArray(players)
    ? players.find(player => player.nickname === nickname)
    : null;

  const { stock, goldOwned, cash, totalDebt } = myPlayerInfo || {};

  const spacing = 0.8;
  const startPosition = -(stockItems.length - 1) * (spacing / 2);

  const handleClosePersonalBoard = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && modals.personalBoard) {
      closeModal('personalBoard');
    }
  };

  const handleBackButton = () => {
    closeModal('personalBoard');
  };

  const handleItemClick = (itemName: string) => {
    console.log(`Item clicked: ${itemName}`);
  };

  return (
    <div
      className='fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-opacity-70'
      onClick={handleClosePersonalBoard}
    >
      {/* TODO: 여기 전체 담을 personal board 디자인은 조정 필요  */}
      <div className='modal-container w-[70%] p-8'>
        {/* 뒤로 가기 섹션 */}
        <section className='relative flex items-center justify-center w-full h-[14%] px-10 py-10 text-black text-omg-40b'>
          <div
            className='absolute flex items-center left-10'
            onClick={handleBackButton}
          >
            <BackButton onClick={handleBackButton} />
          </div>
        </section>

        {/* 보유 주식 & 보유 금 & 보유 현금 & 총 대출 액 */}
        <section className='flex flex-col w-full h-full'>
          {/* 보유 주식 개수 */}
          <div className='flex w-full mx-auto h-1/2 bg-blue'>
            <Canvas>
              <Html position={[startPosition, 3.9, 0]}>
                <h2 className='-ml-2 break-keep text-nowrap font-omg-body text-omg-30'>
                  나의 보유 주식
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
                    <group key={item.itemName} position={[positionX, -2, 2.5]}>
                      {/* 3D 아이템 */}
                      <Item
                        itemName={item.itemName}
                        position={{ x: positionX, y: 2, z: item.position.z }}
                        onClick={() => handleItemClick(item.itemName)}
                        disabled={false}
                      />

                      {/* HTML 요소 */}
                      <Html position={[positionX, 1, 0]} center>
                        <div className='flex flex-col w-20 h-20 gap-2 text-center bg-green text-omg-14'>
                          <div>{treeItemNameInKorean(item.itemName)}</div>
                          {stock &&
                            stock[itemIndex] !== undefined && ( // itemIndex에 해당하는 주가가 있는지 확인
                              <div className='text-omg-18'>
                                {stock[itemIndex]}개
                              </div>
                            )}
                        </div>
                      </Html>
                    </group>
                  );
                })}
              </Selection>

              {/* 카메라 위치 설정 */}
              <perspectiveCamera position={[0, 2, 5]} rotation={[-0.5, 0, 0]} />
            </Canvas>
          </div>

          {/* 보유 금 개수 & 현금 & 총 대출 액 */}
          {gameData && gameData.goldPrice && (
            <div className='flex flex-col w-full mx-auto h-1/2 bg-skyblue'>
              <h2 className='flex justify-center w-full break-keep text-nowrap font-omg-body text-omg-30b'>
                금 개수, 보유 현금, 총 대출 액
              </h2>
              <div className='flex items-center flex-grow w-full text-center'>
                {/* 금괴 에셋 시각화하여 보여주기 */}
                <span className='justify-center w-full text-omg-28'>
                  금 개수: {goldOwned}개
                </span>
                <span className='justify-center w-full text-omg-28'>
                  보유 현금: {cash}원
                </span>
                <span className='justify-center w-full text-omg-28'>
                  총 대출: {totalDebt}원
                </span>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
