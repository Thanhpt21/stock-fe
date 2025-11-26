// hooks/market-depth/useOrderBook.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { OrderBook } from '@/types/market-depth'

interface UseOrderBookOptions {
  symbol: string
  levels?: number
  enabled?: boolean
  refetchInterval?: number
}

export const useOrderBook = ({ 
  symbol, 
  levels = 10, 
  enabled = true,
  refetchInterval 
}: UseOrderBookOptions) => {
  return useQuery({
    queryKey: ['order-book', symbol, levels],
    queryFn: async (): Promise<OrderBook> => {
      const res = await api.get(`/v1/market-depth/order-book/${symbol}?levels=${levels}`)
      return res.data.data
    },
    enabled: enabled && !!symbol,
    staleTime: 2000, // Very short cache for real-time data
    refetchInterval: refetchInterval || 3000, // Auto-refresh every 3s
    refetchIntervalInBackground: true,
  })
}