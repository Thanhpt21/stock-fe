import { useCallback, useState, useRef } from 'react';
import { ChatMessage } from '@/components/layout/Chatbox';

interface UseAiMessageProps {
  conversationId: number | null;
  sessionId: string | null;
  currentUser: any;
  addMessage: (message: ChatMessage) => void;
  saveBotMessage: any;
  isGuest: boolean;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useAiMessage = ({
  conversationId,
  sessionId,
  currentUser,
  addMessage,
  saveBotMessage,
  isGuest,
  setMessages,
  setIsTyping,
}: UseAiMessageProps) => {
  const AI_URL = process.env.NEXT_PUBLIC_AI_URL!;
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  
  // Ref để track AI processing state
  const isProcessingRef = useRef(false);
  const lastProcessedMessageRef = useRef<string>('');
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const checkMessageType = (msg: string) => {
    const lowerMsg = msg.toLowerCase().trim();
    const greetingKeywords = ['xin chào', 'hello', 'hi', 'chào', 'helo', 'hi there'];
    const thankYouKeywords = ['cảm ơn', 'thanks', 'thank you', 'cám ơn', 'thank'];
    const goodbyeKeywords = ['tạm biệt', 'goodbye', 'bye', 'see you', 'bai'];
    
    return {
      isGreeting: greetingKeywords.some(keyword => lowerMsg.includes(keyword)),
      isThankYou: thankYouKeywords.some(keyword => lowerMsg.includes(keyword)),
      isGoodbye: goodbyeKeywords.some(keyword => lowerMsg.includes(keyword)),
      isSimpleQuestion: lowerMsg.includes('?') && lowerMsg.length < 30,
      lowerMsg
    };
  };

  const handleGreeting = (currentConvId: number | null, isGuestMode: boolean) => {
    const greetings = isGuestMode 
      ? [
          "Xin chào! 👋 Tôi là AI trợ lý chứng khoán. Tôi có thể giúp gì cho bạn về thị trường chứng khoán?",
          "Chào bạn! 📈 Tôi ở đây để hỗ trợ bạn về đầu tư chứng khoán. Bạn có câu hỏi gì?",
          "Hello! 💹 Rất vui được tư vấn chứng khoán cho bạn. Bạn quan tâm đến mã nào?",
        ]
      : [
          `Xin chào ${currentUser?.name || 'bạn'}! 👋 Tôi là AI trợ lý chứng khoán. Tôi có thể giúp gì cho bạn?`,
          `Chào ${currentUser?.name || 'bạn'}! 📈 Rất vui được hỗ trợ bạn về đầu tư. Bạn quan tâm mã nào?`,
        ];
    
    return {
      finalAiText: greetings[Math.floor(Math.random() * greetings.length)],
      shouldSave: !isGuestMode && !!currentConvId
    };
  };

  const handleThankYou = (currentConvId: number | null, isGuestMode: boolean) => {
    const responses = [
      "Không có gì! 😊 Rất vui được hỗ trợ bạn về chứng khoán.",
      "Cảm ơn bạn! 💖 Chúc bạn đầu tư thành công!",
      "Rất hân hạnh! 📊 Nếu cần phân tích thêm, tôi luôn sẵn sàng.",
    ];
    
    return {
      finalAiText: responses[Math.floor(Math.random() * responses.length)],
      shouldSave: !isGuestMode && !!currentConvId
    };
  };

  const handleGoodbye = (currentConvId: number | null, isGuestMode: boolean) => {
    const responses = [
      "Tạm biệt bạn! 👋 Chúc bạn giao dịch thành công!",
      "Chúc bạn một ngày đầu tư hiệu quả! 📈",
      "Hẹn gặp lại ở phiên giao dịch sau!",
    ];
    
    return {
      finalAiText: responses[Math.floor(Math.random() * responses.length)],
      shouldSave: !isGuestMode && !!currentConvId
    };
  };

  const handleSimpleQuestion = (lowerMsg: string) => {
    const simpleQuestions: { [key: string]: string } = {
      'giờ giao dịch': 'Thị trường chứng khoán Việt Nam giao dịch:\n- Sáng: 9:00 - 11:30\n- Chiều: 13:00 - 15:00\nTừ thứ 2 đến thứ 6.',
      'hose': 'HOSE (Sở Giao dịch Chứng khoán TP.HCM) là sàn lớn nhất VN, niêm yết các cổ phiếu blue-chip.',
      'hnx': 'HNX (Sở Giao dịch Chứng khoán Hà Nội) niêm yết cổ phiếu vốn hóa vừa và nhỏ.',
      'biên độ': 'Biên độ dao động:\n- HOSE: ±7%\n- HNX: ±10%\n- UPCOM: ±15%',
    };

    const matched = Object.keys(simpleQuestions).find(q => lowerMsg.includes(q));
    return matched ? { finalAiText: simpleQuestions[matched], shouldSave: true } : null;
  };

  const callAiApi = async (msg: string) => {
    const token = process.env.NEXT_PUBLIC_AI_PUBLIC_TOKEN;
    
    if (!token) {
      return { 
        aiResponse: `Xin lỗi, hệ thống AI tạm thời không khả dụng. Vui lòng thử lại sau.` 
      };
    }

    const prompt = `Bạn là chuyên gia tư vấn chứng khoán Việt Nam. Trả lời ngắn gọn, chuyên nghiệp.

CÂU HỎI: "${msg}"

TRẢ LỜI:`;

    try {
      const res = await fetch(`${AI_URL}/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          prompt,
          metadata: {
            isGuest: !currentUser,
            domain: 'stock-market'
          } 
        }),
      });

      if (!res.ok) throw new Error(`AI API error: ${res.status}`);

      const data = await res.json();
      const aiResponse = data.response?.text || data.choices?.[0]?.message?.content || 
        'Xin lỗi, tôi không thể trả lời ngay lúc này.';

      return { aiResponse };
    } catch (error) {
      console.error('❌ AI API call failed:', error);
      return { 
        aiResponse: `Xin lỗi, có lỗi xảy ra khi xử lý câu hỏi của bạn. Vui lòng thử lại.` 
      };
    }
  };

const sendAiMessage = useCallback(async (msg: string, targetConversationId?: number | null) => {
  if (isProcessingRef.current) {
    console.log('🚫 AI already processing - skipping');
    return;
  }

  if (lastProcessedMessageRef.current === msg) {
    console.log('🚫 Duplicate AI request - skipping:', msg);
    return;
  }

  let currentConvId = targetConversationId !== undefined ? targetConversationId : conversationId;
  
  if (!currentConvId && !isGuest) {
    console.log('⏳ Waiting for conversationId...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    currentConvId = conversationId;
    
    if (!currentConvId) {
      console.log('❌ No conversationId for AI response');
      return;
    }
  }

  isProcessingRef.current = true;
  setIsAiProcessing(true);
  setIsTyping(true);
  lastProcessedMessageRef.current = msg;

  const messageId = isGuest 
    ? `ai-local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    : `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Thêm pending message
  const aiPendingMessage: ChatMessage = {
    id: messageId,
    senderType: 'BOT',
    message: '...',
    conversationId: isGuest ? null : currentConvId || undefined,
    sessionId,
    createdAt: new Date().toISOString(),
    status: isGuest ? 'local' : 'sending'
  };
  
  addMessage(aiPendingMessage);
  await new Promise(resolve => setTimeout(resolve, 800));

  try {
    // ... xử lý AI logic ...
    
    const { aiResponse } = await callAiApi(msg);

    // 🔥 UPDATE MESSAGE LOCAL TRƯỚC
    setMessages(prev => 
      prev.map(m => 
        m.id === messageId 
          ? { ...m, message: aiResponse, status: isGuest ? 'local' : 'sent' }
          : m
      )
    );

    // 🔥 SAU ĐÓ MỚI LƯU VÀO DATABASE
    if (!isGuest && currentConvId) {
      const savedBotMsg = await saveBotMessage.mutateAsync({ 
        conversationId: Number(currentConvId),
        message: aiResponse,
        userId: currentUser?.id,
        metadata: { ai: true, source: 'ai-api' }
      });
      
      console.log('✅ Bot message saved to DB:', savedBotMsg);
    }

  } catch (err: any) {
    console.error('❌ AI error:', err);
    // ... error handling ...
  } finally {
    isProcessingRef.current = false;
    setIsAiProcessing(false);
    setIsTyping(false);
    
    setTimeout(() => {
      lastProcessedMessageRef.current = '';
    }, 2000);
  }
}, [conversationId, sessionId, currentUser, addMessage, saveBotMessage, isGuest, setIsTyping, setMessages]);

  return {
    sendAiMessage,
    isAiProcessing 
  };
};