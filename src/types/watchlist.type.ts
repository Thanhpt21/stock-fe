// types/watchlist.ts

import { StockData } from "./stock";

export interface Watchlist {
  id: number;
  userId: number;
  name: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  items?: WatchlistItem[];
}

export interface WatchlistItem {
  id: number;
  watchlistId: number;
  symbol: string;
  note?: string | null;
  createdAt: string;
}

// Optional enriched type when combining with StockData
export interface WatchlistItemWithStock extends WatchlistItem {
  stock?: StockData;
}

// Optional API response types
export interface WatchlistResponse {
  status: string;
  data: Watchlist[];
}

export interface WatchlistItemResponse {
  status: string;
  data: WatchlistItem[];
}
