// hooks/watchlist/useUpdateWatchlist.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseUpdateWatchlistParams {
  name?: string
  isDefault?: boolean
}

export const useUpdateWatchlist = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UseUpdateWatchlistParams }) => {
      const res = await api.put(`/watchlist/${id}`, data)
      return res.data.data // WatchlistResponseDto
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] })
    },
  })
}