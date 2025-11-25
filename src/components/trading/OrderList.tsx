// // components/trading/OrderList.tsx
// import { Order } from '@/types/trading'
// import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

// interface OrderListProps {
//   orders: Order[]
//   isLoading?: boolean
//   onRefresh?: () => void
// }

// export const OrderList = ({ orders, isLoading, onRefresh }: OrderListProps) => {
//   const formatNumber = (num: number): string => {
//     return new Intl.NumberFormat('vi-VN').format(num)
//   }

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'FILLED':
//         return <CheckCircle className="w-4 h-4 text-green-500" />
//       case 'CANCELLED':
//         return <XCircle className="w-4 h-4 text-red-500" />
//       case 'PENDING':
//         return <Clock className="w-4 h-4 text-yellow-500" />
//       default:
//         return <AlertCircle className="w-4 h-4 text-gray-500" />
//     }
//   }

//   const getStatusText = (status: string) => {
//     switch (status) {
//       case 'FILLED': return 'Đã khớp'
//       case 'CANCELLED': return 'Đã hủy'
//       case 'PENDING': return 'Đang chờ'
//       case 'PARTIALLY_FILLED': return 'Khớp một phần'
//       default: return status
//     }
//   }

//   if (isLoading) {
//     return (
//       <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
//         <div className="animate-pulse space-y-4">
//           {[1, 2, 3].map((i) => (
//             <div key={i} className="flex items-center justify-between py-4 border-b border-gray-200">
//               <div className="flex items-center space-x-4">
//                 <div className="w-10 h-10 bg-gray-200 rounded"></div>
//                 <div>
//                   <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
//                   <div className="h-3 bg-gray-200 rounded w-32"></div>
//                 </div>
//               </div>
//               <div className="text-right">
//                 <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
//                 <div className="h-3 bg-gray-200 rounded w-12"></div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     )
//   }

//   if (orders.length === 0) {
//     return (
//       <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
//         <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//           <Clock className="w-8 h-8 text-gray-400" />
//         </div>
//         <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có lệnh nào</h3>
//         <p className="text-gray-500">Các lệnh giao dịch của bạn sẽ xuất hiện ở đây</p>
//       </div>
//     )
//   }

//   return (
//     <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
//       <div className="overflow-x-auto">
//         <table className="w-full">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Mã CK
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Loại lệnh
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Số lượng
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Giá
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Trạng thái
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Thời gian
//               </th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-200">
//             {orders.map((order) => (
//               <tr key={order.id} className="hover:bg-gray-50">
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className="flex items-center">
//                     <span className="font-bold text-gray-900">{order.symbol}</span>
//                   </div>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className="flex items-center space-x-2">
//                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                       order.side === 'BUY' 
//                         ? 'bg-green-100 text-green-800' 
//                         : 'bg-red-100 text-red-800'
//                     }`}>
//                       {order.side === 'BUY' ? 'MUA' : 'BÁN'}
//                     </span>
//                     <span className="text-sm text-gray-600">{order.orderType}</span>
//                   </div>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                   {formatNumber(order.quantity)}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                   {order.price ? formatNumber(order.price) : 'Market'}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className="flex items-center space-x-2">
//                     {getStatusIcon(order.status)}
//                     <span className="text-sm text-gray-900">{getStatusText(order.status)}</span>
//                   </div>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                   {new Date(order.orderDate).toLocaleString('vi-VN')}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   )
// }