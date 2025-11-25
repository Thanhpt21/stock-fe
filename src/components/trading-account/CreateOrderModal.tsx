// components/trading/CreateOrderModal.tsx
import { useState } from 'react'
import { X } from 'lucide-react'
import { useCreateOrder } from '@/hooks/order/useCreateOrder'
import { TradingAccount } from '@/types/trading-account'

interface CreateOrderModalProps {
  account: TradingAccount
  symbol: string
  onClose: () => void
  onSuccess: () => void
}

export const CreateOrderModal = ({ account, symbol, onClose, onSuccess }: CreateOrderModalProps) => {
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET')
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')

  const createOrderMutation = useCreateOrder()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    createOrderMutation.mutate({
      accountId: account.id,
      symbol,
      orderType,
      side,
      quantity: parseInt(quantity),
      price: orderType === 'LIMIT' ? parseFloat(price) : undefined,
    }, {
      onSuccess: () => {
        onSuccess()
      }
    })
  }

  const estimatedCost = orderType === 'MARKET' 
    ? (parseInt(quantity) || 0) * 50000 // Mock current price
    : (parseInt(quantity) || 0) * (parseFloat(price) || 0)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Đặt lệnh {symbol}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Order Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Loại lệnh</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOrderType('MARKET')}
                className={`py-2 px-4 rounded-lg font-semibold ${
                  orderType === 'MARKET' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Thị trường
              </button>
              <button
                type="button"
                onClick={() => setOrderType('LIMIT')}
                className={`py-2 px-4 rounded-lg font-semibold ${
                  orderType === 'LIMIT' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Giới hạn
              </button>
            </div>
          </div>

          {/* Side */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Loại giao dịch</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSide('BUY')}
                className={`py-2 px-4 rounded-lg font-semibold ${
                  side === 'BUY' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Mua
              </button>
              <button
                type="button"
                onClick={() => setSide('SELL')}
                className={`py-2 px-4 rounded-lg font-semibold ${
                  side === 'SELL' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Bán
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Số lượng</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập số lượng"
              min="1"
              required
            />
          </div>

          {/* Price (only for LIMIT orders) */}
          {orderType === 'LIMIT' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giá đặt</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập giá"
                min="1"
                required
              />
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Tài khoản:</span>
              <span className="font-semibold">{account.accountName}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Số dư khả dụng:</span>
              <span className="font-semibold">
                {new Intl.NumberFormat('vi-VN').format(account.availableCash)} ₫
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Ước tính chi phí:</span>
              <span className="font-semibold">
                {new Intl.NumberFormat('vi-VN').format(estimatedCost)} ₫
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={createOrderMutation.isPending}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createOrderMutation.isPending ? 'Đang xử lý...' : 'Đặt lệnh'}
          </button>
        </form>
      </div>
    </div>
  )
}