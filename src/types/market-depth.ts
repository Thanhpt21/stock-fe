// types/market-depth.ts

// Base Market Depth Type
export interface MarketDepth {
  id: number;
  symbol: string;
  side: MarketDepthSide;
  price: number;
  quantity: number;
  level: number;
  timestamp: string;
}

// Market Depth Side
export enum MarketDepthSide {
  BID = 'BID',
  ASK = 'ASK'
}

// Create DTO
export interface CreateMarketDepthDto {
  symbol: string;
  side: MarketDepthSide;
  price: string; // Decimal as string
  quantity: number;
  level: number;
}

// Query Parameters
export interface MarketDepthQuery {
  symbol?: string;
  side?: MarketDepthSide;
  page?: number;
  limit?: number;
}

// Order Book Types
export interface OrderBookEntry {
  price: number;
  quantity: number;
  totalValue: number;
  level: number;
}

export interface OrderBook {
  symbol: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  timestamp: string;
}

// API Response Types
export interface MarketDepthResponse {
  success: boolean;
  message: string;
  data: MarketDepth;
}

export interface MarketDepthListResponse {
  success: boolean;
  message: string;
  data: {
    data: MarketDepth[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface OrderBookResponse {
  success: boolean;
  message: string;
  data: OrderBook;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
  data: null;
}