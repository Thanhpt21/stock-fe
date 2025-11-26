// app/trading/page.tsx - FIXED WITH CONTAINER
'use client';

import { useState, useEffect } from 'react';
import { AccountSelector } from '@/components/trading/AccountSelector';
import { OrderPanel } from '@/components/trading/OrderPanel';
import { PositionsPanel } from '@/components/trading/PositionsPanel';
import { OrderBook } from '@/components/trading/OrderBook';
import { useStockPrice } from '@/hooks/stock/useStockPrice';
import { TradingChart } from '@/components/trading/TradingChart';

export default function TradingPage() {
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('VIC');
  
  // Lấy giá cổ phiếu realtime
  const { data: stockData, isLoading: priceLoading } = useStockPrice({
    symbol: selectedSymbol,
    refetchInterval: 3000
  });

  const currentPrice = stockData?.price || 0;

  // Mock symbols for demo
  const symbols = ['VIC', 'VNM', 'HPG', 'SSI', 'FPT'];

  return (
    // SỬA: Xóa h-screen, thêm container giống footer
    <div className="flex flex-col w-full bg-gray-50 overflow-hidden">
      {/* Trading Header với Container */}
      <header className="bg-white border-b border-gray-200 py-4 shrink-0 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> {/* Container giống footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Giao dịch</h1>
                <p className="text-sm text-gray-500">Thực hiện giao dịch chứng khoán</p>
              </div>
              
              {/* Symbol Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Mã CK:</span>
                <select 
                  value={selectedSymbol}
                  onChange={(e) => setSelectedSymbol(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  {symbols.map(symbol => (
                    <option key={symbol} value={symbol}>{symbol}</option>
                  ))}
                </select>
                {priceLoading ? (
                  <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <div className={`text-sm font-semibold ${
                    stockData?.change && stockData.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {currentPrice.toLocaleString('vi-VN')} 
                    {stockData?.change && (
                      <span className="ml-1">
                        {stockData.change >= 0 ? '+' : ''}{stockData.change} 
                        ({stockData.changePercent && stockData.changePercent >= 0 ? '+' : ''}{stockData.changePercent}%)
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <AccountSelector onAccountSelect={setSelectedAccountId} />
          </div>
        </div>
      </header>

      {/* Main Content Area với Container */}
      <div className="flex-1 flex overflow-hidden w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex"> {/* Container giống footer */}
          {/* Left Panel - Order Panel */}
          <div className="w-96 bg-white border-r border-gray-200">
            <OrderPanel 
              symbol={selectedSymbol}
              currentPrice={currentPrice}
              accountId={selectedAccountId || 0}
            />
          </div>
          
          {/* Center Panel - Chart & Positions */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            {/* Chart Container */}
            <div className="h-2/3 bg-white border-b border-gray-200 shrink-0">
              <TradingChart 
                symbol={selectedSymbol}
                currentPrice={currentPrice}
              />
            </div>
            
            {/* Positions Panel */}
            <div className="flex-1 overflow-y-auto">
              <div className="h-full">
                <PositionsPanel accountId={selectedAccountId || 0} />
              </div>
            </div>
          </div>
          
          {/* Right Panel - Order Book */}
          <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
            <OrderBook symbol={selectedSymbol} />
          </div>
        </div>
      </div>
    </div>
  );
}