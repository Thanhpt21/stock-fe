// hooks/watchlist/useCreateStockAlert.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseCreateStockAlertParams {
  symbol: string
  alertType: 'PRICE_ABOVE' | 'PRICE_BELOW' | 'PERCENT_UP' | 'PERCENT_DOWN' | 'VOLUME_SPIKE'
  targetValue: number
  isActive?: boolean
}

export const useCreateStockAlert = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UseCreateStockAlertParams) => {
      const res = await api.post('/watchlist/alerts', data)
      return res.data.data // StockAlertResponseDto
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockAlerts'] })
    },
  })
}