export interface Player {
  action: string | null;
  actionToggle: boolean;
  battleState: boolean; // 추가
  carryingGolds: number; // 추가
  carryingStocks: number[]; // 추가
  cash: number;
  characterMovement: boolean; // 추가 (줍기 행동 유무)
  characterType: number;
  direction: number[];
  goldOwned: number;
  isConnected: number;
  loanProducts: []; // 추가, 따로 TreeSet<LoanProduct> 있음
  nickname: string;
  position: number[];
  state: string;
  stock: number[];
  totalDebt: number;
}

export interface GameEvent {
  id: number;
  title: string;
  content: string;
  value: number;
  affectedStockGroup: string;
}

export interface MarketStock {
  cnt: number;
  state: [number, number];
}

export interface ChatMessage {
  sender: string;
  content: string;
}

// 주식 시장
export type StockMarketView = 'main' | 'buy' | 'sell';

export type StockItem = 'candy' | 'cupcake' | 'gift' | 'hat' | 'socks';
export type StockItemInKorean = '사탕' | '컵케이크' | '선물' | '모자' | '양말';

// export type AboveHead = 'trading' | 'market' | 'battle';
export type AboveHead = 'candy' | 'cupcake' | 'gift';

export const stockItems: {
  itemName: StockItem;
  position: { x: number; y: number; z: number };
}[] = [
  {
    itemName: 'candy',
    position: { x: -7, y: 0, z: 0 },
  },
  {
    itemName: 'cupcake',
    position: { x: -5.5, y: 2, z: 0 },
  },
  {
    itemName: 'gift',
    position: { x: -4, y: 2, z: 0 },
  },
  {
    itemName: 'hat',
    position: { x: -2.5, y: 1, z: 0 },
  },
  {
    itemName: 'socks',
    position: { x: -1, y: 0, z: 0 },
  },
];

// 대출
export type LoanMarketView = 'main' | 'take' | 'repay';

// 주식 차트 데이터
export interface StockDataItem {
  id: StockItem;
  data: Array<{ x: number; y: number }>; // 각 시간(x)과 그에 따른 가격(y)
}

// (한글로 변환한) 주식 차트 데이터
export interface StockDataItemInKorean {
  id: StockItemInKorean;
  data: Array<{ x: number; y: number }>; // 각 시간(x)과 그에 따른 가격(y)
}

// 주식 차트 데이터 내에서 뽑을 주가와 등락 폭
export interface StockPriceDataInfo {
  itemName: StockItem;
  price: number;
  updown: number;
}

// 플레이어 별 지분 정보 타입
export interface PossessionDataInfo {
  treeItemName: StockItem; // 고정 필드
  [playerNickname: string]: number | StockItem; // 동적 키는 number 또는 StockItemnumber
}

// 금 시세 차트 데이터
export interface GoldDataItem {
  id: string;
  data: Array<{ x: number; y: number }>; // 각 시간(x)과 그에 따른 가격(y)
}
