// hooks/watchlist/useRemoveFromWatchlist.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useRemoveFromWatchlist = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ watchlistId, symbol }: { watchlistId: number; symbol: string }) => {
      const res = await api.delete(`/watchlist/${watchlistId}/items/${symbol}`)
      return res.data.data // WatchlistResponseDto
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] })
      queryClient.invalidateQueries({ queryKey: ['watchlist', variables.watchlistId, 'with-stocks'] })
    },
  })
}