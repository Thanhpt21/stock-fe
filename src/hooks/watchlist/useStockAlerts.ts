// hooks/watchlist/useStockAlerts.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useStockAlerts = () => {
  return useQuery({
    queryKey: ['stockAlerts'],
    queryFn: async () => {
      const res = await api.get('/watchlist/alerts')
      return res.data.data // Array of StockAlertResponseDto
    },
  })
}