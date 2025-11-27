// components/trading/TradingChart.tsx - SIMPLE CHART VERSION
'use client';

import { useEffect, useRef, useState } from 'react';
import { useStockPrice } from '@/hooks/stock/useStockPrice';
import { ArrowUp, ArrowDown, TrendingUp, Activity } from 'lucide-react';

interface TradingChartProps {
  symbol: string;
  currentPrice: number;
}

interface ChartData {
  time: string;
  price: number;
  volume: number;
}

export const TradingChart = ({ symbol, currentPrice }: TradingChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sử dụng useStockPrice
  const { data: stockData, isLoading: priceLoading } = useStockPrice({
    symbol: symbol,
    enabled: true,
    refetchInterval: 3000,
  });

  // Tạo dữ liệu chart mẫu
  const generateChartData = (basePrice: number, volatility: number): ChartData[] => {
    const data: ChartData[] = [];
    let currentPrice = basePrice;
    
    // Tạo 20 điểm dữ liệu cho cả ngày
    for (let i = 0; i < 20; i++) {
      const change = (Math.random() - 0.5) * volatility;
      currentPrice = Math.max(currentPrice + change, basePrice * 0.9); // Đảm bảo không giảm quá 10%
      
      // Format time (9:00 đến 15:00)
      const hour = 9 + Math.floor(i / 2);
      const minute = i % 2 === 0 ? '00' : '30';
      
      data.push({
        time: `${hour}:${minute}`,
        price: Math.round(currentPrice),
        volume: Math.round(Math.random() * 1000000)
      });
    }
    
    return data;
  };

  useEffect(() => {
    if (stockData?.price) {
      const newChartData = generateChartData(stockData.price, stockData.price * 0.02);
      setChartData(newChartData);
      setIsLoading(false);
    }
  }, [stockData]);

  // Vẽ chart
  useEffect(() => {
    if (!canvasRef.current || chartData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Chart dimensions
    const padding = { top: 20, right: 20, bottom: 30, left: 50 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;

    // Calculate min/max values
    const prices = chartData.map(d => d.price);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const priceRange = maxPrice - minPrice;

    // Draw grid and labels
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px system-ui';

    // Y-axis grid lines and labels
    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
      const y = padding.top + (chartHeight * (ySteps - i) / ySteps);
      const price = minPrice + (priceRange * i / ySteps);
      
      // Grid line
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(rect.width - padding.right, y);
      ctx.stroke();

      // Label
      ctx.fillText(price.toLocaleString('vi-VN'), 5, y + 4);
    }

    // X-axis labels (show every 4th point)
    chartData.forEach((point, index) => {
      if (index % 4 === 0) {
        const x = padding.left + (chartWidth * index / (chartData.length - 1));
        ctx.fillText(point.time, x - 10, rect.height - 10);
      }
    });

    // Draw price line
    ctx.beginPath();
    ctx.strokeStyle = stockData?.change >= 0 ? '#10b981' : '#ef4444';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';

    chartData.forEach((point, index) => {
      const x = padding.left + (chartWidth * index / (chartData.length - 1));
      const y = padding.top + chartHeight - ((point.price - minPrice) / priceRange) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw data points
    ctx.fillStyle = stockData?.change >= 0 ? '#10b981' : '#ef4444';
    chartData.forEach((point, index) => {
      if (index % 2 === 0) { // Show every other point to avoid clutter
        const x = padding.left + (chartWidth * index / (chartData.length - 1));
        const y = padding.top + chartHeight - ((point.price - minPrice) / priceRange) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    // Draw current price indicator
    if (chartData.length > 0) {
      const lastPoint = chartData[chartData.length - 1];
      const x = padding.left + chartWidth;
      const y = padding.top + chartHeight - ((lastPoint.price - minPrice) / priceRange) * chartHeight;
      
      ctx.fillStyle = stockData?.change >= 0 ? '#10b981' : '#ef4444';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
      
      // Current price label
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 12px system-ui';
      ctx.fillText(
        lastPoint.price.toLocaleString('vi-VN'), 
        x + 8, 
        y - 8
      );
    }

  }, [chartData, stockData]);

  // Hiển thị nội dung fallback
  const renderFallbackContent = () => (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50 rounded-lg p-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Activity className="w-8 h-8 text-blue-500" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">{symbol}</h3>
        
        {isLoading ? (
          <p className="text-blue-600 mb-4">Đang tải biểu đồ...</p>
        ) : (
          <p className="text-gray-600 mb-4">Biểu đồ giá theo thời gian thực</p>
        )}

        {/* Hiển thị thông tin giá real-time */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Giá hiện tại</div>
          <div className={`text-2xl font-bold ${
            stockData?.change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {currentPrice.toLocaleString('vi-VN')} VND
          </div>
          {stockData && (
            <div className={`text-sm flex items-center justify-center ${
              stockData.change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {stockData.change >= 0 ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
              {stockData.change >= 0 ? '+' : ''}{stockData.change} 
              ({stockData.changePercent >= 0 ? '+' : ''}{stockData.changePercent}%)
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Chart Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{symbol}</h3>
            <p className="text-sm text-gray-500">Biểu đồ giá thời gian thực</p>
          </div>
        </div>
        
        {stockData && (
          <div className="text-right">
            <div className={`text-lg font-bold ${
              stockData.change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {stockData.price.toLocaleString('vi-VN')} VND
            </div>
            <div className={`text-sm flex items-center justify-end ${
              stockData.change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {stockData.change >= 0 ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
              {stockData.change >= 0 ? '+' : ''}{stockData.change} 
              ({stockData.changePercent >= 0 ? '+' : ''}{stockData.changePercent}%)
            </div>
          </div>
        )}
        
        {priceLoading && !stockData && (
          <div className="text-right">
            <div className="animate-pulse bg-gray-200 h-6 w-20 rounded mb-1"></div>
            <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
          </div>
        )}
      </div>

      {/* Chart Container */}
      <div className="flex-1 p-4">
        <div className="h-full w-full bg-white rounded-lg border border-gray-200">
          {isLoading || !stockData ? (
            renderFallbackContent()
          ) : (
            <div className="h-full flex flex-col">
              {/* Chart Controls */}
              <div className="flex justify-between items-center p-4 border-b border-gray-100">
               
                <div className="text-xs text-gray-500">
                  Cập nhật: {new Date().toLocaleTimeString('vi-VN')}
                </div>
              </div>

              {/* Canvas Chart */}
              <div className="flex-1 p-4">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full"
                  style={{ 
                    background: 'linear-gradient(to bottom, #f8fafc, #f1f5f9)',
                    borderRadius: '8px'
                  }}
                />
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-4 gap-2 p-4 border-t border-gray-100 bg-gray-50">
                <div className="text-center">
                  <div className="text-xs text-gray-600">Mở cửa</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {stockData.open?.toLocaleString('vi-VN') || 'N/A'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600">Cao nhất</div>
                  <div className="text-sm font-semibold text-green-600">
                    {stockData.high?.toLocaleString('vi-VN') || 'N/A'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600">Thấp nhất</div>
                  <div className="text-sm font-semibold text-red-600">
                    {stockData.low?.toLocaleString('vi-VN') || 'N/A'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600">KLGD</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {stockData.volume?.toLocaleString('vi-VN') || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};