// hooks/order/useGetOrderStats.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { OrderStatsResponse } from '@/types/order'

export const useGetOrderStats = (accountId: number) => {
  return useQuery({
    queryKey: ['order-stats', accountId],
    queryFn: async (): Promise<OrderStatsResponse['data']> => {
      const res = await api.get<OrderStatsResponse>(`/orders/account/${accountId}/stats`)
      return res.data.data
    },
    enabled: !!accountId,
  })
}