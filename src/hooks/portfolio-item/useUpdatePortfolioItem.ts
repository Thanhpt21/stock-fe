// hooks/portfolio/useUpdatePortfolioItem.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { UpdatePortfolioItemDto } from '@/types/portfolio-item'

export const useUpdatePortfolioItem = (portfolioId: number, itemId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dto: UpdatePortfolioItemDto) => {
      const res = await api.put(`/v1/portfolio-item/${itemId}`, dto)
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolioItems', portfolioId] })
      queryClient.invalidateQueries({ queryKey: ['portfolioItem', itemId] })
    },
  })
}
