
export interface Position {
  id: number;
  accountId: number;
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice?: number;
  unrealizedPL: number;
  realizedPL: number;
  lastUpdated: string;
}

export interface PositionsResponse {
  success: boolean;
  message: string;
  data: Position[];
}

export interface PositionResponse {
  success: boolean;
  message: string;
  data: Position;
}