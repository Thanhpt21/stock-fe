// hooks/technical-indicators/useCreateTechnicalIndicator.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { CreateTechnicalIndicatorDto, TechnicalIndicatorResponse } from '@/types/technical-indicators'

export const useCreateTechnicalIndicator = () => {
  const queryClient = useQueryClient()

  return useMutation<TechnicalIndicatorResponse, Error, CreateTechnicalIndicatorDto>({
    mutationFn: async (dto: CreateTechnicalIndicatorDto) => {
      const res = await api.post('/v1/technical-indicators', dto)
      return res.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['technical-indicators'] })
      queryClient.invalidateQueries({ 
        queryKey: ['technical-indicators', 'symbol', data.data.symbol] 
      })
      queryClient.invalidateQueries({ 
        queryKey: ['technical-indicators', 'latest', data.data.symbol] 
      })
    },
  })
}