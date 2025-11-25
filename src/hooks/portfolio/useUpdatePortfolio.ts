import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { UpdatePortfolioDto } from '@/types/portfolio'

export const useUpdatePortfolio = (id: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dto: UpdatePortfolioDto) => {
      const res = await api.put(`/v1/portfolio/${id}`, dto)
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] })
      queryClient.invalidateQueries({ queryKey: ['portfolio', id] })
    },
  })
}
