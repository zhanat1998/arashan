'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
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
  created_at: string;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
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

interface ChatContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  sending: boolean;
  unreadTotal: number;
  fetchConversations: () => Promise<void>;
  openConversation: (conversationId: string) => Promise<void>;
  startConversation: (shopId: string, initialMessage?: string) => Promise<string | null>;
  sendMessage: (message: string, messageType?: string, metadata?: any) => Promise<void>;
  closeConversation: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const supabase = useMemo(() => getSupabaseClient(), []);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Жалпы окулбаган билдирүүлөр саны
  const unreadTotal = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);

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

  // Сүйлөшүү ачуу
  const openConversation = useCallback(async (conversationId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/chat/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setCurrentConversation(data.conversation);
        setMessages(data.messages || []);

        // Unread count жаңыртуу
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

  // Жаңы сүйлөшүү баштоо
  const startConversation = useCallback(async (shopId: string, initialMessage?: string) => {
    if (!user) return null;

    try {
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
        await fetchConversations();
        if (data.conversation?.id) {
          await openConversation(data.conversation.id);
        }
        return data.conversation?.id || null;
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
    return null;
  }, [user, fetchConversations, openConversation]);

  // Билдирүү жөнөтүү
  const sendMessage = useCallback(async (
    message: string,
    messageType: string = 'text',
    metadata?: any
  ) => {
    if (!currentConversation || !message.trim()) return;

    setSending(true);
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
        // Билдирүүнү тизмеге кошуу
        setMessages(prev => [...prev, data.message]);

        // Сүйлөшүүнү жаңыртуу
        setConversations(prev =>
          prev.map(c =>
            c.id === currentConversation.id
              ? { ...c, last_message: message, last_message_at: new Date().toISOString() }
              : c
          )
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  }, [currentConversation]);

  // Сүйлөшүүнү жабуу
  const closeConversation = useCallback(() => {
    setCurrentConversation(null);
    setMessages([]);
  }, []);

  // Realtime subscription
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
              .select('id, name, avatar')
              .eq('id', newMessage.sender_id)
              .single();

            setMessages(prev => {
              // Дубликат текшерүү
              if (prev.some(m => m.id === newMessage.id)) {
                return prev;
              }
              return [...prev, { ...newMessage, sender: sender || undefined }];
            });

            // Билдирүүнү окулду деп белгилөө
            await supabase
              .from('chat_messages')
              .update({ is_read: true })
              .eq('id', newMessage.id);
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
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, currentConversation, supabase]);

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
        sending,
        unreadTotal,
        fetchConversations,
        openConversation,
        startConversation,
        sendMessage,
        closeConversation,
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
