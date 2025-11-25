// // app/trading/page.tsx
// 'use client'

// import { useState } from 'react'
// import { TradingAccountCard } from '@/components/trading/TradingAccountCard'
// import { OrderList } from '@/components/trading/OrderList'
// import { PositionList } from '@/components/trading/PositionList'
// import { CreateTradingAccountModal } from '@/components/trading/CreateTradingAccountModal'
// import { useTradingAccounts } from '@/hooks/trading/useTradingAccounts'
// import { useGetOrders } from '@/hooks/order/useGetOrders'
// import { useGetPositions } from '@/hooks/trading/useGetPositions'

// export default function TradingPage() {
//   const [activeTab, setActiveTab] = useState<'accounts' | 'orders' | 'positions'>('accounts')
//   const [showCreateAccount, setShowCreateAccount] = useState(false)
  
//   // Mock user ID - trong thực tế lấy từ auth context
//   const userId = 1
  
//   // Fetch data
//   const { data: accounts = [], isLoading: accountsLoading } = useTradingAccounts(userId)
//   const { data: orders = [], isLoading: ordersLoading } = useGetOrders(accounts[0]?.id || 0)
//   const { data: positions = [], isLoading: positionsLoading } = useGetPositions(accounts[0]?.id || 0)

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900">Giao dịch</h1>
//           <p className="text-gray-600 mt-2">Quản lý tài khoản và đặt lệnh giao dịch</p>
//         </div>

//         {/* Tabs */}
//         <div className="mb-6">
//           <div className="border-b border-gray-200">
//             <nav className="-mb-px flex space-x-8">
//               {[
//                 { id: 'accounts', name: 'Tài khoản', count: accounts.length },
//                 { id: 'orders', name: 'Lệnh đặt', count: orders.length },
//                 { id: 'positions', name: 'Vị thế', count: positions.length },
//               ].map((tab) => (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id as any)}
//                   className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
//                     activeTab === tab.id
//                       ? 'border-blue-500 text-blue-600'
//                       : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                   }`}
//                 >
//                   {tab.name}
//                   {tab.count > 0 && (
//                     <span className="ml-2 py-0.5 px-2 text-xs bg-gray-200 rounded-full">
//                       {tab.count}
//                     </span>
//                   )}
//                 </button>
//               ))}
//             </nav>
//           </div>
//         </div>

//         {/* Content */}
//         <div className="space-y-6">
//           {/* Accounts Tab */}
//           {activeTab === 'accounts' && (
//             <div>
//               <div className="flex justify-between items-center mb-6">
//                 <h2 className="text-xl font-semibold text-gray-900">Tài khoản giao dịch</h2>
//                 <button
//                   onClick={() => setShowCreateAccount(true)}
//                   className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
//                 >
//                   + Tạo tài khoản mới
//                 </button>
//               </div>

//               {accountsLoading ? (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   {[1, 2].map((i) => (
//                     <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 animate-pulse">
//                       <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
//                       <div className="h-3 bg-gray-200 rounded w-1/3 mb-6"></div>
//                       <div className="grid grid-cols-2 gap-4">
//                         <div className="h-16 bg-gray-200 rounded"></div>
//                         <div className="h-16 bg-gray-200 rounded"></div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : accounts.length > 0 ? (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   {accounts.map((account) => (
//                     <TradingAccountCard
//                       key={account.id}
//                       account={account}
//                       onOrderCreated={() => {
//                         // Có thể thêm refresh logic ở đây
//                       }}
//                     />
//                   ))}
//                 </div>
//               ) : (
//                 <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-gray-200">
//                   <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                     <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//                     </svg>
//                   </div>
//                   <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có tài khoản nào</h3>
//                   <p className="text-gray-500 mb-4">Tạo tài khoản giao dịch đầu tiên để bắt đầu đầu tư</p>
//                   <button
//                     onClick={() => setShowCreateAccount(true)}
//                     className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
//                   >
//                     Tạo tài khoản mới
//                   </button>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Orders Tab */}
//           {activeTab === 'orders' && (
//             <div>
//               <h2 className="text-xl font-semibold text-gray-900 mb-6">Lịch sử lệnh</h2>
//               <OrderList 
//                 orders={orders} 
//                 isLoading={ordersLoading}
//                 onRefresh={() => {
//                   // Refresh logic
//                 }}
//               />
//             </div>
//           )}

//           {/* Positions Tab */}
//           {activeTab === 'positions' && (
//             <div>
//               <h2 className="text-xl font-semibold text-gray-900 mb-6">Vị thế hiện tại</h2>
//               <PositionList 
//                 positions={positions} 
//                 isLoading={positionsLoading}
//               />
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Create Account Modal */}
//       {showCreateAccount && (
//         <CreateTradingAccountModal
//           onClose={() => setShowCreateAccount(false)}
//           onSuccess={() => {
//             setShowCreateAccount(false)
//             // Refresh accounts list
//           }}
//         />
//       )}
//     </div>
//   )
// }