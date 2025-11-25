// hooks/stock/useMarketOverview.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useMarketOverview = (refetchInterval?: number) => {
  return useQuery({
    queryKey: ['marketOverview'],
    queryFn: async () => {
      const res = await api.get('/stocks/market/overview')
      return res.data.data // Array of market summaries
    },
    refetchInterval: refetchInterval || 10000, // 10 seconds default
    staleTime: 0,
  })
}