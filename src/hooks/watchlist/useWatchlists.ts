import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { Watchlist } from '@/types/watchlist.type'

export const useWatchlists = () => {
  const query = useQuery({
    queryKey: ['watchlists'],
    queryFn: async () => {
      const res = await api.get('/watchlist')
      return res.data.data as Watchlist[]
    },
  })

  // Helpers

  const getDefaultWatchlist = () => {
    return query.data?.find(w => w.isDefault)
  }

  const hasStockInAnyWatchlist = (symbol: string) => {
    return query.data?.some(w =>
      w.items?.some(item => item.symbol === symbol)
    ) ?? false
  }

  return {
    ...query,
    getDefaultWatchlist,
    hasStockInAnyWatchlist
  }
}
