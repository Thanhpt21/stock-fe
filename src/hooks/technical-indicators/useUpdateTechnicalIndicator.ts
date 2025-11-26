// hooks/technical-indicators/useUpdateTechnicalIndicator.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { UpdateTechnicalIndicatorDto, TechnicalIndicatorResponse } from '@/types/technical-indicators'

export const useUpdateTechnicalIndicator = (id: number) => {
  const queryClient = useQueryClient()

  return useMutation<TechnicalIndicatorResponse, Error, UpdateTechnicalIndicatorDto>({
    mutationFn: async (dto: UpdateTechnicalIndicatorDto) => {
      const res = await api.put(`/v1/technical-indicators/${id}`, dto)
      return res.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['technical-indicators'] })
      queryClient.invalidateQueries({ queryKey: ['technical-indicator', id] })
      queryClient.invalidateQueries({ 
        queryKey: ['technical-indicators', 'symbol', data.data.symbol] 
      })
    },
  })
}