// src/hooks/chat/useSaveBotMessage.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export type SaveBotMessageParams = {
  conversationId?: number | null
  sessionId?: string | null
  message: string
  metadata?: any
  userId?: number
}

export const useSaveBotMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: SaveBotMessageParams) => {
      const { conversationId, sessionId, message, metadata, userId } = params

      if (!message?.trim()) {
        throw new Error('Message cannot be empty')
      }

      // ✅ Phương án 1: Gửi qua WebSocket nếu chỉ có sessionId
      if (sessionId && !conversationId) {
        // Gửi qua WebSocket event 'bot:message'
        // Bạn cần implement WebSocket emit ở đây
        throw new Error('WebSocket bot message not implemented yet')
      }

      // ✅ Phương án 2: Gửi qua HTTP API nếu có conversationId
      const payload: any = {
        conversationId,
        message: message.trim(),
        userId,
        metadata: { 
          ai: true, 
          domain: 'stock-market',
          ...metadata 
        }
      }

      if (!conversationId) {
        throw new Error('Either conversationId is required for HTTP API')
      }

      const response = await api.post('/chat/bot-message', payload)
      return response.data
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] })
      queryClient.invalidateQueries({ queryKey: ['conversation'] })
    },

    onError: (error: any) => {
      console.error('❌ Lỗi lưu tin nhắn BOT:', error.response?.data || error.message)
    },
  })
}