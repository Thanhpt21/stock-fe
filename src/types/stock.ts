// types/index.d.ts

export interface StockResponse {
  data: StockData[];
  status: string;
}

export interface WatchlistItem {
  id: string;
  symbol: string;
  companyName: string;
  addedAt: string;
}

// types/index.ts
export interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: string;
  market: string;
  companyName?: string;
}

export interface MarketSummary {
  market: string;
  totalStocks: number;
  averageChange: number;
  totalVolume: number;
}
