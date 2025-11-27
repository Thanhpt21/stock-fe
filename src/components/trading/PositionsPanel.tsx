// components/trading/PositionsPanel.tsx - FIXED
'use client';

import { useGetPositions } from '@/hooks/position/useGetPositions';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';

export const PositionsPanel = ({ accountId }: { accountId: number }) => {
  const { data: positions, isLoading, error } = useGetPositions(accountId);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Vị thế hiện tại</h3>
        <div className="animate-pulse space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Vị thế hiện tại</h3>
        <div className="text-center py-8 text-red-500 bg-red-50 rounded-lg">
          ❌ Lỗi tải dữ liệu vị thế
          <div className="text-sm mt-2 opacity-75">
            {error instanceof Error ? error.message : 'Unknown error'}
          </div>
        </div>
      </div>
    );
  }

  if (!accountId) {
    return (
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Vị thế hiện tại</h3>
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
          👆 Vui lòng chọn tài khoản
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="font-semibold text-gray-900 mb-4">Vị thế hiện tại</h3>
      
      {!positions || positions.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
          📭 Chưa có vị thế nào
          <div className="text-xs mt-2 opacity-75">
            Thực hiện giao dịch đầu tiên của bạn
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {positions.map((position) => {
            // Tính giá hiện tại và P&L (trong thực tế sẽ lấy từ API giá)
            const currentPrice = position.averagePrice; // Tạm thời dùng averagePrice
            const unrealizedPL = (currentPrice - position.averagePrice) * position.quantity;
            const plPercentage = ((currentPrice - position.averagePrice) / position.averagePrice) * 100;

            return (
              <div
                key={position.id}
                className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {position.symbol}
                    </div>
                    <div className="text-sm text-gray-500">
                      {position.quantity} cổ phiếu
                    </div>
                  </div>
                  <div className={`flex items-center ${
                    unrealizedPL >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {unrealizedPL >= 0 ? 
                      <ArrowUpIcon className="w-4 h-4 mr-1" /> : 
                      <ArrowDownIcon className="w-4 h-4 mr-1" />
                    }
                    <span className="font-semibold">
                      {formatMoney(unrealizedPL)}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                  <div>
                    <div>Giá TB:</div>
                    <div className="font-medium">{formatMoney(position.averagePrice)} VND</div>
                  </div>
                  <div>
                    <div>Giá hiện tại:</div>
                    <div className="font-medium">{formatMoney(currentPrice)} VND</div>
                  </div>
                </div>

                {/* P&L Percentage */}
                <div className={`text-xs font-medium ${
                  plPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {plPercentage >= 0 ? '+' : ''}{plPercentage.toFixed(2)}%
                </div>

                {/* Total Value */}
                <div className="mt-2 pt-2 border-t border-gray-100 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng giá trị:</span>
                    <span className="font-medium text-gray-900">
                      {formatMoney(position.quantity * currentPrice)} VND
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};