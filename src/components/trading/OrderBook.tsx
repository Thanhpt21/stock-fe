// components/trading/OrderBook.tsx
'use client';

import { useState, useEffect } from 'react';

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

  useEffect(() => {
    // Mock order book data
    const generateOrderBook = () => {
      const basePrice = 50000;
      const newBids: OrderBookEntry[] = [];
      const newAsks: OrderBookEntry[] = [];

      for (let i = 0; i < 10; i++) {
        const bidPrice = basePrice - (i * 100);
        const askPrice = basePrice + (i * 100);
        
        newBids.push({
          price: bidPrice,
          quantity: Math.floor(Math.random() * 10000) + 1000,
          total: bidPrice * 1000
        });

        newAsks.push({
          price: askPrice,
          quantity: Math.floor(Math.random() * 10000) + 1000,
          total: askPrice * 1000
        });
      }

      setBids(newBids.sort((a, b) => b.price - a.price));
      setAsks(newAsks.sort((a, b) => a.price - b.price));
    };

    generateOrderBook();
    const interval = setInterval(generateOrderBook, 3000);
    return () => clearInterval(interval);
  }, [symbol]);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  return (
    <div className="h-full p-4">
      <h3 className="font-semibold text-gray-900 mb-4">Order Book - {symbol}</h3>
      
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
              <div key={index} className="flex justify-between text-sm">
                <span className="text-green-600 font-medium">{formatMoney(bid.price)}</span>
                <span className="text-gray-600">{formatMoney(bid.quantity)}</span>
                <span className="text-gray-500">{formatMoney(bid.total)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Current Price */}
        <div className="text-center py-2 border-y border-gray-200">
          <div className="text-lg font-bold text-blue-600">
            {formatMoney(50000)}
          </div>
          <div className="text-xs text-gray-500">Giá hiện tại</div>
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
              <div key={index} className="flex justify-between text-sm">
                <span className="text-red-600 font-medium">{formatMoney(ask.price)}</span>
                <span className="text-gray-600">{formatMoney(ask.quantity)}</span>
                <span className="text-gray-500">{formatMoney(ask.total)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};