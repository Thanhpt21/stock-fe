// components/stocks/StockCard.tsx
'use client';

import { StockData } from "@/types/stock";



interface StockCardProps {
  stock: StockData;
  onSelect: (stock: StockData) => void;
  isSelected?: boolean;
}

export const StockCard = ({ stock, onSelect, isSelected }: StockCardProps) => {
  const isPositive = stock.change >= 0;

  return (
    <div 
      className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all border-2 ${
        isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent hover:shadow-md'
      }`}
      onClick={() => onSelect(stock)}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg text-gray-900">{stock.symbol}</h3>
          <p className="text-sm text-gray-500">{stock.market}</p>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-semibold ${
          isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isPositive ? 'TĂNG' : 'GIẢM'}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Giá hiện tại:</span>
          <span className="font-bold text-lg">
            {stock.price.toLocaleString()}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Thay đổi:</span>
          <span className={`font-semibold ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? '+' : ''}{stock.change}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">% Thay đổi:</span>
          <span className={`font-semibold ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? '+' : ''}{stock.changePercent}%
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">KL giao dịch:</span>
          <span className="text-sm text-gray-700">
            {(stock.volume / 1000).toFixed(0)}K
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          Cập nhật: {new Date(stock.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};