// // components/trading/CreateTradingAccountModal.tsx
// import { useState } from 'react'
// import { X } from 'lucide-react'
// import { useCreateTradingAccount } from '@/hooks/trading/useCreateTradingAccount'

// interface CreateTradingAccountModalProps {
//   onClose: () => void
//   onSuccess: () => void
// }

// export const CreateTradingAccountModal = ({ onClose, onSuccess }: CreateTradingAccountModalProps) => {
//   const [accountName, setAccountName] = useState('')
//   const [brokerName, setBrokerName] = useState('DEMO')
//   const [initialBalance, setInitialBalance] = useState('100000000')

//   const createAccountMutation = useCreateTradingAccount()

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
    
//     // Mock user ID - trong thực tế lấy từ auth context
//     const userId = 1
    
//     createAccountMutation.mutate({
//       userId,
//       data: {
//         accountName,
//         brokerName,
//         initialBalance: parseInt(initialBalance),
//       }
//     }, {
//       onSuccess: () => {
//         onSuccess()
//       }
//     })
//   }

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-2xl p-6 w-full max-w-md">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-xl font-bold text-gray-900">Tạo tài khoản giao dịch</h3>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
//             <X className="w-6 h-6" />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* Account Name */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Tên tài khoản
//             </label>
//             <input
//               type="text"
//               value={accountName}
//               onChange={(e) => setAccountName(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               placeholder="Nhập tên tài khoản"
//               required
//             />
//           </div>

//           {/* Broker */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Broker
//             </label>
//             <select
//               value={brokerName}
//               onChange={(e) => setBrokerName(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             >
//               <option value="DEMO">DEMO</option>
//               <option value="VCBS">VCBS</option>
//               <option value="SSI">SSI</option>
//               <option value="HSC">HSC</option>
//             </select>
//           </div>

//           {/* Initial Balance */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Số dư ban đầu
//             </label>
//             <input
//               type="number"
//               value={initialBalance}
//               onChange={(e) => setInitialBalance(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               placeholder="Nhập số dư ban đầu"
//               min="1000000"
//               required
//             />
//             <p className="text-sm text-gray-500 mt-1">
//               Số dư tối thiểu: 1,000,000 ₫
//             </p>
//           </div>

//           {/* Submit Button */}
//           <button
//             type="submit"
//             disabled={createAccountMutation.isPending}
//             className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {createAccountMutation.isPending ? 'Đang tạo...' : 'Tạo tài khoản'}
//           </button>
//         </form>
//       </div>
//     </div>
//   )
// }