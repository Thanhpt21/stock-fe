// hooks/portfolio/usePortfolioItems.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { PortfolioItem } from '@/types/portfolio-item'

export const usePortfolioItems = (portfolioId: number) => {
  return useQuery({
    queryKey: ['portfolioItems', portfolioId],
    queryFn: async () => {
      const res = await api.get(`/v1/portfolio-item/${portfolioId}`)
      return res.data.data as PortfolioItem[]
    },
    enabled: !!portfolioId,
  })
}
