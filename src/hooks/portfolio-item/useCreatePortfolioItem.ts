// hooks/portfolio/useCreatePortfolioItem.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { CreatePortfolioItemDto } from '@/types/portfolio-item'

export const useCreatePortfolioItem = (portfolioId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dto: CreatePortfolioItemDto) => {
      const res = await api.post('/v1/portfolio-item', dto)
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolioItems', portfolioId] })
    },
  })
}
