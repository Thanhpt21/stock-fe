// components/stocks/StockChart.tsx
'use client';

import { StockData } from '@/types/stock';
import { useEffect, useRef } from 'react';


interface StockChartProps {
  stock: StockData;
  height?: number;
}

export const StockChart = ({ stock, height = 400 }: StockChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // TODO: Integrate with real chart library like Chart.js, Recharts, or TradingView
    // This is a placeholder for chart implementation
    if (chartRef.current) {
      // Initialize chart here
      console.log('Initialize chart for:', stock.symbol);
    }
  }, [stock]);

  return (
    <div 
      ref={chartRef}
      className="w-full bg-gray-100 rounded-lg flex items-center justify-center"
      style={{ height }}
    >
      <div className="text-center text-gray-500">
        <div className="text-lg font-semibold mb-2">{stock.symbol} Chart</div>
        <div className="text-sm">
          Biểu đồ giá {stock.symbol} - {stock.price.toLocaleString()}
        </div>
        <div className={`text-sm ${
          stock.change >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {stock.change >= 0 ? '+' : ''}{stock.change} ({stock.changePercent}%)
        </div>
      </div>
    </div>
  );
};