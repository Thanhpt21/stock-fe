// hooks/order/useCreateOrder.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { CreateOrderRequest, OrderResponse } from '@/types/order'

export const useCreateOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateOrderRequest): Promise<OrderResponse['data']> => {
      const res = await api.post<OrderResponse>('/orders', data)
      return res.data.data
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['orders', 'account', variables.accountId] })
      queryClient.invalidateQueries({ queryKey: ['order-stats', variables.accountId] })
      queryClient.invalidateQueries({ queryKey: ['trading-accounts'] }) // Update account balance
    },
  })
}