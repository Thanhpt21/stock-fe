// hooks/position/useGetAllPositions.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { PositionsResponse } from '@/types/position.type';

export const useGetAllPositions = (accountIds: number[]) => {
  return useQuery({
    queryKey: ['all-positions', accountIds],
    queryFn: async (): Promise<{ [accountId: number]: PositionsResponse['data'] }> => {
      if (!accountIds || accountIds.length === 0) return {};

      const positionsMap: { [accountId: number]: PositionsResponse['data'] } = {};
      
      // Lấy positions cho từng tài khoản
      await Promise.all(
        accountIds.map(async (accountId) => {
          try {
            const res = await api.get<PositionsResponse>(`/positions/account/${accountId}`);
            if (res.data.success) {
              positionsMap[accountId] = res.data.data;
            }
          } catch (error) {
            console.error(`Error fetching positions for account ${accountId}:`, error);
            positionsMap[accountId] = [];
          }
        })
      );

      return positionsMap;
    },
    enabled: accountIds.length > 0,
  });
}