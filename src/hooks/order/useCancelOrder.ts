// hooks/order/useCancelOrder.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { OrderResponse } from '@/types/order'

export const useCancelOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderId: number): Promise<OrderResponse['data']> => {
      const res = await api.delete<OrderResponse>(`/orders/${orderId}/cancel`)
      return res.data.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'account', data.accountId] })
      queryClient.invalidateQueries({ queryKey: ['order-stats', data.accountId] })
      queryClient.invalidateQueries({ queryKey: ['order', data.id] })
    },
  })
}