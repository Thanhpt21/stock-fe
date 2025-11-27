

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getSocket, type SocketType } from '@/lib/socket';
import { useQueryClient } from '@tanstack/react-query';
import { useUserConversationIds } from '@/hooks/chat/useUserConversationIds';
import { useSaveBotMessage } from '@/hooks/chat/useSaveBotMessage';
import { useCurrent } from '@/hooks/auth/useCurrent';

// ==================== TYPES ====================

export interface ChatMessage {
  id: string | number;
  conversationId?: number | null;
  sessionId?: string | null;
  senderId?: number | null;
  senderType: 'USER' | 'BOT';
  message: string;
  metadata?: any;
  createdAt: string;
  status?: 'sending' | 'sent' | 'failed' | 'local';
}

// ==================== CHATBOX COMPONENT ====================

export default function ChatBox() {
  const queryClient = useQueryClient();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [socket, setSocket] = useState<SocketType | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [input, setInput] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousLengthRef = useRef(0);
  const isUserAtBottom = useRef(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isLoadingMessagesRef = useRef(false);
  const [hasAttemptedInitialLoad, setHasAttemptedInitialLoad] = useState(false);

  // Ref để ngăn chặn gửi nhiều lần
  const isSendingRef = useRef(false);
  const lastSendTimeRef = useRef<number>(0);

  // Ref để quản lý typing timeout
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUserMessageRef = useRef<string | null>(null);

  const localUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const userIdNumber = localUserId ? Number(localUserId) : null;
  const { data: dbConversationIds = [] } = useUserConversationIds({
    userId: userIdNumber!,
    enabled: !!userIdNumber,
  });
  const latestConversationId = dbConversationIds[0] ?? null;
  const { data: currentUser } = useCurrent();
  const [isGuest, setIsGuest] = useState(false);
  const saveBotMessage = useSaveBotMessage();

  // Ref để lưu tin nhắn local khi chưa login
  const localMessagesRef = useRef<ChatMessage[]>([]);

  // ==================== HELPER FUNCTIONS ====================

  const renderMessageWithLinks = (message: string) => {
    if (!message) return message;

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = urlRegex.exec(message)) !== null) {
      if (match.index > lastIndex) {
        parts.push(message.slice(lastIndex, match.index));
      }

      parts.push(
        <a 
          key={match.index}
          href={match[0]}
          className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          {match[0]}
        </a>
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < message.length) {
      parts.push(message.slice(lastIndex));
    }

    return parts.length > 0 ? parts : message;
  };

  // ==================== TYPING EFFECT MANAGEMENT ====================

  // Bắt đầu hiệu ứng typing
  const startTypingEffect = useCallback(() => {
    console.log('🎬 Starting typing effect');
    setIsTyping(true);
    
    // Clear timeout cũ nếu có
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, []);

  // Dừng hiệu ứng typing
  const stopTypingEffect = useCallback(() => {
    console.log('🛑 Stopping typing effect');
    setIsTyping(false);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, []);

  // Tự động dừng typing sau thời gian timeout
  const autoStopTyping = useCallback(() => {
    // Auto stop sau 30 giây để tránh trường hợp bot không trả lời
    typingTimeoutRef.current = setTimeout(() => {
      console.log('⏰ Auto-stopping typing effect after timeout');
      stopTypingEffect();
    }, 30000);
  }, [stopTypingEffect]);

  // ==================== AUTH & SESSION MANAGEMENT ====================
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isUserAuthenticated = currentUser && currentUser.id;
      
      console.log('🔐 Auth check:', {
        isUserAuthenticated: !!isUserAuthenticated,
        currentUserId: currentUser?.id,
        currentIsGuest: isGuest
      });
      
      if (!isUserAuthenticated) {
        // Guest mode
        let guestSessionId = localStorage.getItem('guestSessionId');
        if (!guestSessionId) {
          guestSessionId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('guestSessionId', guestSessionId);
        }
        
        if (sessionId !== guestSessionId) {
          setSessionId(guestSessionId);
        }
        if (!isGuest) {
          setIsGuest(true);
        }
        
        // Load tin nhắn local
        const savedLocalMessages = localStorage.getItem('localChatMessages');
        if (savedLocalMessages) {
          try {
            const parsedMessages = JSON.parse(savedLocalMessages);
            localMessagesRef.current = parsedMessages;
            setMessages(parsedMessages);
          } catch (e) {
            console.error('Error loading local messages:', e);
            localMessagesRef.current = [];
          }
        }
        
        console.log('🔍 User is GUEST, sessionId:', guestSessionId);
      } else {
        // User authenticated
        console.log('🔍 User is AUTHENTICATED, userId:', currentUser.id);
        
        // QUAN TRỌNG: Reset guest state
        if (isGuest) {
          setIsGuest(false);
        }
        if (sessionId) {
          setSessionId(null);
        }
        
        // Cleanup guest data
        localStorage.removeItem('guestSessionId');
        localStorage.removeItem('guestConversationId');
        
        // Migrate messages sau khi đã chuyển trạng thái
        setTimeout(() => {
          if (localMessagesRef.current.length > 0) {
            migrateLocalMessagesToServer();
          }
        }, 1000);
      }
    }
  }, [currentUser?.id]);

  // ==================== MESSAGE MANAGEMENT ====================

  const addMessage = useCallback((newMessage: ChatMessage) => {
    setMessages(prev => {
      // Kiểm tra duplicate bằng id
      const exists = prev.some(msg => msg.id === newMessage.id);
      
      if (exists) {
        console.log('🚫 Duplicate message prevented in addMessage:', newMessage.id);
        return prev.map(msg => 
          msg.id === newMessage.id ? newMessage : msg
        );
      }
      
      const updated = [...prev, newMessage].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      
      console.log('✅ New message added:', newMessage.id);
      return updated;
    });
  }, []);

  // ==================== LOAD MESSAGES ====================

  const loadMessages = useCallback(async () => {
    // Nếu là guest, không load từ server
    if (isGuest) {
      console.log('🎭 Guest mode - using local messages');
      return;
    }
    
    // QUAN TRỌNG: Chỉ load messages nếu có conversationId
    const targetConversationId = conversationId || latestConversationId;
    if (!targetConversationId) {
      console.log('⏳ No conversationId available - skipping message load');
      setHasAttemptedInitialLoad(true);
      return;
    }
    
    if (isLoadingMessagesRef.current) {
      console.log('⏳ Already loading messages - skipping');
      return;
    }
    
    console.log('🔄 Loading messages for conversation:', targetConversationId);
    
    isLoadingMessagesRef.current = true;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/messages?conversationId=${targetConversationId}`,
        {
          cache: 'no-cache'
        }
      );
      
      if (!res.ok) throw new Error('Failed to load messages');
      const data = await res.json();
      
      const loadedMessages = Array.isArray(data.messages) ? data.messages : [];
      console.log('📥 Loaded messages from server:', loadedMessages.length);
      
      const sortedMessages = loadedMessages.sort((a: any, b: any) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      
      setMessages(sortedMessages);
      setHasAttemptedInitialLoad(true);
      
    } catch (err) {
      console.error('❌ Load messages failed:', err);
      setHasAttemptedInitialLoad(true);
    } finally {
      isLoadingMessagesRef.current = false;
    }
  }, [conversationId, latestConversationId, isGuest]);

  // ==================== AUTO LOAD MESSAGES WHEN CONVERSATION AVAILABLE ====================

  useEffect(() => {
    // Tự động load messages khi có conversationId và user đã login
    if (currentUser?.id && !isGuest && conversationId && !hasAttemptedInitialLoad) {
      console.log('🔄 Auto-loading messages for conversation:', conversationId);
      
      const timer = setTimeout(() => {
        loadMessages();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentUser?.id, isGuest, conversationId, loadMessages, hasAttemptedInitialLoad]);

  // Lưu tin nhắn local vào localStorage
  const saveLocalMessages = useCallback((messages: ChatMessage[]) => {
    if (typeof window === 'undefined') return;
    
    // Chỉ lưu tin nhắn có status 'local'
    const localMessages = messages.filter(msg => msg.status === 'local');
    localStorage.setItem('localChatMessages', JSON.stringify(localMessages));
    localMessagesRef.current = localMessages;
  }, []);

  // Chuyển đổi tin nhắn local thành tin nhắn thật khi login
  const migrateLocalMessagesToServer = useCallback(async () => {
    if (!currentUser?.id || !conversationId || localMessagesRef.current.length === 0) return;

    console.log('🔄 Migrating local messages to server:', localMessagesRef.current.length);

    const promises = localMessagesRef.current.map(async (localMsg) => {
      if (localMsg.senderType === 'USER') {
        // Gửi lại tin nhắn user qua socket
        if (socket?.connected) {
          return new Promise<void>((resolve) => {
            socket.emit('send:message', {
              message: localMsg.message,
              metadata: localMsg.metadata,
              conversationId,
              senderType: 'USER',
              senderId: currentUser.id,
              sessionId: null,
            });
            resolve();
          });
        }
      } else if (localMsg.senderType === 'BOT') {
        // Lưu tin nhắn bot vào database
        return saveBotMessage.mutateAsync({
          conversationId: Number(conversationId),
          message: localMsg.message,
          userId: currentUser.id,
          metadata: {
            ...localMsg.metadata,
            migrated: true,
            originalSessionId: localMsg.sessionId
          }
        });
      }
    });

    await Promise.all(promises);

    // Xóa tin nhắn local
    localStorage.removeItem('localChatMessages');
    localMessagesRef.current = [];

    // Reload messages từ server
    await loadMessages();
  }, [currentUser, conversationId, socket, saveBotMessage, loadMessages]);

  // ==================== CONVERSATION INITIALIZATION ====================

  useEffect(() => {
    console.log('🔄 Conversation init check:', {
      currentUser: currentUser?.id,
      isConnected,
      conversationId,
      dbConversationIds: dbConversationIds.length,
      hasAttemptedInitialLoad
    });

    // Chỉ xử lý khi user đã login và socket connected
    if (!currentUser?.id || !isConnected || conversationId) {
      return;
    }

    console.log('🚀 Initializing conversation...');

    // Ưu tiên dùng conversation từ database
    if (dbConversationIds.length > 0) {
      const existingConvId = dbConversationIds[0];
      console.log('👤 Using existing conversation:', existingConvId);
      setConversationId(existingConvId);
      
      // Join conversation và load messages
      if (socket?.connected) {
        socket.emit('join:conversation', existingConvId);
      }
      
      // Load messages sau khi set conversationId
      setTimeout(() => loadMessages(), 300);
    } else {
      console.log('📝 No existing conversation - will create on first message');
      setHasAttemptedInitialLoad(true);
    }
  }, [currentUser?.id, isConnected, conversationId, dbConversationIds, socket, loadMessages, hasAttemptedInitialLoad]);

  // ==================== SOCKET MANAGEMENT ====================

  useEffect(() => {
    console.log('🔌 Socket effect running:', {
      currentUser: currentUser?.id,
      isGuest,
      shouldConnect: currentUser?.id && !isGuest
    });

    // QUAN TRỌNG: Chỉ kết nối socket khi có user thật
    const shouldConnectSocket = currentUser?.id && !isGuest;
    
    if (!shouldConnectSocket) {
      console.log('🎭 Guest mode or no user - Socket disabled');
      setIsConnected(false);
      if (socket) {
        console.log('🔌 Disconnecting existing socket');
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    console.log('👤 User detected, creating socket...', currentUser.id);

    const socketInstance = getSocket({ 
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    if (!socketInstance) {
      console.log('❌ Cannot get socket instance');
      return;
    }
    
    setSocket(socketInstance);

    const onConnect = () => {
      setIsConnected(true);
      console.log('✅ Socket connected - User:', currentUser.id);
      
      // QUAN TRỌNG: Load messages ngay sau khi kết nối
      if (conversationId) {
        console.log('🔄 Loading messages for conversation:', conversationId);
        loadMessages();
      } else if (latestConversationId) {
        console.log('🔄 Loading messages for latest conversation:', latestConversationId);
        setConversationId(latestConversationId);
        setTimeout(() => loadMessages(), 300);
      } else {
        setHasAttemptedInitialLoad(true);
      }
    };

    const onDisconnect = (reason: string) => {
      setIsConnected(false);
      console.log('❌ Socket disconnected:', reason);
    };

    const onConnectError = (error: any) => {
      console.error('🔴 Socket connection error:', error);
      setIsConnected(false);
    };

    const onSession = (data: { sessionId: string }) => {
      setSessionId(data.sessionId);
      localStorage.setItem('sessionId', data.sessionId);
      console.log('🔑 Session initialized:', data.sessionId);
    };

    const onConvUpdate = (data: any) => {
      const id = data.conversationId || data.id;
      if (id && id !== conversationId) {
        console.log('🔄 Conversation updated:', id);
        setConversationId(id);
        localStorage.setItem('conversationId', id.toString());
        
        if (socketInstance.connected) {
          socketInstance.emit('join:conversation', id);
        }
      }
    };

    const onConversationCreated = (data: any) => {
      console.log('✅ Conversation created event:', data);
      const newConversationId = data.conversationId || data.id;
      if (newConversationId) {
        setConversationId(newConversationId);
        localStorage.setItem('conversationId', newConversationId.toString());
        
        if (socketInstance.connected) {
          socketInstance.emit('join:conversation', newConversationId);
        }
        
        setTimeout(() => loadMessages(), 300);
      }
    };

    const onMessage = (msg: ChatMessage) => {
      console.log('📨 onMessage received:', { 
        messageId: msg.id,
        senderType: msg.senderType, 
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        currentUserId: currentUser?.id
      });
      
      // Kiểm tra duplicate bằng id
      const isDuplicate = messages.some(m => m.id === msg.id);
      
      if (isDuplicate) {
        console.log('🚫 Duplicate message detected, skipping:', msg.id);
        return;
      }
      
      // Kiểm tra message từ chính mình
      if (msg.senderId === currentUser?.id && msg.senderType === 'USER') {
        console.log('👤 Own message from server - skipping');
        return;
      }

      // 🆕 XỬ LÝ TYPING EFFECT KHI NHẬN BOT MESSAGE
      if (msg.senderType === 'BOT') {
        console.log('🤖 Bot message received - stopping typing effect');
        stopTypingEffect();
      }
      
      console.log('💬 New message from backend');
      addMessage(msg);
    };

    // Register events
    socketInstance.on('connect', onConnect);
    socketInstance.on('disconnect', onDisconnect);
    socketInstance.on('connect_error', onConnectError);
    socketInstance.on('session-initialized', onSession);
    socketInstance.on('conversation-updated', onConvUpdate);
    socketInstance.on('conversation:created', onConversationCreated);
    socketInstance.on('message', onMessage);

    // Kết nối socket
    console.log('🔌 Connecting socket...');
    socketInstance.connect();

    return () => {
      console.log('🧹 Cleaning up socket events');
      socketInstance.off('connect', onConnect);
      socketInstance.off('disconnect', onDisconnect);
      socketInstance.off('connect_error', onConnectError);
      socketInstance.off('session-initialized', onSession);
      socketInstance.off('conversation-updated', onConvUpdate);
      socketInstance.off('conversation:created', onConversationCreated);
      socketInstance.off('message', onMessage);
      
      // Cleanup typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [currentUser?.id, isGuest, conversationId, latestConversationId, loadMessages, stopTypingEffect]);

  // ==================== SEND MESSAGE ====================

  const sendMessage = useCallback((message: string, metadata?: any) => {
    const now = Date.now();
    
    // Kiểm tra nghiêm ngặt hơn với debounce mạnh hơn
    if (isSendingRef.current) {
      console.log('🚫 Blocked: Already sending');
      return;
    }

    // Debounce 1.5 giây thay vì 1 giây
    if (now - lastSendTimeRef.current < 1500) {
      console.log('🚫 Blocked: Too fast, please wait');
      return;
    }

    if (!message.trim()) {
      console.log('❌ Cannot send message: empty message');
      return;
    }

    console.log('🔍 Sending message - isGuest:', isGuest, 'currentUser:', currentUser?.id);

    // Đánh dấu đang gửi
    isSendingRef.current = true;
    lastSendTimeRef.current = now;

    const senderId = currentUser?.id || null;

    // 🆕 BẮT ĐẦU TYPING EFFECT KHI GỬI MESSAGE
    if (!isGuest) {
      console.log('🎬 Starting typing effect for bot response');
      startTypingEffect();
      autoStopTyping(); // Tự động dừng sau timeout
      lastUserMessageRef.current = message;
    }

    // Nếu là GUEST
    if (isGuest) {
      console.log('🎭 Guest mode - saving message locally');
      
      const userMsg: ChatMessage = {
        id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        senderType: 'USER',
        senderId: null,
        message: message.trim(),
        conversationId: null,
        sessionId: sessionId,
        createdAt: new Date().toISOString(),
        status: 'local',
        metadata: {
          ...metadata,
          isGuest: true,
          guestSessionId: sessionId
        },
      };

      addMessage(userMsg);
      
      // Lưu vào localStorage
      const updatedMessages = [...messages, userMsg];
      saveLocalMessages(updatedMessages);
      
      // Clear input NGAY LẬP TỨC
      setInput('');
      
      // Reset sending state
      setTimeout(() => {
        isSendingRef.current = false;
      }, 500);
      
      return;
    }

    // Nếu là USER đã login
    if (!socket) {
      console.log('❌ Cannot send message: no socket');
      isSendingRef.current = false;
      stopTypingEffect(); // Dừng typing nếu có lỗi
      return;
    }

    const effectiveConversationId = conversationId || latestConversationId;
    
    console.log('📤 Preparing message with:', {
      hasConversationId: !!effectiveConversationId,
      conversationId: effectiveConversationId,
      socketConnected: socket.connected
    });

    // Tạo message tạm thời
    const tempMessageId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const userMsg: ChatMessage = {
      id: tempMessageId,
      senderType: 'USER',
      senderId: senderId,
      message: message.trim(),
      conversationId: effectiveConversationId || undefined,
      sessionId: null,
      createdAt: new Date().toISOString(),
      status: 'sending',
      metadata: {
        ...metadata,
        isGuest: false,
        userId: senderId,
      },
    };

    // Thêm message tạm thời
    addMessage(userMsg);

    const payload: any = {
      message: message.trim(), 
      metadata: userMsg.metadata,
    };

    if (effectiveConversationId) {
      payload.conversationId = effectiveConversationId;
    }

    console.log('📤 Emitting send:message:', payload);
    
    // Clear input NGAY LẬP TỨC
    setInput('');
    
    // Gửi message qua socket
    socket.emit('send:message', payload);
    
    // Đợi response từ server
    let receivedResponse = false;
    
    const messageHandler = (msg: ChatMessage) => {
      if (msg.id !== tempMessageId && msg.senderType === 'USER') {
        receivedResponse = true;
        
        // Update message status
        setMessages(prev => 
          prev.map(m => 
            m.id === tempMessageId 
              ? { ...m, id: msg.id, status: 'sent' }
              : m
          )
        );
        
        // Reset sending state
        isSendingRef.current = false;
        
        // Cleanup listener
        socket.off('message', messageHandler);
      }
    };
    
    // Listen for response
    socket.on('message', messageHandler);
    
    // Fallback timeout
    const timeoutId = setTimeout(() => {
      if (!receivedResponse) {
        console.log('⏰ Message timeout - assuming sent');
        setMessages(prev => 
          prev.map(m => 
            m.id === tempMessageId 
              ? { ...m, status: 'sent' }
              : m
          )
        );
        isSendingRef.current = false;
        
        // Cleanup
        socket.off('message', messageHandler);
      }
    }, 5000);

  }, [socket, conversationId, latestConversationId, currentUser, addMessage, isGuest, sessionId, messages, saveLocalMessages, startTypingEffect, stopTypingEffect, autoStopTyping]);

  // ==================== AUTO SAVE LOCAL MESSAGES ====================

  useEffect(() => {
    if (isGuest && messages.length > 0) {
      const localMessages = messages.filter(msg => msg.status === 'local');
      saveLocalMessages(localMessages);
    }
  }, [messages, isGuest, saveLocalMessages]);

  // ==================== SCROLL MANAGEMENT ====================

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const atBottom = scrollHeight - scrollTop - clientHeight < 100;
      isUserAtBottom.current = atBottom;
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isChatOpen]);

  useEffect(() => {
    if (isUserAtBottom.current) {
      scrollToBottom();
    }
  }, [messages, isTyping, scrollToBottom]);

  // ==================== UNREAD COUNT ====================

  useEffect(() => {
    if (isChatOpen) {
      setUnreadCount(0);
    }
  }, [isChatOpen]);

  useEffect(() => {
    if (!isChatOpen && messages.length > previousLengthRef.current) {
      const newMsgs = messages.slice(previousLengthRef.current);
      const newBot = newMsgs.filter(m => 
        m.senderType === 'BOT' && m.status !== 'sending'
      ).length;
      setUnreadCount(prev => prev + newBot);
    }
    previousLengthRef.current = messages.length;
  }, [messages, isChatOpen]);

  // ==================== UI HELPERS ====================

  const getBubbleClass = useCallback((msg: ChatMessage) => {
    const isOwn = msg.senderType === 'USER';
    const base = 'max-w-[75%] rounded-2xl px-4 py-2.5 shadow-md text-sm transition-all duration-200';
    
    if (msg.status === 'sending') {
      return `${base} bg-gray-300 text-gray-600 opacity-80 rounded-br-none`;
    }
    
    if (msg.status === 'local') {
      return `${base} bg-indigo-500 text-white rounded-br-none opacity-90`;
    }
    
    if (isOwn) {
      return `${base} bg-indigo-600 text-white rounded-br-none`;
    }
    
    if (msg.senderType === 'BOT') {
      return `${base} bg-green-600 text-white rounded-bl-none`;
    }
    
    return `${base} bg-gray-200 text-gray-800 rounded-bl-none`;
  }, []);

  const formatTime = useCallback((date: string) => 
    new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  , []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      
      // Không gọi sendMessage trực tiếp, mà trigger click button
      if (input.trim() && !isSendingRef.current) {
        console.log('⌨️ Enter pressed - triggering send button');
        document.getElementById('send-button')?.click();
      }
    }
  };

  // Helper function để hiển thị trạng thái
  const getConnectionStatus = () => {
    if (isGuest) {
      return {
        text: 'Chế độ khách - Tin nhắn tạm thời',
        color: 'text-yellow-600',
        inputDisabled: false,
        placeholder: 'Nhập tin nhắn (lưu tạm thời)...'
      };
    }
    
    if (!currentUser?.id) {
      return {
        text: 'Đang kiểm tra đăng nhập...',
        color: 'text-gray-600', 
        inputDisabled: true,
        placeholder: 'Đang kiểm tra...'
      };
    }
    
    if (!isConnected) {
      return {
        text: 'Đang kết nối...',
        color: 'text-orange-600',
        inputDisabled: true,
        placeholder: 'Đang kết nối...'
      };
    }
    
    if (!conversationId && !hasAttemptedInitialLoad) {
      return {
        text: 'Đang khởi tạo...',
        color: 'text-blue-600',
        inputDisabled: false,
        placeholder: 'Nhập tin nhắn để bắt đầu hội thoại...'
      };
    }
    
    if (!conversationId && hasAttemptedInitialLoad) {
      return {
        text: 'Sẵn sàng - Chưa có hội thoại',
        color: 'text-green-600',
        inputDisabled: false,
        placeholder: 'Nhập tin nhắn để tạo hội thoại mới...'
      };
    }
    
    return {
      text: `Đã kết nối`,
      color: 'text-green-600',
      inputDisabled: false,
      placeholder: 'Nhập tin nhắn...'
    };
  };

  // ==================== RENDER ====================

  const status = getConnectionStatus();

return (
  <>
    {/* Floating Button */}
    <div className="fixed bottom-6 right-6 z-[9999]">
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="relative bg-[#007DDB] hover:bg-[#0066b3] text-white px-7 py-3.5 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-semibold text-sm tracking-wider flex items-center gap-3"
      >
        <span>Chat hổ trợ</span>
      </button>

      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[22px] h-6 flex items-center justify-center px-1.5 shadow-lg animate-bounce">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </div>

    {/* Chat Window – Siêu tối giản & sang trọng */}
    {isChatOpen && (
      <div className="fixed bottom-24 right-6 w-[380px] h-[540px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden z-[9999] animate-in slide-in-from-bottom-10 duration-300">
        {/* Header */}
        <div className="bg-[#007DDB] text-white px-5 py-4 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg tracking-tight">AI Chứng Khoán</h3>
            <p className="text-xs opacity-90 mt-0.5 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-300' : 'bg-orange-300'} animate-pulse`}></span>
              {isConnected ? 'Hoạt động' : 'Đang kết nối...'}
            </p>
          </div>
          <button
            onClick={() => setIsChatOpen(false)}
            className="w-9 h-9 hover:bg-white/20 rounded-full flex items-center justify-center transition text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto bg-gray-50 p-5 space-y-4 scrollbar-thin scrollbar-thumb-gray-300"
        >
          {messages.length === 0 && !isTyping && (
            <div className="text-center mt-16 text-gray-600">
              <p className="font-semibold text-gray-800 text-lg">Chào nhà đầu tư</p>
              <p className="text-sm mt-3 max-w-[260px] mx-auto leading-relaxed">
                Phân tích cổ phiếu, tín hiệu kỹ thuật, định giá doanh nghiệp và chiến lược đầu tư.
              </p>
            </div>
          )}

          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.senderType === 'USER' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-sm text-sm leading-relaxed ${
                  msg.senderType === 'USER'
                    ? 'bg-[#007DDB] text-white'
                    : 'bg-white border border-gray-200 text-gray-800'
                }`}
              >
                {msg.senderType === 'BOT' && (
                  <div className="text-xs font-medium text-[#007DDB] mb-1 opacity-80">
                    AI Chứng Khoán
                  </div>
                )}
                <div className="whitespace-pre-wrap break-words">
                  {renderMessageWithLinks(msg.message)}
                </div>
                <div className="text-xs mt-2 opacity-60">
                  {formatTime(msg.createdAt)}
                </div>
              </div>
            </div>
          ))}

          {/* Typing */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-[#007DDB] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#007DDB] rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-[#007DDB] rounded-full animate-bounce delay-150"></div>
                </div>
                <span className="text-sm text-gray-600">AI đang phân tích</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-white">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Nhập câu hỏi về cổ phiếu, chỉ báo, chiến lược..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={status.inputDisabled || isSendingRef.current}
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-[#007DDB] focus:ring-4 focus:ring-[#007DDB]/10 outline-none transition"
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                if (!input.trim() || isSendingRef.current || status.inputDisabled) return;
                sendMessage(input);
              }}
              disabled={!input.trim() || isSendingRef.current || status.inputDisabled}
              className="bg-[#007DDB] hover:bg-[#0066b3] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition flex items-center gap-2 active:scale-95"
            >
              {isSendingRef.current ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
              <span className="hidden sm:inline">Gửi</span>
            </button>
          </div>
        </div>
      </div>
    )}
  </>
);
}