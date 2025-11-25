// hooks/stock/useBatchStockPrices.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseBatchStockPricesParams {
  symbols: string[]
  enabled?: boolean
  refetchInterval?: number
}

export const useBatchStockPrices = ({
  symbols,
  enabled = true,
  refetchInterval = 3000,
}: UseBatchStockPricesParams) => {
  return useQuery({
    queryKey: ['batchStockPrices', ...symbols.sort()],
    queryFn: async () => {
      const res = await api.post('/stocks/prices/batch', { symbols })
      return res.data.data // Array of StockPriceResponseDto
    },
    enabled: enabled && symbols.length > 0,
    refetchInterval,
    staleTime: 0,
  })
}