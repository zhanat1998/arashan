'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo, useRef } from 'react';
import { useAuth } from './AuthContext';
import { getSupabaseClient } from '@/lib/supabase/client';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  message_type: string;
  metadata?: any;
  is_read: boolean;
  is_edited?: boolean;
  edited_at?: string;
  reply_to?: {
    id: string;
    message: string;
    sender_id: string;
  };
  created_at: string;
  sender?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface Conversation {
  id: string;
  user_id: string;
  shop_id: string;
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
  created_at: string;
  shop?: {
    id: string;
    name: string;
    logo?: string;
    owner_id: string;
  };
}

interface UserPresence {
  user_id: string;
  status: 'online' | 'offline' | 'away';
  last_seen: string;
  typing_in?: string;
}

interface Pagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

interface ShopInfo {
  name: string;
  logo?: string;
}

interface ChatContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  loadingMore: boolean;
  sending: boolean;
  unreadTotal: number;
  isTyping: boolean;
  onlineUsers: Set<string>;
  pagination: Pagination | null;
  isDrawerOpen: boolean;
  replyingTo: Message | null;
  editingMessage: Message | null;
  setDrawerOpen: (open: boolean) => void;
  fetchConversations: () => Promise<void>;
  openConversation: (conversationId: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  startConversation: (shopId: string, initialMessage?: string, shopInfo?: ShopInfo) => Promise<string | null>;
  sendMessage: (message: string, messageType?: string, metadata?: any) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  editMessage: (messageId: string, newText: string) => Promise<void>;
  setReplyingTo: (message: Message | null) => void;
  setEditingMessage: (message: Message | null) => void;
  closeConversation: () => void;
  setTyping: (isTyping: boolean) => void;
  markAsRead: (messageIds: string[]) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Билдирүү үнү - Web Audio API менен
const playMessageSound = () => {
  if (typeof window === 'undefined') return;

  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Приятный звук уведомления
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
    oscillator.frequency.setValueAtTime(1100, audioContext.currentTime + 0.1); // C#6
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    // Ignore audio errors
  }
};

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const supabase = useMemo(() => getSupabaseClient(), []);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTypingState] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);

  // Drawer ачуу/жабуу
  const setDrawerOpen = useCallback((open: boolean) => {
    setIsDrawerOpen(open);
  }, []);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingUpdateRef = useRef<number>(0);

  // Жалпы окулбаган билдирүүлөр саны
  const unreadTotal = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);

  // Online status жаңыртуу
  const updatePresence = useCallback(async (status: 'online' | 'offline' | 'away') => {
    if (!user) return;

    try {
      await supabase
        .from('user_presence')
        .upsert({
          user_id: user.id,
          status,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
    } catch (error) {
      // Ignore errors - table might not exist yet
    }
  }, [user, supabase]);

  // Typing indicator жаңыртуу
  const setTyping = useCallback(async (typing: boolean) => {
    if (!user || !currentConversation) return;

    const now = Date.now();
    // Секундасына 1 жолу гана жаңыртуу
    if (now - lastTypingUpdateRef.current < 1000) return;
    lastTypingUpdateRef.current = now;

    try {
      await supabase
        .from('user_presence')
        .upsert({
          user_id: user.id,
          status: 'online',
          typing_in: typing ? currentConversation.id : null,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      // 3 секунддан кийин typing'ди өчүрүү
      if (typing) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          setTyping(false);
        }, 3000);
      }
    } catch (error) {
      // Ignore
    }
  }, [user, currentConversation, supabase]);

  // Билдирүүлөрдү окулду деп белгилөө
  const markAsRead = useCallback(async (messageIds: string[]) => {
    if (!user || messageIds.length === 0) return;

    try {
      await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .in('id', messageIds)
        .eq('receiver_id', user.id);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [user, supabase]);

  // Сүйлөшүүлөрдү алуу
  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/chat');
      if (response.ok) {
        const data = await response.json();
        setConversations(data || []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  }, [user]);

  // ===== ПАГИНАЦИЯ КОНФИГУРАЦИЯСЫ =====
  // Биринчи ачуу: 30 билдирүү (экранга толук жетет)
  // Скролл: 50 билдирүү (тез жүктөө)
  const INITIAL_LOAD = 30;
  const SCROLL_LOAD = 50;

  // Сүйлөшүү ачуу
  const openConversation = useCallback(async (conversationId: string) => {
    setLoading(true);
    setPagination(null);
    try {
      const response = await fetch(`/api/chat/${conversationId}?limit=${INITIAL_LOAD}&offset=0`);
      if (response.ok) {
        const data = await response.json();
        setCurrentConversation(data.conversation);
        setMessages(data.messages || []);
        setPagination(data.pagination ? { ...data.pagination, limit: SCROLL_LOAD } : null);

        // Unread count жаңыртуу (local)
        setConversations(prev =>
          prev.map(c =>
            c.id === conversationId ? { ...c, unread_count: 0 } : c
          )
        );
      }
    } catch (error) {
      console.error('Error opening conversation:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Көбүрөөк билдирүүлөрдү жүктөө (скролл кылганда)
  const loadMoreMessages = useCallback(async () => {
    if (!currentConversation || !pagination?.hasMore || loadingMore) return;

    setLoadingMore(true);
    try {
      const newOffset = pagination.offset + pagination.limit;
      const response = await fetch(
        `/api/chat/${currentConversation.id}?limit=${SCROLL_LOAD}&offset=${newOffset}`
      );

      if (response.ok) {
        const data = await response.json();
        // Эски билдирүүлөрдү башына кошуу
        setMessages(prev => [...(data.messages || []), ...prev]);
        // limit'ти SCROLL_LOAD кылып сактоо
        setPagination(data.pagination ? { ...data.pagination, limit: SCROLL_LOAD } : null);
      }
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [currentConversation, pagination, loadingMore]);

  // Жаңы сүйлөшүү баштоо - ДАРОО ачылат, skeleton көрсөтөт
  const startConversation = useCallback(async (shopId: string, initialMessage?: string, shopInfo?: { name: string; logo?: string }) => {
    if (!user) return null;

    // 1. ДАРОО drawer ачуу жана loading көрсөтүү
    setIsDrawerOpen(true);
    setLoading(true);

    // Убактылуу conversation көрсөтүү (skeleton учун)
    if (shopInfo) {
      setCurrentConversation({
        id: 'temp-loading',
        user_id: user.id,
        shop_id: shopId,
        unread_count: 0,
        created_at: new Date().toISOString(),
        shop: {
          id: shopId,
          name: shopInfo.name,
          logo: shopInfo.logo,
          owner_id: '',
        },
      });
    }
    setMessages([]);

    try {
      // 2. API чакыруу (фонда)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId,
          message: initialMessage,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // 3. Чыныгы conversation коюу
        if (data.conversation?.id) {
          setCurrentConversation(data.conversation);

          // Билдирүүлөрдү жүктөө
          const msgResponse = await fetch(`/api/chat/${data.conversation.id}?limit=${INITIAL_LOAD}&offset=0`);
          if (msgResponse.ok) {
            const msgData = await msgResponse.json();
            setMessages(msgData.messages || []);
            setPagination(msgData.pagination ? { ...msgData.pagination, limit: SCROLL_LOAD } : null);
          }

          // Conversations тизмесин жаңыртуу (фонда)
          fetchConversations();

          return data.conversation.id;
        }
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    } finally {
      setLoading(false);
    }
    return null;
  }, [user, fetchConversations]);

  // Билдирүү жөнөтүү
  const sendMessage = useCallback(async (
    message: string,
    messageType: string = 'text',
    metadata?: any
  ) => {
    if (!currentConversation || !message.trim()) return;

    setSending(true);
    setTyping(false);

    // Оптимистик UI - дароо көрсөтүү
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: currentConversation.id,
      sender_id: user?.id || '',
      receiver_id: currentConversation.shop?.owner_id || '',
      message,
      message_type: messageType,
      metadata,
      is_read: false,
      created_at: new Date().toISOString(),
      sender: {
        id: user?.id || '',
        full_name: user?.user_metadata?.full_name || 'Сиз',
        avatar_url: user?.user_metadata?.avatar_url,
      },
    };

    setMessages(prev => [...prev, tempMessage]);

    try {
      const response = await fetch(`/api/chat/${currentConversation.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          message_type: messageType,
          metadata,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Temp билдирүүнү чыныгысына алмаштыруу
        setMessages(prev =>
          prev.map(m => m.id === tempMessage.id ? data.message : m)
        );

        // Сүйлөшүүнү жаңыртуу
        setConversations(prev =>
          prev.map(c =>
            c.id === currentConversation.id
              ? { ...c, last_message: message, last_message_at: new Date().toISOString() }
              : c
          )
        );
      } else {
        // Ката болсо temp билдирүүнү алып салуу
        setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
    } finally {
      setSending(false);
    }
  }, [currentConversation, user, setTyping]);

  // Билдирүүнү өчүрүү
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      const response = await fetch(`/api/chat/message/${messageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessages(prev => prev.filter(m => m.id !== messageId));
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }, []);

  // Билдирүүнү түзөтүү
  const editMessage = useCallback(async (messageId: string, newText: string) => {
    try {
      const response = await fetch(`/api/chat/message/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newText }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev =>
          prev.map(m => m.id === messageId ? { ...m, ...data.message } : m)
        );
        setEditingMessage(null);
      }
    } catch (error) {
      console.error('Error editing message:', error);
    }
  }, []);

  // Сүйлөшүүнү жабуу
  const closeConversation = useCallback(() => {
    setCurrentConversation(null);
    setMessages([]);
    setIsTypingState(false);
    setPagination(null);
    setReplyingTo(null);
    setEditingMessage(null);
  }, []);

  // Realtime subscription - учурдагы сүйлөшүү
  useEffect(() => {
    if (!user || !currentConversation) return;

    const channel = supabase
      .channel(`chat:${currentConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${currentConversation.id}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message;

          // Эгер өзүмдүн билдирүүм болбосо гана кошуу
          if (newMessage.sender_id !== user.id) {
            // Sender маалыматын алуу
            const { data: sender } = await supabase
              .from('users')
              .select('id, full_name, avatar_url')
              .eq('id', newMessage.sender_id)
              .single();

            setMessages(prev => {
              // Дубликат текшерүү
              if (prev.some(m => m.id === newMessage.id)) {
                return prev;
              }
              return [...prev, { ...newMessage, sender: sender || undefined }];
            });

            // Үн ойнотуу
            playMessageSound();

            // Билдирүүнү окулду деп белгилөө
            markAsRead([newMessage.id]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, currentConversation, supabase, markAsRead]);

  // Realtime subscription - typing indicator
  useEffect(() => {
    if (!user || !currentConversation) return;

    const channel = supabase
      .channel(`presence:${currentConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence',
        },
        (payload) => {
          const presence = payload.new as UserPresence;

          // Карши тараптын typing статусу
          if (presence.user_id !== user.id) {
            setIsTypingState(presence.typing_in === currentConversation.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, currentConversation, supabase]);

  // Жалпы realtime - жаңы билдирүүлөр үчүн
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('chat:all')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          const newMessage = payload.new as Message;

          // Эгер мага жөнөтүлгөн болсо
          if (newMessage.receiver_id === user.id) {
            // Сүйлөшүүлөрдү жаңыртуу
            setConversations(prev =>
              prev.map(c => {
                if (c.id === newMessage.conversation_id) {
                  // Учурдагы ачык сүйлөшүү болбосо unread кошуу
                  const isCurrentOpen = currentConversation?.id === c.id;
                  return {
                    ...c,
                    last_message: newMessage.message,
                    last_message_at: newMessage.created_at,
                    unread_count: isCurrentOpen ? c.unread_count : (c.unread_count || 0) + 1,
                  };
                }
                return c;
              })
            );

            // Эгер башка сүйлөшүүдөн болсо үн ойнотуу
            if (currentConversation?.id !== newMessage.conversation_id) {
              playMessageSound();
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, currentConversation, supabase]);

  // Online presence tracking
  useEffect(() => {
    if (!user) return;

    // Кирүүдө online кылуу
    updatePresence('online');

    // Visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updatePresence('online');
      } else {
        updatePresence('away');
      }
    };

    // Чыгууда offline кылуу
    const handleBeforeUnload = () => {
      updatePresence('offline');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Heartbeat - ар 30 секундда online деп жаңыртуу
    const heartbeat = setInterval(() => {
      if (document.visibilityState === 'visible') {
        updatePresence('online');
      }
    }, 30000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(heartbeat);
      updatePresence('offline');
    };
  }, [user, updatePresence]);

  // Online users tracking
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('online-users')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence',
        },
        (payload) => {
          const presence = payload.new as UserPresence;
          if (presence) {
            setOnlineUsers(prev => {
              const newSet = new Set(prev);
              if (presence.status === 'online') {
                newSet.add(presence.user_id);
              } else {
                newSet.delete(presence.user_id);
              }
              return newSet;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase]);

  // Колдонуучу өзгөргөндө сүйлөшүүлөрдү алуу
  useEffect(() => {
    if (user) {
      fetchConversations();
    } else {
      setConversations([]);
      setCurrentConversation(null);
      setMessages([]);
    }
  }, [user, fetchConversations]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversation,
        messages,
        loading,
        loadingMore,
        sending,
        unreadTotal,
        isTyping,
        onlineUsers,
        pagination,
        isDrawerOpen,
        replyingTo,
        editingMessage,
        setDrawerOpen,
        fetchConversations,
        openConversation,
        loadMoreMessages,
        startConversation,
        sendMessage,
        deleteMessage,
        editMessage,
        setReplyingTo,
        setEditingMessage,
        closeConversation,
        setTyping,
        markAsRead,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}