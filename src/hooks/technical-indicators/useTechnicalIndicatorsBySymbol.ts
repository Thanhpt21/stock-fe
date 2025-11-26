// hooks/technical-indicators/useTechnicalIndicatorsBySymbol.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { TechnicalIndicator } from '@/types/technical-indicators'

export const useTechnicalIndicatorsBySymbol = (symbol: string, enabled = true) => {
  return useQuery({
    queryKey: ['technical-indicators', 'symbol', symbol],
    queryFn: async (): Promise<TechnicalIndicator[]> => {
      const res = await api.get(`/v1/technical-indicators/symbol/${symbol}`)
      return res.data.data
    },
    enabled: enabled && !!symbol,
    staleTime: 10000,
  })
}