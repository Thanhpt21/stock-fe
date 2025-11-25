// hooks/stock/useStockPrice.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseStockPriceParams {
  symbol: string
  enabled?: boolean
  refetchInterval?: number // Polling interval
}

export const useStockPrice = ({
  symbol,
  enabled = true,
  refetchInterval = 5000, // 5 seconds default
}: UseStockPriceParams) => {
  return useQuery({
    queryKey: ['stockPrice', symbol],
    queryFn: async () => {
      const res = await api.get(`/stocks/price/${symbol}`)
      return res.data.data // StockPriceResponseDto
    },
    enabled: enabled && !!symbol,
    refetchInterval, // Polling for realtime data
    staleTime: 0, // Always consider data stale to force refetch
  })
}