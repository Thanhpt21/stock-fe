// hooks/technical-indicators/useLatestTechnicalIndicators.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { LatestIndicatorsResponse } from '@/types/technical-indicators'

export const useLatestTechnicalIndicators = (
  symbol: string, 
  timeframe?: string, 
  enabled = true
) => {
  return useQuery({
    queryKey: ['technical-indicators', 'latest', symbol, timeframe],
    queryFn: async (): Promise<LatestIndicatorsResponse['data']> => {
      const url = timeframe 
        ? `/v1/technical-indicators/latest/${symbol}?timeframe=${timeframe}`
        : `/v1/technical-indicators/latest/${symbol}`
      
      const res = await api.get(url)
      return res.data.data
    },
    enabled: enabled && !!symbol,
    staleTime: 15000, // 15 seconds for latest data
    refetchInterval: 30000, // Refresh every 30s
  })
}