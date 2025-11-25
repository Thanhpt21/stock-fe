// hooks/order/useGetOrdersBySymbol.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { OrdersResponse } from '@/types/order'

export const useGetOrdersBySymbol = (accountId: number, symbol: string) => {
  return useQuery({
    queryKey: ['orders', 'account', accountId, 'symbol', symbol],
    queryFn: async (): Promise<OrdersResponse['data']> => {
      const res = await api.get<OrdersResponse>(`/orders/account/${accountId}/symbol/${symbol}`)
      return res.data.data
    },
    enabled: !!accountId && !!symbol,
  })
}