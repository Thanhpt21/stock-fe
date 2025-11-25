// hooks/watchlist/useUpdateStockAlert.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseUpdateStockAlertParams {
  symbol?: string
  alertType?: 'PRICE_ABOVE' | 'PRICE_BELOW' | 'PERCENT_UP' | 'PERCENT_DOWN' | 'VOLUME_SPIKE'
  targetValue?: number
  isActive?: boolean
}

export const useUpdateStockAlert = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UseUpdateStockAlertParams }) => {
      const res = await api.put(`/watchlist/alerts/${id}`, data)
      return res.data.data // StockAlertResponseDto
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockAlerts'] })
    },
  })
}