// hooks/position/useGetPosition.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { PositionResponse } from '@/types/position.type'

export const useGetPosition = (positionId: number) => {
  return useQuery({
    queryKey: ['position', positionId],
    queryFn: async (): Promise<PositionResponse['data']> => {
      const res = await api.get<PositionResponse>(`/positions/${positionId}`)
      return res.data.data
    },
    enabled: !!positionId,
  })
}