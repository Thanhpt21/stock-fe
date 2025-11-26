// components/trading/TradingChart.tsx
'use client';

import { useEffect, useRef } from 'react';

interface TradingChartProps {
  symbol: string;
  currentPrice: number;
}

export const TradingChart = ({ symbol, currentPrice }: TradingChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);

  // Mock chart data
  const generateChartData = () => {
    const data = [];
    let price = currentPrice;
    
    for (let i = 0; i < 50; i++) {
      const change = (Math.random() - 0.5) * currentPrice * 0.02;
      price = Math.max(price + change, currentPrice * 0.8);
      data.push(price);
    }
    
    return data;
  };

  useEffect(() => {
    // Trong thực tế sẽ tích hợp TradingView widget hoặc chart library
    if (chartRef.current) {
      // Clear previous content
      chartRef.current.innerHTML = `
        <div class="h-full flex items-center justify-center bg-gray-50 rounded-lg">
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900 mb-2">${symbol}</div>
            <div class="text-lg text-gray-600 mb-4">Biểu đồ ${symbol}</div>
            <div class="text-sm text-gray-500">Tích hợp TradingView hoặc Chart.js</div>
          </div>
        </div>
      `;
    }
  }, [symbol, currentPrice]);

  return (
    <div className="h-full p-4">
      <div ref={chartRef} className="h-full w-full bg-white rounded-lg border border-gray-200" />
    </div>
  );
};