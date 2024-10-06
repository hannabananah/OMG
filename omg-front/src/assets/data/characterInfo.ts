export const CharacterInfo = {
  santa: {
    url: '/models/santa/santa.gltf',
    scale: [2.5, 2.5, 2.5],
    startPosition: [37, 0, -3] as [number, number, number],
    cameraSettings: {
      position: [0, 2, 5] as [number, number, number], // 카메라 위치
      zoom: 5, // 줌 레벨
    },
  },
  elf: {
    url: '/models/elf/elf.gltf',
    scale: [1, 1, 1],
    startPosition: [0, 0, 3] as [number, number, number],
    cameraSettings: {
      position: [0, 1, 3] as [number, number, number],
      zoom: 3,
    },
  },
  snowman: {
    url: '/models/snowman/snowman.gltf',
    scale: [1, 1, 1],
    startPosition: [-1, 0, 3] as [number, number, number],
    cameraSettings: {
      position: [0, 1, 4] as [number, number, number],
      zoom: 4,
    },
  },
  gingerbread: {
    url: '/models/gingerbread/gingerbread.gltf',
    scale: [1, 1, 1],
    startPosition: [0.3, 0, 2] as [number, number, number],
    cameraSettings: {
      position: [0, 1, 3] as [number, number, number],
      zoom: 3,
    },
  },
};
