import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { PortfolioSnapshotListResponse } from '@/types/portfolio-snapshot'

export const usePortfolioSnapshots = (portfolioId: number) => {
  return useQuery<PortfolioSnapshotListResponse>({
    queryKey: ['portfolioSnapshots', portfolioId],
    queryFn: async () => {
      const res = await api.get(`/v1/portfolio-snapshot/${portfolioId}`)
      return res.data
    },
    enabled: !!portfolioId,
  })
}
