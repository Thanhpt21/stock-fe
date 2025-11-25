// hooks/order/useGetOrdersByStatus.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { OrdersResponse } from '@/types/order'

export const useGetOrdersByStatus = (accountId: number, status: string) => {
  return useQuery({
    queryKey: ['orders', 'account', accountId, 'status', status],
    queryFn: async (): Promise<OrdersResponse['data']> => {
      const res = await api.get<OrdersResponse>(`/orders/account/${accountId}/status/${status}`)
      return res.data.data
    },
    enabled: !!accountId && !!status,
  })
}