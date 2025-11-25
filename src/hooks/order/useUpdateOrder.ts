// hooks/order/useUpdateOrder.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { UpdateOrderRequest, OrderResponse } from '@/types/order'

export const useUpdateOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ orderId, data }: { orderId: number; data: UpdateOrderRequest }): Promise<OrderResponse['data']> => {
      const res = await api.put<OrderResponse>(`/orders/${orderId}`, data)
      return res.data.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'account', data.accountId] })
      queryClient.invalidateQueries({ queryKey: ['order', data.id] })
    },
  })
}