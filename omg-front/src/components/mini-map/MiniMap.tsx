import { IoMdPin } from 'react-icons/io';
import { IoHome } from 'react-icons/io5';

import MiniElf from '@/assets/img/mini-elf.svg?react';
import MiniGingerbread from '@/assets/img/mini-gingerbread.svg?react';
import MiniSanta from '@/assets/img/mini-santa.svg?react';
import MiniSnowman from '@/assets/img/mini-snowman.svg?react';
import { useMiniMapStore } from '@/stores/useMiniMapStore';
import { useOtherUserStore } from '@/stores/useOtherUserState';
import useUser from '@/stores/useUser';

const renderMiniCharacterImage = (characterType: number) => {
  const imageClasses = 'w-12 h-12 drop-shadow-md';

  switch (characterType) {
    case 0:
      return <MiniSanta className={imageClasses} />;
    case 1:
      return <MiniElf className={imageClasses} />;
    case 2:
      return <MiniSnowman className={imageClasses} />;
    case 3:
      return <MiniGingerbread className={imageClasses} />;
    default:
      return null;
  }
};

const houseCoordinates: { [key: number]: { left: number; top: number } } = {
  0: { left: 213, top: 26 },
  1: { left: 30, top: 140 },
  2: { left: 55, top: 186 },
  3: { left: 177, top: 12 },
};

export default function MiniMap() {
  const { playerMinimap } = useMiniMapStore();
  const { otherUsers } = useOtherUserStore();
  const { nickname, characterType } = useUser();

  const otherUsersMap = otherUsers.reduce(
    (map, user) => {
      map[user.id] = user.characterType;
      return map;
    },
    {} as { [key: string]: number },
  );

  return (
    <div className='relative flex overflow-hidden'>
      <img
        src='/assets/mini-map.png'
        alt='Mini-map'
        className='w-[380px] h-[380px]'
      />
      {/* 주식 거래소 */}
      <div className='absolute flex justify-center group left-[154px] top-[136px]'>
        <IoMdPin className='relative bounce-animation' color='red' size={24} />
        <span className='absolute bottom-0 p-1 text-center text-black transition-all scale-0 font-omg-event-content text-omg-14 break-keep left-7 rounded-5 bg-white2 group-hover:scale-100'>
          주식 거래소
        </span>
      </div>

      {/* 대출 */}
      <div className='absolute flex justify-center group left-[130px] top-[54px]'>
        <IoMdPin className='relative bounce-animation' color='red' size={24} />
        <span className='absolute bottom-0 p-1 text-center text-black transition-all scale-0 font-omg-event-content text-omg-14 break-keep left-7 rounded-5 bg-white2 group-hover:scale-100'>
          대출
        </span>
      </div>

      {/* 금 거래소 */}
      <div className='absolute flex justify-center group left-[270px] top-[188px]'>
        <IoMdPin className='relative bounce-animation' color='red' size={24} />
        <span className='absolute bottom-0 p-1 text-center text-black transition-all scale-0 font-omg-event-content text-omg-14 break-keep left-7 rounded-5 bg-white2 group-hover:scale-100'>
          금 거래소
        </span>
      </div>

      {/* 본인집 */}
      <div
        className='absolute flex justify-center group'
        style={{
          left: `${houseCoordinates[characterType].left}px`,
          top: `${houseCoordinates[characterType].top}px`,
        }}
      >
        <IoHome className='relative bounce-animation' color='green' size={24} />
        <span className='absolute bottom-0 p-1 text-center text-black transition-all scale-0 font-omg-event-content text-omg-14 break-keep left-7 rounded-5 bg-white2 group-hover:scale-100 text-nowrap'>
          내 집
        </span>
      </div>

      {playerMinimap.map((player, index) => {
        const playerCharacterType =
          player.nickname === nickname
            ? characterType
            : otherUsersMap[player.nickname];

        return (
          <div
            className='absolute flex justify-center group'
            key={index}
            style={{
              left: `${player.position[0]}px`,
              top: `${player.position[1]}px`,
            }}
          >
            <div className='relative drop-shadow-lg animate-subtle-pulse'>
              {renderMiniCharacterImage(playerCharacterType)}
            </div>
            <span className='absolute bottom-0 z-20 p-1 text-center text-black transition-all scale-0 font-omg-event-content text-omg-14 break-keep left-11 rounded-5 bg-white2 group-hover:scale-100'>
              {player.nickname}
            </span>
          </div>
        );
      })}
    </div>
  );
}
