// hooks/order/useGetOrder.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { OrderResponse } from '@/types/order'

export const useGetOrder = (orderId: number) => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async (): Promise<OrderResponse['data']> => {
      const res = await api.get<OrderResponse>(`/orders/${orderId}`)
      return res.data.data
    },
    enabled: !!orderId,
  })
}