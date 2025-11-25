// useCreatePortfolioSnapshot.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { CreatePortfolioSnapshotDto, PortfolioSnapshot } from '@/types/portfolio-snapshot'

export const useCreatePortfolioSnapshot = () => {
  const queryClient = useQueryClient()

  return useMutation<PortfolioSnapshot, unknown, CreatePortfolioSnapshotDto>({
    mutationFn: async (dto) => {
      const res = await api.post('/v1/portfolio-snapshot', dto)
      return res.data.data // chỉ lấy data
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['portfolioSnapshots', data.portfolioId] })
        queryClient.invalidateQueries({ queryKey: ['portfolios'] })
      }
    },
  })
}