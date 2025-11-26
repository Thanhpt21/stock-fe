// hooks/position/useDeletePosition.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface DeletePositionResponse {
  success: boolean;
  message: string;
  data: null;
}

export const useDeletePosition = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (positionId: number): Promise<DeletePositionResponse['data']> => {
      const res = await api.delete<DeletePositionResponse>(`/positions/${positionId}`)
      return res.data.data
    },
    onSuccess: (data, positionId) => {
      // Invalidate positions queries
      queryClient.invalidateQueries({ queryKey: ['positions'] })
      queryClient.invalidateQueries({ queryKey: ['position', positionId] })
    },
  })
}