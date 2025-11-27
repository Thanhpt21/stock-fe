// components/trading/OrderBook.tsx - UPDATED
'use client';

import { useState, useEffect } from 'react';
import { useStockPrice } from '@/hooks/stock/useStockPrice';

interface OrderBookProps {
  symbol: string;
}

interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
}

export const OrderBook = ({ symbol }: OrderBookProps) => {
  const [bids, setBids] = useState<OrderBookEntry[]>([]);
  const [asks, setAsks] = useState<OrderBookEntry[]>([]);

  // Sử dụng useStockPrice để lấy giá thực tế
  const { data: stockData, isLoading: priceLoading } = useStockPrice({
    symbol: symbol,
    enabled: true,
    refetchInterval: 3000, // 3 giây như các component khác
  });

  const currentPrice = stockData?.price || 0;

  useEffect(() => {
    // Tạo order book data dựa trên giá thực tế
    const generateOrderBook = () => {
      if (!currentPrice) return;

      const basePrice = currentPrice;
      const newBids: OrderBookEntry[] = [];
      const newAsks: OrderBookEntry[] = [];

      // Tạo 10 levels cho mỗi bên
      for (let i = 0; i < 10; i++) {
        const bidPrice = Math.round(basePrice - (i * 100));
        const askPrice = Math.round(basePrice + (i * 100));
        
        // Random quantity với base hợp lý
        const bidQuantity = Math.floor(Math.random() * 5000) + 1000;
        const askQuantity = Math.floor(Math.random() * 5000) + 1000;
        
        newBids.push({
          price: bidPrice,
          quantity: bidQuantity,
          total: bidPrice * bidQuantity
        });

        newAsks.push({
          price: askPrice,
          quantity: askQuantity,
          total: askPrice * askQuantity
        });
      }

      setBids(newBids.sort((a, b) => b.price - a.price));
      setAsks(newAsks.sort((a, b) => a.price - b.price));
    };

    generateOrderBook();
    const interval = setInterval(generateOrderBook, 3000);
    return () => clearInterval(interval);
  }, [currentPrice]); // Chỉ chạy lại khi currentPrice thay đổi

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  if (priceLoading) {
    return (
      <div className="h-full p-4">
        <h3 className="font-semibold text-gray-900 mb-4">{symbol}</h3>
        <div className="animate-pulse space-y-4">
          {/* Bids Loading */}
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Giá mua</span>
              <span>KL</span>
              <span>Tổng</span>
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between mb-1">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
          
          {/* Current Price Loading */}
          <div className="text-center py-2">
            <div className="h-6 bg-gray-200 rounded w-24 mx-auto mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
          </div>
          
          {/* Asks Loading */}
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Giá bán</span>
              <span>KL</span>
              <span>Tổng</span>
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between mb-1">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-4">
      <h3 className="font-semibold text-gray-900 mb-4">{symbol}</h3>
      
      <div className="space-y-4">
        {/* Bids */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Giá mua</span>
            <span>KL</span>
            <span>Tổng</span>
          </div>
          <div className="space-y-1">
            {bids.map((bid, index) => (
              <div key={index} className="flex justify-between text-sm hover:bg-gray-50 px-1 py-0.5 rounded">
                <span className="text-green-600 font-medium">{formatMoney(bid.price)}</span>
                <span className="text-gray-600">{formatMoney(bid.quantity)}</span>
                <span className="text-gray-500">{formatMoney(bid.total)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Current Price với giá thực tế */}
        <div className="text-center py-2 border-y border-gray-200 bg-blue-50 rounded">
          <div className={`text-lg font-bold ${
            stockData?.change && stockData.change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatMoney(currentPrice)}
          </div>
          <div className="text-xs text-gray-500">Giá hiện tại</div>
          {stockData && (
            <div className={`text-xs ${
              stockData.change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {stockData.change >= 0 ? '+' : ''}{stockData.change} 
              ({stockData.changePercent >= 0 ? '+' : ''}{stockData.changePercent}%)
            </div>
          )}
        </div>

        {/* Asks */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Giá bán</span>
            <span>KL</span>
            <span>Tổng</span>
          </div>
          <div className="space-y-1">
            {asks.map((ask, index) => (
              <div key={index} className="flex justify-between text-sm hover:bg-gray-50 px-1 py-0.5 rounded">
                <span className="text-red-600 font-medium">{formatMoney(ask.price)}</span>
                <span className="text-gray-600">{formatMoney(ask.quantity)}</span>
                <span className="text-gray-500">{formatMoney(ask.total)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Thông tin thời gian cập nhật */}
    
    </div>
  );
};