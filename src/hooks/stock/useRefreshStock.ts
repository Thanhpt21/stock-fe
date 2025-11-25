// hooks/stock/useRefreshStock.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useRefreshStock = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (symbol: string) => {
      const res = await api.get(`/stocks/price/${symbol}`)
      return res.data.data
    },
    onSuccess: (data, symbol) => {
      // Update cache manually
      queryClient.setQueryData(['stockPrice', symbol], data)
    },
  })
}