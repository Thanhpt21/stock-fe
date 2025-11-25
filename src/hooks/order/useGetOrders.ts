// hooks/order/useGetOrders.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { OrdersResponse } from '@/types/order'

export const useGetOrders = (accountId: number) => {
  return useQuery({
    queryKey: ['orders', 'account', accountId],
    queryFn: async (): Promise<OrdersResponse['data']> => {
      const res = await api.get<OrdersResponse>(`/orders/account/${accountId}`)
      return res.data.data
    },
    enabled: !!accountId,
  })
}