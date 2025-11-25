import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { Portfolio } from '@/types/portfolio'

export const usePortfolios = () => {
  return useQuery({
    queryKey: ['portfolios'],
    queryFn: async (): Promise<Portfolio[]> => {
      const res = await api.get('/v1/portfolio')
      return res.data.data
    },
    staleTime: 5000, // Cache for 5s
  })
}
