import { StockItem } from '@/types';

// 백엔드에서 받은 2차원 데이터를 가정
export const backendData: number[][] = [
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ], // 무의미
  [
    8, 6, 4, 6, 14, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ], // socks
  [
    8, 10, 14, 4, 6, 18, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ], // hat
  [
    8, 6, 12, 4, 20, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ], // gift
  [
    8, 30, 24, 16, 12, 28, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ], // cupcake
  [
    8, 12, 18, 14, 8, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ], // candy
];

// 아이템 ID에 해당하는 key 리스트
export const itemNameList: StockItem[] = [
  'candy',
  'cupcake',
  'gift',
  'hat',
  'socks',
];

// 지분 처리 위해 각 플레이어 이름 & 트리 장식 이름 구분
export const players = ['nickname 1', 'nickname 2', 'nickname 3', 'nickname 4'];

// 각 주식의 플레이어 별 보유 개수
export const treeItemPossessionInfo: number[][] = [
  [10, 20, 30, 40], // candy
  [20, 30, 40, 10], // cupcake
  [30, 40, 10, 20], // gift
  [40, 10, 20, 30], // hat
  [10, 10, 10, 10], // socks (아무도 갖고 있지 않음)
];

// 각 트리 장식 별 주가
export const treeItemPrice = [0, 10, 20, 30, 40, 50];

// 각 트리 장식 별 남은 수량
export const remainTreeItemCount = [0, 10, 20, 30, 400, 50];

// 트리 장식 이미지 경로
export const treeItemImagePaths = [
  '/assets/candy.png',
  '/assets/cupcake.png',
  '/assets/gift.png',
  '/assets/hat.png',
  '/assets/socks.png',
];
