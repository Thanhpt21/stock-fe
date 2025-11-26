// components/trading/AccountSelector.tsx - UPDATED
'use client';

import { useState, useMemo } from 'react';
import { DownOutlined, PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import { useAuth } from '@/context/AuthContext';
import { useTradingAccounts } from '@/hooks/trading-account/useTradingAccounts';
import { useCreateTradingAccount } from '@/hooks/trading-account/useCreateTradingAccount';
import { useGetAllPositions } from '@/hooks/position/useGetAllPositions';

interface TradingAccount {
  id: number;
  accountNumber: string;
  accountName: string;
  brokerName: string;
  balance: number;
  availableCash: number;
  status: string;
}

interface AccountSelectorProps {
  onAccountSelect: (accountId: number) => void;
}

export const AccountSelector = ({ onAccountSelect }: AccountSelectorProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<TradingAccount | null>(null);
  const { currentUser } = useAuth();
  
  const { data: accounts, isLoading, refetch } = useTradingAccounts(currentUser?.id || 0);
  const createTradingAccount = useCreateTradingAccount();

  // Lấy accountIds để query positions
  const accountIds = useMemo(() => 
    accounts?.map(account => account.id) || [], 
    [accounts]
  );

  // Lấy positions cho tất cả tài khoản
  const { data: allPositions } = useGetAllPositions(accountIds);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Tính tổng số cổ phiếu cho mỗi tài khoản
  const getTotalStocks = (accountId: number): number => {
    const positions = allPositions?.[accountId] || [];
    return positions.reduce((total, position) => total + position.quantity, 0);
  };

  // Tính tổng giá trị cổ phiếu cho mỗi tài khoản
  const getStocksValue = (accountId: number): number => {
    const positions = allPositions?.[accountId] || [];
    return positions.reduce((total, position) => {
      const currentPrice = position.currentPrice || position.averagePrice;
      return total + (position.quantity * currentPrice);
    }, 0);
  };

  const handleCreateDemoAccount = async () => {
    // ... giữ nguyên phần này
  };

  const handleAccountSelect = (account: TradingAccount) => {
    setSelectedAccount(account);
    setShowDropdown(false);
    onAccountSelect(account.id);
  };

  // Auto-select first account
  if (accounts && accounts.length > 0 && !selectedAccount) {
    setSelectedAccount(accounts[0]);
    onAccountSelect(accounts[0].id);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center justify-between w-80 p-3 bg-white border border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
      >
        <div className="text-left">
          <div className="font-semibold text-gray-900">
            {selectedAccount?.accountName || 'Chọn tài khoản'}
          </div>
          <div className="text-sm text-gray-500">
            {selectedAccount ? (
              <>
                <div>{selectedAccount.accountNumber}</div>
                <div className="flex gap-4 mt-1">
                  <span>💰 {formatMoney(selectedAccount.availableCash)}</span>
                  {allPositions && (
                    <span>📈 {getTotalStocks(selectedAccount.id)} cổ phiếu</span>
                  )}
                </div>
              </>
            ) : (
              'Chưa chọn tài khoản'
            )}
          </div>
        </div>
        <DownOutlined className="text-gray-400" />
      </button>

      {showDropdown && (
        <div className="absolute top-full right-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-2">
            {/* Debug Info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-500 p-2 bg-yellow-50 rounded mb-2">
                Debug: {accounts?.length || 0} tài khoản, {Object.keys(allPositions || {}).length} positions
              </div>
            )}

            <button 
              onClick={handleCreateDemoAccount}
              disabled={createTradingAccount.isPending || !currentUser}
              className="flex items-center justify-center w-full p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createTradingAccount.isPending ? (
                <>
                  <LoadingOutlined className="mr-2 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <PlusOutlined className="mr-2" />
                  Tạo tài khoản DEMO
                </>
              )}
            </button>

            <div className="max-h-60 overflow-y-auto mt-2">
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <LoadingOutlined className="animate-spin text-blue-500" />
                </div>
              ) : accounts && accounts.length > 0 ? (
                accounts.map((account) => {
                  const totalStocks = getTotalStocks(account.id);
                  const stocksValue = getStocksValue(account.id);
                  
                  return (
                    <button
                      key={account.id}
                      onClick={() => handleAccountSelect(account)}
                      className={`flex items-center justify-between w-full p-2 rounded-md transition-colors ${
                        selectedAccount?.id === account.id 
                          ? 'bg-blue-50 border border-blue-200' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-left flex-1">
                        <div className="font-medium text-gray-900">
                          {account.accountName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {account.accountNumber} • {account.brokerName}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          <div>💵 {formatMoney(account.availableCash)}</div>
                          {totalStocks > 0 && (
                            <div>📊 {totalStocks} cổ phiếu</div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs font-medium ${
                          account.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {account.status === 'ACTIVE' ? '● Hoạt động' : '● Khóa'}
                        </div>
                       
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  {currentUser ? 'Chưa có tài khoản nào' : 'Vui lòng đăng nhập'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};