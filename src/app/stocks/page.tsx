// app/stocks/page.tsx
'use client';

import { useState } from 'react';
import { StockTable } from '@/components/stocks/StockTable';
import { StockCard } from '@/components/stocks/StockCard';
import { StockSearch } from '@/components/stocks/StockSearch';
import { StockChart } from '@/components/stocks/StockChart';
import { useBatchStockPrices } from '@/hooks/stock/useBatchStockPrices';
import { useStockSearch } from '@/hooks/stock/useStockSearch';
import { useMarketOverview } from '@/hooks/stock/useMarketOverview';
import { StockData } from '@/types/stock';

type ViewMode = 'table' | 'grid' | 'chart';

// Danh sách cổ phiếu mặc định để hiển thị
const DEFAULT_STOCKS = ['VIC', 'VNM', 'HPG', 'SSI', 'FPT', 'ACB', 'SHB', 'OCH'];

export default function StocksPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Lấy dữ liệu realtime cho các cổ phiếu mặc định
  const { 
    data: stocks = [], 
    isLoading: stocksLoading, 
    isFetching: stocksRefreshing,
    error: stocksError 
  } = useBatchStockPrices({
    symbols: DEFAULT_STOCKS,
    refetchInterval: 3000, // 3 giây refresh một lần
  });

  // Tìm kiếm cổ phiếu
  const { 
    data: searchResults,
    isLoading: searchLoading 
  } = useStockSearch({
    search: searchQuery,
    enabled: searchQuery.length > 0,
  });

  // Lấy tổng quan thị trường
  const { 
    data: marketOverview 
  } = useMarketOverview(10000); // 10 giây refresh

  // Xử lý chọn cổ phiếu
  const handleStockSelect = (stock: StockData): void => {
    setSelectedStock(stock);
  };

  // Xử lý tìm kiếm
  const handleSearch = (query: string): void => {
    setSearchQuery(query);
  };

  // Hiển thị kết quả tìm kiếm hoặc danh sách mặc định
  const displayStocks = searchQuery && searchResults ? searchResults.data : stocks;
  const isLoading = stocksLoading || (searchQuery && searchLoading);

  if (stocksError) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-600">
            Lỗi khi tải dữ liệu cổ phiếu
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Thị trường chứng khoán
            {stocksRefreshing && (
              <span className="ml-2 text-sm text-green-600 animate-pulse">
                ● Đang cập nhật
              </span>
            )}
          </h1>
          
          {/* Market Overview */}
          {marketOverview && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {marketOverview.map((market: any) => (
                <div key={market.market} className="bg-white rounded-lg p-4 shadow">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{market.market}</span>
                    <span className={`text-sm ${
                      market.averageChange >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {market.averageChange >= 0 ? '+' : ''}{market.averageChange}%
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    {market.totalStocks} mã • KL: {(market.totalVolume / 1000000).toFixed(1)}M
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Search */}
          <div className="mb-6 max-w-md">
            <div className="mb-6 max-w-md">
              <StockSearch onStockSelect={handleStockSelect} />
            </div>
          </div>

          {/* View Toggle và thông tin */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-gray-600">
              Hiển thị {displayStocks?.length || 0} mã chứng khoán
              {searchQuery && searchResults && (
                <span className="ml-2">
                  • Tìm thấy {searchResults.total} kết quả
                </span>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('chart')}
                className={`px-4 py-2 rounded-lg ${
                  viewMode === 'chart' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 border'
                }`}
              >
                Biểu đồ
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 border'
                }`}
              >
                Lưới
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-lg ${
                  viewMode === 'table' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 border'
                }`}
              >
                Bảng
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        )}

        {/* Content */}
        {!isLoading && (
          <>
            {viewMode === 'chart' && selectedStock ? (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">
                  Biểu đồ {selectedStock.symbol}
                </h2>
                <StockChart stock={selectedStock} />
              </div>
            ) : viewMode === 'chart' && !selectedStock ? (
              <div className="text-center py-8 text-gray-500">
                Vui lòng chọn một cổ phiếu để xem biểu đồ
              </div>
            ) : viewMode === 'table' ? (
              <StockTable 
                stocks={displayStocks || []} 
                onStockSelect={handleStockSelect}
                isRefreshing={stocksRefreshing}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {(displayStocks || []).map((stock: StockData) => (
                  <StockCard 
                    key={stock.symbol} 
                    stock={stock} 
                    onSelect={handleStockSelect}
                    isSelected={selectedStock?.symbol === stock.symbol}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Selected Stock Details */}
        {selectedStock && viewMode !== 'chart' && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">
              Thông tin chi tiết {selectedStock.symbol}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Giá hiện tại:</span>
                <div className={`font-bold ${
                  selectedStock.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {selectedStock.price.toLocaleString()} 
                  <span className="ml-2">
                    ({selectedStock.change >= 0 ? '+' : ''}{selectedStock.change})
                  </span>
                </div>
              </div>
              <div>
                <span className="text-gray-600">Thay đổi:</span>
                <div className={`font-bold ${
                  selectedStock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {selectedStock.changePercent >= 0 ? '+' : ''}{selectedStock.changePercent}%
                </div>
              </div>
              <div>
                <span className="text-gray-600">KL giao dịch:</span>
                <div className="font-bold">
                  {(selectedStock.volume / 1000).toFixed(0)}K
                </div>
              </div>
              <div>
                <span className="text-gray-600">Thị trường:</span>
                <div className="font-bold">{selectedStock.market}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}