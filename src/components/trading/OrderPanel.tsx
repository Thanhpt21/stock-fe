// components/trading/OrderPanel.tsx - CHỈ HIỂN THỊ MARKET
'use client';

import { useState, useEffect } from 'react';
import { useCreateOrder } from '@/hooks/order/useCreateOrder';
import { CreateOrderRequest } from '@/types/order';
import { OrderSide, OrderType } from '@/enums/order.enum';

interface OrderPanelProps {
  symbol: string;
  currentPrice: number;
  accountId: number;
}

export const OrderPanel = ({ symbol, currentPrice, accountId }: OrderPanelProps) => {
  const [orderType, setOrderType] = useState<OrderType>(OrderType.MARKET);
  const [side, setSide] = useState<OrderSide>(OrderSide.BUY);
  const [quantity, setQuantity] = useState<number>(100);
  const [price, setPrice] = useState<number>(currentPrice || 0);
  const [stopPrice, setStopPrice] = useState<number>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createOrderMutation = useCreateOrder();

  // Đảm bảo currentPrice luôn có giá trị hợp lệ
  const safeCurrentPrice = currentPrice;

  // Reset prices when currentPrice changes
  useEffect(() => {
    setPrice(safeCurrentPrice);
  }, [safeCurrentPrice]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Quantity validation
    if (quantity < 100) {
      newErrors.quantity = 'Số lượng tối thiểu là 100 cổ phiếu';
    } else if (quantity % 100 !== 0) {
      newErrors.quantity = 'Số lượng phải là bội số của 100';
    }

    // Với lệnh MARKET, không cần validate price
    // Các loại lệnh khác đã bị ẩn nên không cần validate

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const orderData: CreateOrderRequest = {
      accountId,
      symbol,
      orderType: OrderType.MARKET, // Luôn là MARKET
      side,
      quantity,
      currentPrice: safeCurrentPrice,
      notes: `Đặt lệnh ${OrderType.MARKET} ${side} ${quantity} ${symbol}`,
    };

    createOrderMutation.mutate(orderData, {
      onSuccess: () => {
        // Reset form after successful order
        setQuantity(100);
        setPrice(safeCurrentPrice);
        setStopPrice(0);
        setErrors({});
      },
      onError: (error: any) => {
        setErrors({ 
          submit: error.response?.data?.message || 'Có lỗi xảy ra khi đặt lệnh' 
        });
      }
    });
  };

  // Calculate costs - CHỈ DÙNG MARKET PRICE
  const orderPrice = safeCurrentPrice;
  const totalAmount = quantity * orderPrice;
  const estimatedFee = Math.round(totalAmount * 0.0015); // 0.15% trading fee
  const tax = Math.round(totalAmount * 0.001); // 0.1% tax
  const totalCost = totalAmount + estimatedFee + tax;

  const formatMoney = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN').format(Math.round(amount));
  };

  // Order type configuration - CHỈ MARKET
  const orderTypeConfig = {
    [OrderType.MARKET]: { label: 'Thị trường', description: 'Khớp lệnh ngay ở giá tốt nhất' },
  };

  // Order side configuration
  const orderSideConfig = {
    [OrderSide.BUY]: { label: 'MUA', color: 'green' },
    [OrderSide.SELL]: { label: 'BÁN', color: 'red' }
  };

  // Available order types for rendering - CHỈ MARKET
  const orderTypes = [OrderType.MARKET];
  const orderSides = [OrderSide.BUY, OrderSide.SELL];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 mb-2">Đặt lệnh {symbol}</h3>
      <p className="text-sm text-gray-500 mb-4">Giá hiện tại: {formatMoney(safeCurrentPrice)}</p>
      
      {/* Order Type Tabs - CHỈ HIỂN THỊ MARKET */}
      <div className="mb-4">
        <div className="p-3 bg-blue-50 border border-blue-500 text-blue-700 rounded-lg text-center">
          <div className="font-semibold">{orderTypeConfig[OrderType.MARKET].label}</div>
          <div className="text-xs opacity-75 mt-1">{orderTypeConfig[OrderType.MARKET].description}</div>
        </div>
      </div>

      {/* Buy/Sell Toggle */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {orderSides.map((orderSide) => (
          <button
            key={orderSide}
            onClick={() => setSide(orderSide)}
            className={`py-3 rounded-lg font-semibold transition-all ${
              side === orderSide
                ? orderSide === OrderSide.BUY
                  ? 'bg-green-500 text-white shadow-md ring-2 ring-green-200'
                  : 'bg-red-500 text-white shadow-md ring-2 ring-red-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {orderSideConfig[orderSide].label}
          </button>
        ))}
      </div>

      {/* Quantity Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Số lượng (cổ phiếu)
        </label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            errors.quantity ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          min="100"
          step="100"
          placeholder="Nhập số lượng"
        />
        {errors.quantity && (
          <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
        )}
        <div className="flex gap-1 mt-2">
          {[100, 500, 1000, 5000].map((qty) => (
            <button
              key={qty}
              onClick={() => setQuantity(qty)}
              className={`flex-1 py-1 text-xs rounded transition-colors ${
                quantity === qty
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {qty.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Thành tiền:</span>
          <span className="font-semibold">{formatMoney(totalAmount)} VND</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Phí giao dịch (0.15%):</span>
          <span className="text-gray-600">~{formatMoney(estimatedFee)} VND</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Thuế (0.1%):</span>
          <span className="text-gray-600">~{formatMoney(tax)} VND</span>
        </div>
        <div className="flex justify-between text-sm font-semibold border-t border-gray-200 pt-2">
          <span className="text-gray-700">Tổng cộng:</span>
          <span className="text-blue-600">~{formatMoney(totalCost)} VND</span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={createOrderMutation.isPending}
        className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
          side === OrderSide.BUY
            ? 'bg-green-500 hover:bg-green-600 disabled:bg-green-400'
            : 'bg-red-500 hover:bg-red-600 disabled:bg-red-400'
        } disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg`}
      >
        {createOrderMutation.isPending ? (
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            ĐANG XỬ LÝ...
          </div>
        ) : (
          `ĐẶT LỆNH ${orderSideConfig[side].label} ${symbol}`
        )}
      </button>

      {/* Error Message */}
      {errors.submit && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 text-center">{errors.submit}</p>
        </div>
      )}

      {/* Success Message */}
      {createOrderMutation.isSuccess && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600 text-center">
            ✅ Đặt lệnh thành công! Lệnh đang được xử lý.
          </p>
        </div>
      )}
    </div>
  );
};