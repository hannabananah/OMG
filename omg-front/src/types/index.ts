export interface Player {
  nickname: string;
  characterType: number;
  position: number[];
  direction: number[];
  hasLoan: number;
  loanPrincipal: number;
  loanInterest: number;
  totalDebt: number;
  cash: number;
  stock: number[];
  goldOwned: number;
  action: string | null;
  state: string;
  isConnected: number;
  actionToggle: boolean;
}

export interface ChatMessage {
  sender: string;
  content: string;
}

// 주식 시장
export type StockMarketView = 'main' | 'buy' | 'sell';

export type StockItem = 'candy' | 'cupcake' | 'gift' | 'hat' | 'socks';
export type StockItemInKorean = '사탕' | '컵케이크' | '선물' | '모자' | '양말';

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

export interface MarketStock {
  cnt: number;
  state: [number, number];
}
