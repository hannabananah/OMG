import MiniElf from '@/assets/img/mini-elf.svg?react';
import MiniGingerbread from '@/assets/img/mini-gingerbread.svg?react';
import MiniSanta from '@/assets/img/mini-santa.svg?react';
import MiniSnowman from '@/assets/img/mini-snowman.svg?react';
import { useMiniMapStore } from '@/stores/useMiniMapStore';
import { useOtherUserStore } from '@/stores/useOtherUserState';
import useUser from '@/stores/useUser';

const renderMiniCharacterImage = (characterType: number) => {
  const imageClasses = 'w-8 h-8 drop-shadow-extra-heavy';

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

      {playerMinimap.map((player, index) => {
        const playerCharacterType =
          player.nickname === nickname
            ? characterType
            : otherUsersMap[player.nickname];

        return (
          <div
            key={index}
            className='absolute flex items-center just-center'
            style={{
              left: `${player.position[0]}px`,
              top: `${player.position[1]}px`,
            }}
          >
            {renderMiniCharacterImage(playerCharacterType)}
          </div>
        );
      })}
    </div>
  );
}
