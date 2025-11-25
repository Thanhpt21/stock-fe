// hooks/stock/useStockWatchlist.ts
import { useBatchStockPrices } from './useBatchStockPrices'

interface UseStockWatchlistParams {
  watchlist: string[]
  refetchInterval?: number
}

export const useStockWatchlist = ({
  watchlist,
  refetchInterval = 3000, // Very frequent updates for watchlist
}: UseStockWatchlistParams) => {
  const { data, error, isLoading, isFetching } = useBatchStockPrices({
    symbols: watchlist,
    refetchInterval,
  })

  return {
    stocks: data || [],
    error,
    isLoading,
    isFetching,
    // Helper methods
    getStock: (symbol: string) => data?.find((stock: any) => stock.symbol === symbol),
    isStockUp: (symbol: string) => {
      const stock = data?.find((s: any) => s.symbol === symbol)
      return stock ? stock.change > 0 : false
    },
    isStockDown: (symbol: string) => {
      const stock = data?.find((s: any) => s.symbol === symbol)
      return stock ? stock.change < 0 : false
    },
  }
}