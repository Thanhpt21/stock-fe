// hooks/market-depth/useMarketDepths.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { MarketDepth, MarketDepthQuery } from '@/types/market-depth'

interface MarketDepthListResponse {
  data: MarketDepth[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const useMarketDepths = (query?: MarketDepthQuery) => {
  return useQuery({
    queryKey: ['market-depths', query],
    queryFn: async (): Promise<MarketDepthListResponse> => {
      const params = new URLSearchParams()
      
      if (query?.symbol) params.append('symbol', query.symbol)
      if (query?.side) params.append('side', query.side)
      if (query?.page) params.append('page', query.page.toString())
      if (query?.limit) params.append('limit', query.limit.toString())

      const res = await api.get(`/v1/market-depth?${params.toString()}`)
      return res.data.data
    },
    staleTime: 3000, // 3 seconds for real-time data
  })
}