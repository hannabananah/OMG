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

// Stock 차트 데이터
export type StockDataPoint = { x: number; y: number };
export type StockDataItem = { id: StockItem; data: StockDataPoint[] };

export interface MarketStock {
  cnt: number;
  state: [number, number];
}
