// hooks/watchlist/useAddToWatchlist.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseAddToWatchlistParams {
  symbol: string
  note?: string
}

export const useAddToWatchlist = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ watchlistId, data }: { watchlistId: number; data: UseAddToWatchlistParams }) => {
      const res = await api.post(`/watchlist/${watchlistId}/items`, data)
      return res.data.data // WatchlistResponseDto
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] })
      queryClient.invalidateQueries({ queryKey: ['watchlist', variables.watchlistId, 'with-stocks'] })
    },
  })
}