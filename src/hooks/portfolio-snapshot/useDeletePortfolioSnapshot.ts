// useDeletePortfolioSnapshot.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { PortfolioSnapshot } from '@/types/portfolio-snapshot'

export const useDeletePortfolioSnapshot = (portfolioId: number) => {
  const queryClient = useQueryClient()

  return useMutation<PortfolioSnapshot, unknown, number>({
    mutationFn: async (id) => {
      const res = await api.delete(`/v1/portfolio-snapshot/${id}`)
      return res.data.data // chỉ lấy data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolioSnapshots', portfolioId] })
      queryClient.invalidateQueries({ queryKey: ['portfolios'] })
    },
  })
}