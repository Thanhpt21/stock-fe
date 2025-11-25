// hooks/stock/useStockSearch.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseStockSearchParams {
  search?: string
  market?: string
  page?: number
  limit?: number
  enabled?: boolean
}

export const useStockSearch = ({
  search = '',
  market,
  page = 1,
  limit = 20,
  enabled = true,
}: UseStockSearchParams = {}) => {
  return useQuery({
    queryKey: ['stockSearch', search, market, page, limit],
    queryFn: async () => {
      const res = await api.get('/stocks/search', {
        params: { search, market, page, limit },
      })
      return res.data.data // { data: Stock[], total: number, page: number, pageCount: number }
    },
    enabled: enabled && (!!search || !!market),
  })
}