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

export type StockItem = 'candy' | 'cupcake' | 'gift' | 'hat' | 'socks';

// 주식 차트 데이터
export interface StockDataItem {
  id: StockItem;
  data: Array<{ x: number; y: number }>; // 각 시간(x)과 그에 따른 가격(y)
}

export interface MarketStock {
  cnt: number;
  state: [number, number];
}
