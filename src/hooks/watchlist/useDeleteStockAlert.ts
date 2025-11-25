// hooks/watchlist/useDeleteStockAlert.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useDeleteStockAlert = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/watchlist/alerts/${id}`)
      return res.data // { success, message }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockAlerts'] })
    },
  })
}