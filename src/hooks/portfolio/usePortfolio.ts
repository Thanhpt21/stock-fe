import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { Portfolio } from '@/types/portfolio'

export const usePortfolio = (id: number, enabled = true) => {
  return useQuery({
    queryKey: ['portfolio', id],
    queryFn: async (): Promise<Portfolio> => {
      const res = await api.get(`/v1/portfolio/${id}`)
      return res.data.data
    },
    enabled,
    staleTime: 5000,
  })
}
