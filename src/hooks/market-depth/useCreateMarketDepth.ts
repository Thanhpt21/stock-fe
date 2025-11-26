// hooks/market-depth/useCreateMarketDepth.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { CreateMarketDepthDto, MarketDepthResponse } from '@/types/market-depth'

export const useCreateMarketDepth = () => {
  const queryClient = useQueryClient()

  return useMutation<MarketDepthResponse, Error, CreateMarketDepthDto>({
    mutationFn: async (dto: CreateMarketDepthDto) => {
      const res = await api.post('/v1/market-depth', dto)
      return res.data
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['market-depths'] })
      queryClient.invalidateQueries({ 
        queryKey: ['order-book', data.data.symbol] 
      })
    },
  })
}