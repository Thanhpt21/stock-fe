// // components/trading/PositionList.tsx
// import { Position } from '@/hooks/trading/useGetPositions'
// import { TrendingUp, TrendingDown } from 'lucide-react'

// interface PositionListProps {
//   positions: Position[]
//   isLoading?: boolean
// }

// export const PositionList = ({ positions, isLoading }: PositionListProps) => {
//   const formatNumber = (num: number): string => {
//     return new Intl.NumberFormat('vi-VN').format(num)
//   }

//   const calculatePLPercent = (position: Position) => {
//     if (!position.currentPrice) return 0
//     return ((position.currentPrice - position.averagePrice) / position.averagePrice) * 100
//   }

//   if (isLoading) {
//     return (
//       <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
//         <div className="animate-pulse space-y-4">
//           {[1, 2].map((i) => (
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

//   if (positions.length === 0) {
//     return (
//       <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
//         <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//           <TrendingUp className="w-8 h-8 text-gray-400" />
//         </div>
//         <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có vị thế nào</h3>
//         <p className="text-gray-500">Các vị thế của bạn sẽ xuất hiện ở đây sau khi lệnh được khớp</p>
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
//                 Số lượng
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Giá trung bình
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Giá hiện tại
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Lời/Lỗ
//               </th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-200">
//             {positions.map((position) => {
//               const plPercent = calculatePLPercent(position)
//               const isPositive = position.unrealizedPL >= 0

//               return (
//                 <tr key={position.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center">
//                       <span className="font-bold text-gray-900">{position.symbol}</span>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     {formatNumber(position.quantity)}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     {formatNumber(position.averagePrice)}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     {position.currentPrice ? formatNumber(position.currentPrice) : 'N/A'}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className={`flex items-center space-x-2 ${
//                       isPositive ? 'text-green-600' : 'text-red-600'
//                     }`}>
//                       {isPositive ? 
//                         <TrendingUp className="w-4 h-4" /> : 
//                         <TrendingDown className="w-4 h-4" />
//                       }
//                       <span className="font-semibold">
//                         {formatNumber(position.unrealizedPL)} ₫
//                       </span>
//                       <span className="text-sm">
//                         ({plPercent.toFixed(2)}%)
//                       </span>
//                     </div>
//                   </td>
//                 </tr>
//               )
//             })}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   )
// }