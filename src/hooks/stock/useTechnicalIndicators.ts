// hooks/stock/useTechnicalIndicators.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseTechnicalIndicatorsParams {
  symbol: string
  enabled?: boolean
  refetchInterval?: number
}

export const useTechnicalIndicators = ({
  symbol,
  enabled = true,
  refetchInterval = 30000, // 30 seconds default (technical indicators change slower)
}: UseTechnicalIndicatorsParams) => {
  return useQuery({
    queryKey: ['technicalIndicators', symbol],
    queryFn: async () => {
      const res = await api.get(`/stocks/technical/${symbol}`)
      return res.data.data // Technical indicators object
    },
    enabled: enabled && !!symbol,
    refetchInterval,
  })
}