// types/order.ts
export interface Order {
  id: number
  accountId: number
  symbol: string
  orderType: 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT'
  side: 'BUY' | 'SELL'
  quantity: number
  price?: number
  stopPrice?: number
  status: 'PENDING' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELLED' | 'REJECTED' | 'EXPIRED'
  filledQuantity: number
  averagePrice?: number
  orderDate: string
  notes?: string
  executions: Execution[]
}

export interface Execution {
  id: number
  quantity: number
  price: number
  executionTime: string
  commission: number
  tax: number
  exchange: string
}

export interface OrderStats {
  totalOrders: number
  pendingOrders: number
  filledOrders: number
  cancelledOrders: number
  totalBuyOrders: number
  totalSellOrders: number
  successRate: number
  totalVolume: number
  totalValue: number
}

export interface CreateOrderRequest {
  accountId: number
  symbol: string
  orderType: 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT'
  side: 'BUY' | 'SELL'
  quantity: number
  price?: number
  stopPrice?: number
  notes?: string
  currentPrice: number;
}

export interface UpdateOrderRequest {
  quantity?: number
  price?: number
  stopPrice?: number
  notes?: string
}

export interface OrdersResponse {
  success: boolean
  message: string
  data: Order[]
}

export interface OrderResponse {
  success: boolean
  message: string
  data: Order
}

export interface OrderStatsResponse {
  success: boolean
  message: string
  data: OrderStats
}