// app/stocks/page.tsx
'use client';

import { useState } from 'react';
import { StockCard } from '@/components/stocks/StockCard';
import { StockSearch } from '@/components/stocks/StockSearch';
import { useBatchStockPrices } from '@/hooks/stock/useBatchStockPrices';
import { useStockSearch } from '@/hooks/stock/useStockSearch';
import { useMarketOverview } from '@/hooks/stock/useMarketOverview';
import { StockData } from '@/types/stock';

// Danh sách cổ phiếu mặc định để hiển thị
const DEFAULT_STOCKS = ['VIC', 'VNM', 'HPG', 'SSI', 'FPT', 'ACB', 'SHB', 'OCH'];

export default function StocksPage() {
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
            <StockSearch 
              onStockSelect={handleStockSelect} 
              onSearch={handleSearch}
            />
          </div>

          {/* Thông tin số lượng */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-gray-600">
              Hiển thị {displayStocks?.length || 0} mã chứng khoán
              {searchQuery && searchResults && (
                <span className="ml-2">
                  • Tìm thấy {searchResults.total} kết quả
                </span>
              )}
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

        {/* Grid View */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

        {/* Empty State */}
        {!isLoading && (!displayStocks || displayStocks.length === 0) && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy cổ phiếu</h3>
            <p className="text-gray-500">
              {searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Đang tải dữ liệu thị trường...'}
            </p>
          </div>
        )}

        {/* Selected Stock Details */}
        {selectedStock && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedStock.symbol}
                </h2>
                <p className="text-gray-600">{selectedStock.companyName || 'Công ty cổ phần'}</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {selectedStock.market}
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Giá hiện tại:</span>
                <div className={`text-lg font-bold ${
                  selectedStock.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {selectedStock.price.toLocaleString()} ₫
                </div>
              </div>
              <div>
                <span className="text-gray-600">Thay đổi:</span>
                <div className={`font-bold ${
                  selectedStock.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {selectedStock.change >= 0 ? '+' : ''}{selectedStock.change} ₫
                </div>
              </div>
              <div>
                <span className="text-gray-600">% Thay đổi:</span>
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
            </div>

            {/* Additional Info */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Giá mở cửa:</span>
                  <span className="ml-2 font-medium">{selectedStock.open?.toLocaleString() || 'N/A'} ₫</span>
                </div>
                <div>
                  <span className="text-gray-600">Giá cao nhất:</span>
                  <span className="ml-2 font-medium text-green-600">{selectedStock.high?.toLocaleString() || 'N/A'} ₫</span>
                </div>
                <div>
                  <span className="text-gray-600">Giá thấp nhất:</span>
                  <span className="ml-2 font-medium text-red-600">{selectedStock.low?.toLocaleString() || 'N/A'} ₫</span>
                </div>
                <div>
                  <span className="text-gray-600">Giá đóng cửa trước:</span>
                  <span className="ml-2 font-medium">{selectedStock.previousClose?.toLocaleString() || 'N/A'} ₫</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}