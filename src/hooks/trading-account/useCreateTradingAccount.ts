// hooks/trading/useCreateTradingAccount.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface CreateTradingAccountData {
  accountName: string
  brokerName?: string
  initialBalance?: number
}

export const useCreateTradingAccount = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: number; data: CreateTradingAccountData }) => {
      const res = await api.post(`/trading-account`, { ...data, userId })
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trading-accounts'] })
    },
  })
}