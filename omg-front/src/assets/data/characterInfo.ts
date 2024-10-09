export const CharacterInfo = {
  santa: {
    url: '/models/santa/santa.gltf',
    startPosition: [-12, 0, 80] as [number, number, number],
    scale: [2.5, 2.5, 2.5],
  },
  elf: {
    url: '/models/elf/elf.gltf',
    startPosition: [110, 0, 8] as [number, number, number],
    scale: [1, 1, 1],
  },
  snowman: {
    url: '/models/snowman/snowman.gltf',
    startPosition: [86, 0, -18] as [number, number, number],
    scale: [1, 1, 1],
  },
  gingerbread: {
    url: '/models/gingerbread/gingerbread.gltf',
    startPosition: [2, 0, 86] as [number, number, number],
    scale: [1, 1, 1],
  },
};

// 캐릭터 타입에 따른 이미지 경로 설정
export const characterTypeImages: { [key: number]: string } = {
  0: '/assets/santa.png',
  1: '/assets/elf.png',
  2: '/assets/snowman.png',
  3: '/assets/gingerbread.png',
};
