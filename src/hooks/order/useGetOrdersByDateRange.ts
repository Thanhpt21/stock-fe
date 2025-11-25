// hooks/order/useGetOrdersByDateRange.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { OrdersResponse } from '@/types/order'

interface DateRangeParams {
  startDate: string
  endDate: string
}

export const useGetOrdersByDateRange = (accountId: number, params: DateRangeParams) => {
  return useQuery({
    queryKey: ['orders', 'account', accountId, 'date-range', params],
    queryFn: async (): Promise<OrdersResponse['data']> => {
      const res = await api.get<OrdersResponse>(`/orders/account/${accountId}/date-range`, {
        params
      })
      return res.data.data
    },
    enabled: !!accountId && !!params.startDate && !!params.endDate,
  })
}