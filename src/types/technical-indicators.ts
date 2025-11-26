// types/technical-indicators.ts

// Base Technical Indicator Type
export interface TechnicalIndicator {
  id: number;
  symbol: string;
  indicator: string;
  value: number;
  timeframe: string;
  date: string;
  createdAt: string;
  signal?: string;
}

// Create DTO
export interface CreateTechnicalIndicatorDto {
  symbol: string;
  indicator: string;
  value: number;
  timeframe: string;
  date: string;
  signal?: string;
}

// Update DTO
export interface UpdateTechnicalIndicatorDto {
  symbol?: string;
  indicator?: string;
  value?: number;
  timeframe?: string;
  date?: string;
  signal?: string;
}

// Query Parameters
export interface TechnicalIndicatorQuery {
  symbol?: string;
  indicator?: string;
  timeframe?: string;
  page?: number;
  limit?: number;
}

// API Response Types
export interface TechnicalIndicatorResponse {
  success: boolean;
  message: string;
  data: TechnicalIndicator;
}

export interface TechnicalIndicatorListResponse {
  success: boolean;
  message: string;
  data: {
    data: TechnicalIndicator[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface LatestIndicatorsResponse {
  success: boolean;
  message: string;
  data: Record<string, TechnicalIndicator>; // { RSI: TechnicalIndicator, MACD: TechnicalIndicator, ... }
}

// Indicator Names as Union Type
export type IndicatorName = 
  | 'RSI' 
  | 'MACD' 
  | 'MACD_SIGNAL' 
  | 'MACD_HISTOGRAM'
  | 'EMA_20' 
  | 'EMA_50' 
  | 'SMA_20' 
  | 'SMA_50'
  | 'BB_UPPER' 
  | 'BB_MIDDLE' 
  | 'BB_LOWER'
  | 'STOCH_K' 
  | 'STOCH_D' 
  | 'WILLIAMS_R'
  | 'CCI' 
  | 'ADX' 
  | 'ATR';

// Timeframe Types
export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w' | '1M';

// Signal Types
export type SignalType = 'bullish' | 'bearish' | 'neutral' | 'overbought' | 'oversold' | 'strong_buy' | 'strong_sell';