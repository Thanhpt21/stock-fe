// hooks/stock/useMarketNews.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseMarketNewsParams {
  symbol?: string
  limit?: number
  enabled?: boolean
}

export const useMarketNews = ({
  symbol,
  limit = 10,
  enabled = true,
}: UseMarketNewsParams = {}) => {
  return useQuery({
    queryKey: ['marketNews', symbol, limit],
    queryFn: async () => {
      const res = await api.get('/stocks/news', {
        params: { symbol, limit },
      })
      return res.data.data // Array of news items
    },
    enabled,
    refetchInterval: 60000, // 1 minute for news updates
  })
}