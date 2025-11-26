// hooks/technical-indicators/useDeleteTechnicalIndicator.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useDeleteTechnicalIndicator = () => {
  const queryClient = useQueryClient()

  return useMutation<any, Error, number>({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/v1/technical-indicators/${id}`)
      return res.data
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['technical-indicators'] })
      queryClient.removeQueries({ queryKey: ['technical-indicator', id] })
    },
  })
}