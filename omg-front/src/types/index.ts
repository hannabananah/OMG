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

export type selectedStockItem =
  | 'socks-with-cane'
  | 'cane'
  | 'socks'
  | 'reels'
  | 'candy';

export interface MarketStock {
  cnt: number;
  state: [number, number];
}
