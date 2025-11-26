// hooks/market-depth/useDeleteMarketDepth.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'


export const useDeleteMarketDepth = () => {
  const queryClient = useQueryClient()

  return useMutation<any, Error, number>({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/v1/market-depth/${id}`)
      return res.data
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['market-depths'] })
      // Also invalidate any cached individual market depth
      queryClient.removeQueries({ queryKey: ['market-depth', id] })
    },
  })
}