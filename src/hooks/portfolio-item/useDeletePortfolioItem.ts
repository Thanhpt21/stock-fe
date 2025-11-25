// hooks/portfolio/useDeletePortfolioItem.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useDeletePortfolioItem = (portfolioId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (itemId: number) => {
      const res = await api.delete(`/v1/portfolio-item/${itemId}`)
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolioItems', portfolioId] })
    },
  })
}
