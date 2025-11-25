// components/stocks/StockSearch.tsx
'use client';

import { useState, useEffect } from 'react';
import { useStockSearch } from '@/hooks/stock/useStockSearch';
import { StockData } from '@/types/stock';

interface StockSearchProps {
  onStockSelect: (stock: StockData) => void;
  onSearch?: (query: string) => void; // Thêm prop optional onSearch
}

export const StockSearch = ({ onStockSelect, onSearch }: StockSearchProps) => {
  const [query, setQuery] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { data: searchResults, isLoading } = useStockSearch({
    search: query,
    enabled: query.length >= 2, // Chỉ search khi có ít nhất 2 ký tự
  });

  // Gọi onSearch khi query thay đổi
  useEffect(() => {
    if (onSearch) {
      onSearch(query);
    }
  }, [query, onSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length >= 2);
  };

  const handleStockSelect = (stock: StockData) => {
    onStockSelect(stock);
    setQuery('');
    setIsOpen(false);
  };

  const handleBlur = () => {
    // Delay hiding dropdown để người dùng có thể click vào kết quả
    setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="Tìm kiếm mã cổ phiếu..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && searchResults && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {searchResults.data.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500">
              Không tìm thấy kết quả
            </div>
          ) : (
            searchResults.data.map((stock: StockData) => (
              <div
                key={stock.symbol}
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={() => handleStockSelect(stock)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-gray-900">
                      {stock.symbol}
                    </span>
                    <span className="ml-2 text-sm text-gray-600">
                      {stock.market}
                    </span>
                  </div>
                  <div className={`text-sm font-semibold ${
                    stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stock.price.toLocaleString()}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {stock.companyName || 'Công ty cổ phần'}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};