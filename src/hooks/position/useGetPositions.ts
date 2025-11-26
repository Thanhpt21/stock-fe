// hooks/position/useGetPositions.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { PositionsResponse } from '@/types/position.type'

export const useGetPositions = (accountId: number) => {
  return useQuery({
    queryKey: ['positions', 'account', accountId],
    queryFn: async (): Promise<PositionsResponse['data']> => {
      const res = await api.get<PositionsResponse>(`/positions/account/${accountId}`)
      return res.data.data
    },
    enabled: !!accountId,
    refetchInterval: 3000, // Refresh every 5 seconds
  })
}