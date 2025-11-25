// hooks/watchlist/useWatchlistWithStocks.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseWatchlistWithStocksParams {
  watchlistId: number
  enabled?: boolean
  refetchInterval?: number
}

export const useWatchlistWithStocks = ({
  watchlistId,
  enabled = true,
  refetchInterval = 5000,
}: UseWatchlistWithStocksParams) => {
  return useQuery({
    queryKey: ['watchlist', watchlistId, 'with-stocks'],
    queryFn: async () => {
      const res = await api.get(`/watchlist/${watchlistId}/with-stocks`)
      return res.data.data // WatchlistWithStocksResponseDto
    },
    enabled: enabled && !!watchlistId,
    refetchInterval,
    staleTime: 0,
  })
}