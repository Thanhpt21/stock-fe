// components/trading/TradingAccountCard.tsx
import { TradingAccount } from '@/types/trading-account'
import { DollarSign, TrendingUp, CreditCard } from 'lucide-react'
import { useState } from 'react'
import { CreateOrderModal } from './CreateOrderModal'

interface TradingAccountCardProps {
  account: TradingAccount
  onOrderCreated?: () => void
}

export const TradingAccountCard = ({ account, onOrderCreated }: TradingAccountCardProps) => {
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [selectedSymbol, setSelectedSymbol] = useState('')

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('vi-VN').format(num)
  }

  const handleCreateOrder = (symbol: string) => {
    setSelectedSymbol(symbol)
    setShowOrderModal(true)
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{account.accountName}</h3>
              <p className="text-sm text-gray-600">{account.accountNumber}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            account.status === 'ACTIVE' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {account.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm khóa'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">Tổng số dư</span>
            </div>
            <div className="text-xl font-bold text-gray-900">
              {formatNumber(account.balance)} ₫
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">Khả dụng</span>
            </div>
            <div className="text-xl font-bold text-green-600">
              {formatNumber(account.availableCash)} ₫
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button 
            onClick={() => handleCreateOrder('VIC')}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Mua VIC
          </button>
          <button 
            onClick={() => handleCreateOrder('VCB')}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Mua VCB
          </button>
          <button 
            onClick={() => handleCreateOrder('FPT')}
            className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Mua FPT
          </button>
        </div>
      </div>

      {showOrderModal && (
        <CreateOrderModal
          account={account}
          symbol={selectedSymbol}
          onClose={() => setShowOrderModal(false)}
          onSuccess={() => {
            setShowOrderModal(false)
            onOrderCreated?.()
          }}
        />
      )}
    </>
  )
}