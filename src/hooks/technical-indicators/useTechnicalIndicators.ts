// hooks/technical-indicators/useTechnicalIndicators.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { TechnicalIndicator, TechnicalIndicatorQuery } from '@/types/technical-indicators'

interface TechnicalIndicatorListResponse {
  data: TechnicalIndicator[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const useTechnicalIndicators = (query?: TechnicalIndicatorQuery) => {
  return useQuery({
    queryKey: ['technical-indicators', query],
    queryFn: async (): Promise<TechnicalIndicatorListResponse> => {
      const params = new URLSearchParams()
      
      if (query?.symbol) params.append('symbol', query.symbol)
      if (query?.indicator) params.append('indicator', query.indicator)
      if (query?.timeframe) params.append('timeframe', query.timeframe)
      if (query?.page) params.append('page', query.page.toString())
      if (query?.limit) params.append('limit', query.limit.toString())

      const res = await api.get(`/v1/technical-indicators?${params.toString()}`)
      return res.data.data
    },
    staleTime: 10000, // 10 seconds for indicator data
  })
}