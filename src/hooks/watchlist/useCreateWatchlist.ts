// hooks/watchlist/useCreateWatchlist.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseCreateWatchlistParams {
  name: string
  isDefault?: boolean
}

export const useCreateWatchlist = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UseCreateWatchlistParams) => {
      const res = await api.post('/watchlist', data)
      return res.data.data // WatchlistResponseDto
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] })
    },
  })
}