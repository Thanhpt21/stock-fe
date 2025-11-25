import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { CreatePortfolioDto, Portfolio, PortfolioResponse } from '@/types/portfolio'

export const useCreatePortfolio = () => {
  const queryClient = useQueryClient()

  return useMutation<PortfolioResponse, any, CreatePortfolioDto>({
    mutationFn: async (dto) => {
      const res = await api.post('/v1/portfolio', dto)
      return res.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] })
    },
  })
}
