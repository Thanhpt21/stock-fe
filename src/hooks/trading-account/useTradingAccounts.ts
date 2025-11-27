// hooks/trading/useTradingAccounts.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { TradingAccount } from '@/types/trading-account'

export const useTradingAccounts = (userId: number) => {
  return useQuery({
    queryKey: ['trading-accounts', userId],
    queryFn: async (): Promise<TradingAccount[]> => {
      const res = await api.get(`/trading-account/user/${userId}`)
      return res.data.data
    },
    enabled: !!userId,
    refetchInterval: 3000, // ✅ Polling mỗi 5 giây
    refetchIntervalInBackground: true, // ✅ Tiếp tục polling khi tab không active
    staleTime: 3000, // ✅ Data được coi là stale sau 3 giây
  })
}