// components/trading/OrderPanel.tsx
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
  const safeCurrentPrice = currentPrice || 45000; // Fallback giá mặc định

  // Reset prices when currentPrice changes
  useEffect(() => {
    setPrice(safeCurrentPrice);
  }, [safeCurrentPrice]);

  useEffect(() => {
    if (orderType === OrderType.STOP || orderType === OrderType.STOP_LIMIT) {
      setStopPrice(side === OrderSide.BUY ? safeCurrentPrice * 1.02 : safeCurrentPrice * 0.98);
    }
  }, [orderType, safeCurrentPrice, side]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Quantity validation
    if (quantity < 100) {
      newErrors.quantity = 'Số lượng tối thiểu là 100 cổ phiếu';
    } else if (quantity % 100 !== 0) {
      newErrors.quantity = 'Số lượng phải là bội số của 100';
    }

    // Price validation based on order type
    if (orderType === OrderType.LIMIT && (!price || price <= 0)) {
      newErrors.price = 'Vui lòng nhập giá hợp lệ';
    }

    if (orderType === OrderType.STOP) {
      if (!stopPrice || stopPrice <= 0) {
        newErrors.stopPrice = 'Vui lòng nhập giá kích hoạt hợp lệ';
      } else {
        const isValidStop = side === OrderSide.BUY 
          ? stopPrice > safeCurrentPrice
          : stopPrice < safeCurrentPrice;
        
        if (!isValidStop) {
          newErrors.stopPrice = side === OrderSide.BUY 
            ? 'Giá kích hoạt phải cao hơn giá hiện tại'
            : 'Giá kích hoạt phải thấp hơn giá hiện tại';
        }
      }
    }

    if (orderType === OrderType.STOP_LIMIT) {
      if (!stopPrice || stopPrice <= 0) {
        newErrors.stopPrice = 'Vui lòng nhập giá kích hoạt hợp lệ';
      }
      if (!price || price <= 0) {
        newErrors.price = 'Vui lòng nhập giá giới hạn hợp lệ';
      }
      if (stopPrice && price) {
        if (side === OrderSide.BUY && price <= stopPrice) {
          newErrors.price = 'Giá giới hạn phải cao hơn giá kích hoạt';
        }
        if (side === OrderSide.SELL && price >= stopPrice) {
          newErrors.price = 'Giá giới hạn phải thấp hơn giá kích hoạt';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const orderData: CreateOrderRequest = {
      accountId,
      symbol,
      orderType,
      side,
      quantity,
      currentPrice: safeCurrentPrice,
      ...(orderType === OrderType.LIMIT && { price }),
      ...((orderType === OrderType.STOP || orderType === OrderType.STOP_LIMIT) && { stopPrice }),
      ...(orderType === OrderType.STOP_LIMIT && { price }),
      notes: `Đặt lệnh ${orderType} ${side} ${quantity} ${symbol}`,
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

  // Calculate costs - FIXED: Đảm bảo không bị undefined
  const getOrderPrice = (): number => {
    const safePrice = price || safeCurrentPrice;
    
    switch (orderType) {
      case OrderType.MARKET: 
        return safeCurrentPrice;
      // case OrderType.LIMIT: 
      //   return safePrice;
      // case OrderType.STOP: 
      //   return safeCurrentPrice; // Market price when triggered
      // case OrderType.STOP_LIMIT: 
      //   return safePrice;
      default: 
        return safeCurrentPrice;
    }
  };

  const orderPrice = getOrderPrice();
  const totalAmount = quantity * orderPrice;
  const estimatedFee = Math.round(totalAmount * 0.0015); // 0.15% trading fee
  const tax = Math.round(totalAmount * 0.001); // 0.1% tax
  const totalCost = totalAmount + estimatedFee + tax;

  const formatMoney = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN').format(Math.round(amount));
  };

  // Order type configuration
  const orderTypeConfig = {
    [OrderType.MARKET]: { label: 'Thị trường', description: 'Khớp lệnh ngay ở giá tốt nhất' },
    [OrderType.LIMIT]: { label: 'Giới hạn', description: 'Chỉ khớp ở mức giá chỉ định' },
    [OrderType.STOP]: { label: 'Dừng', description: 'Thành lệnh thị trường khi đạt giá kích hoạt' },
    [OrderType.STOP_LIMIT]: { label: 'Dừng giới hạn', description: 'Thành lệnh giới hạn khi đạt giá kích hoạt' }
  };

  // Order side configuration
  const orderSideConfig = {
    [OrderSide.BUY]: { label: 'MUA', color: 'green' },
    [OrderSide.SELL]: { label: 'BÁN', color: 'red' }
  };

  // Available order types for rendering
  const orderTypes = [OrderType.MARKET, OrderType.LIMIT, OrderType.STOP, OrderType.STOP_LIMIT];
  const orderSides = [OrderSide.BUY, OrderSide.SELL];

  console.log('🐛 DEBUG OrderPanel:', {
  currentPrice,
  safeCurrentPrice,
  price,
  orderType,
  quantity,
  orderPrice,
  totalAmount,
  calculated: {
    orderPrice: getOrderPrice(),
    total: quantity * getOrderPrice(),
    fee: quantity * getOrderPrice() * 0.0015,
    tax: quantity * getOrderPrice() * 0.001
  }
});


  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 mb-2">Đặt lệnh {symbol}</h3>
      <p className="text-sm text-gray-500 mb-4">Giá hiện tại: {formatMoney(safeCurrentPrice)}</p>
      
      {/* Order Type Tabs */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {orderTypes.map((type) => (
          <button
            key={type}
            onClick={() => setOrderType(type)}
            className={`p-2 text-xs font-medium rounded-lg border transition-colors ${
              orderType === type
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="font-semibold">{orderTypeConfig[type].label}</div>
            <div className="text-[10px] opacity-75 mt-1">{orderTypeConfig[type].description}</div>
          </button>
        ))}
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

      {/* Price Input for LIMIT and STOP_LIMIT */}
      {(orderType === OrderType.LIMIT || orderType === OrderType.STOP_LIMIT) && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {orderType === OrderType.LIMIT ? 'Giá đặt' : 'Giá giới hạn'}
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.price ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            min="0"
            step="100"
            placeholder="Nhập giá"
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price}</p>
          )}
        </div>
      )}

      {/* Stop Price Input for STOP and STOP_LIMIT */}
      {(orderType === OrderType.STOP || orderType === OrderType.STOP_LIMIT) && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Giá kích hoạt
          </label>
          <input
            type="number"
            value={stopPrice}
            onChange={(e) => setStopPrice(Number(e.target.value))}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.stopPrice ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            min="0"
            step="100"
            placeholder="Nhập giá kích hoạt"
          />
          {errors.stopPrice && (
            <p className="mt-1 text-sm text-red-600">{errors.stopPrice}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {side === OrderSide.BUY 
              ? 'Lệnh sẽ kích hoạt khi giá ≥ giá kích hoạt' 
              : 'Lệnh sẽ kích hoạt khi giá ≤ giá kích hoạt'
            }
          </p>
        </div>
      )}

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