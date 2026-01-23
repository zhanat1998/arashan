'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { getSupabaseClient } from '@/lib/supabase/client';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  message_type: string;
  is_read: boolean;
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
  last_message: string;
  last_message_at: string;
  unread_count: number;
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    email?: string;
  };
}

interface Pagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// Skeleton Components
const ConversationSkeleton = () => (
  <div className="px-4 py-4 flex items-center gap-4 animate-pulse">
    <div className="w-14 h-14 bg-gray-200 rounded-2xl" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-200 rounded-lg w-3/4" />
      <div className="h-3 bg-gray-200 rounded-lg w-1/2" />
    </div>
    <div className="w-12 h-4 bg-gray-200 rounded" />
  </div>
);

const MessageSkeleton = ({ isMe }: { isMe: boolean }) => (
  <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-pulse`}>
    {!isMe && <div className="w-10 h-10 bg-gray-200 rounded-xl mr-3" />}
    <div className={`${isMe ? 'bg-gray-200' : 'bg-gray-100'} rounded-2xl ${isMe ? 'rounded-br-md' : 'rounded-bl-md'} px-5 py-4 max-w-[65%]`}>
      <div className="h-4 bg-gray-300 rounded w-40 mb-2" />
      <div className="h-4 bg-gray-300 rounded w-28 mb-2" />
      <div className="h-3 bg-gray-300 rounded w-16" />
    </div>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-full px-8 text-center">
    <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">Билдирүүлөр жок</h3>
    <p className="text-gray-500 max-w-sm">Кардарлар сизге жазганда бул жерде көрүнөт</p>
  </div>
);

export default function SellerMessagesPage() {
  const { user } = useAuth();
  const supabase = useMemo(() => getSupabaseClient(), []);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sending, setSending] = useState(false);
  const [shopId, setShopId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Сүйлөшүүлөрдү алуу
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/seller/messages');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
        setShopId(data.shop_id);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Билдирүүлөрдү алуу (пагинация менен)
  const fetchMessages = useCallback(async (conversationId: string) => {
    setMessagesLoading(true);
    setPagination(null);
    try {
      const res = await fetch(`/api/chat/${conversationId}?limit=20&offset=0`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setPagination(data.pagination || null);

        const unreadIds = (data.messages || [])
          .filter((m: Message) => !m.is_read && m.sender_id !== user?.id)
          .map((m: Message) => m.id);

        if (unreadIds.length > 0) {
          await supabase
            .from('chat_messages')
            .update({ is_read: true })
            .in('id', unreadIds);

          setConversations(prev =>
            prev.map(c =>
              c.id === conversationId ? { ...c, unread_count: 0 } : c
            )
          );
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  }, [user, supabase]);

  // Көбүрөөк билдирүүлөрдү жүктөө
  const loadMoreMessages = useCallback(async () => {
    if (!selectedConversation || !pagination?.hasMore || loadingMore) return;

    setLoadingMore(true);
    try {
      const newOffset = pagination.offset + pagination.limit;
      const res = await fetch(
        `/api/chat/${selectedConversation.id}?limit=${pagination.limit}&offset=${newOffset}`
      );

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...(data.messages || []), ...prev]);
        setPagination(data.pagination || null);
      }
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [selectedConversation, pagination, loadingMore]);

  // Билдирүү жөнөтүү
  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedConversation || sending) return;

    const messageText = inputMessage.trim();
    setInputMessage('');
    setSending(true);

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: selectedConversation.id,
      sender_id: user?.id || '',
      receiver_id: selectedConversation.user_id,
      message: messageText,
      message_type: 'text',
      is_read: false,
      created_at: new Date().toISOString(),
      sender: { id: user?.id || '', full_name: 'Сиз' },
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      const res = await fetch(`/api/chat/${selectedConversation.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev =>
          prev.map(m => m.id === tempMessage.id ? data.message : m)
        );
        setConversations(prev =>
          prev.map(c =>
            c.id === selectedConversation.id
              ? { ...c, last_message: messageText, last_message_at: new Date().toISOString() }
              : c
          )
        );
      } else {
        setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    fetchMessages(conv.id);
    setShowMobileChat(true);
    setTimeout(() => inputRef.current?.focus(), 200);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'азыр';
    if (minutes < 60) return `${minutes} мин`;
    if (hours < 24) return date.toLocaleTimeString('ky-KG', { hour: '2-digit', minute: '2-digit' });
    if (days === 1) return 'Кечээ';
    if (days < 7) return date.toLocaleDateString('ky-KG', { weekday: 'short' });
    return date.toLocaleDateString('ky-KG', { day: 'numeric', month: 'short' });
  };

  // Filtered conversations
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const query = searchQuery.toLowerCase();
    return conversations.filter(c =>
      c.user?.full_name?.toLowerCase().includes(query) ||
      c.last_message?.toLowerCase().includes(query)
    );
  }, [conversations, searchQuery]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Infinite scroll - жогору скролл кылганда көбүрөөк жүктөө
  useEffect(() => {
    const trigger = loadMoreTriggerRef.current;
    const container = messagesContainerRef.current;

    if (!trigger || !container || !pagination?.hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && pagination?.hasMore) {
          const scrollHeight = container.scrollHeight;
          loadMoreMessages().then(() => {
            requestAnimationFrame(() => {
              const newScrollHeight = container.scrollHeight;
              container.scrollTop = newScrollHeight - scrollHeight;
            });
          });
        }
      },
      { root: container, threshold: 0.1 }
    );

    observer.observe(trigger);

    return () => observer.disconnect();
  }, [pagination?.hasMore, loadingMore, loadMoreMessages]);

  // Initial load
  useEffect(() => {
    if (user) fetchConversations();
  }, [user, fetchConversations]);

  // Realtime subscriptions
  useEffect(() => {
    if (!user || !shopId) return;

    const channel = supabase
      .channel('seller-messages-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        async (payload) => {
          const newMessage = payload.new as Message;

          if (selectedConversation && newMessage.conversation_id === selectedConversation.id) {
            if (newMessage.sender_id !== user.id) {
              const { data: sender } = await supabase
                .from('users')
                .select('id, full_name, avatar_url')
                .eq('id', newMessage.sender_id)
                .single();

              setMessages(prev => {
                if (prev.some(m => m.id === newMessage.id)) return prev;
                return [...prev, { ...newMessage, sender: sender || undefined }];
              });

              await supabase
                .from('chat_messages')
                .update({ is_read: true })
                .eq('id', newMessage.id);
            }
          }

          setConversations(prev => {
            const updated = prev.map(c => {
              if (c.id === newMessage.conversation_id) {
                const isCurrentConv = selectedConversation?.id === c.id;
                return {
                  ...c,
                  last_message: newMessage.message,
                  last_message_at: newMessage.created_at,
                  unread_count: isCurrentConv ? 0 : c.unread_count + 1,
                };
              }
              return c;
            });
            return updated.sort((a, b) =>
              new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
            );
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, shopId, selectedConversation, supabase]);

  // Typing indicator
  useEffect(() => {
    if (!user || !selectedConversation) return;

    const channel = supabase
      .channel(`typing:seller:${selectedConversation.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_presence' },
        (payload) => {
          const presence = payload.new as any;
          if (presence.user_id !== user.id) {
            setIsTyping(presence.typing_in === selectedConversation.id);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, selectedConversation, supabase]);

  // Online users
  useEffect(() => {
    if (!user) return;

    const fetchOnline = async () => {
      const { data } = await supabase.from('user_presence').select('user_id').eq('status', 'online');
      if (data) setOnlineUsers(new Set(data.map(p => p.user_id)));
    };
    fetchOnline();

    const channel = supabase
      .channel('online-users-seller-page')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_presence' },
        (payload) => {
          const presence = payload.new as any;
          setOnlineUsers(prev => {
            const updated = new Set(prev);
            presence.status === 'online' ? updated.add(presence.user_id) : updated.delete(presence.user_id);
            return updated;
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, supabase]);

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);

  if (loading) {
    return (
      <div className="p-4 lg:p-6">
        <div className="animate-pulse mb-6">
          <div className="h-8 bg-gray-200 rounded-lg w-48 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-32" />
        </div>
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-[calc(100vh-200px)]">
          <div className="flex h-full">
            <div className="w-96 border-r border-gray-100">
              <div className="p-4 border-b"><div className="h-12 bg-gray-200 rounded-xl" /></div>
              {[...Array(5)].map((_, i) => <ConversationSkeleton key={i} />)}
            </div>
            <div className="flex-1 bg-gray-50" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800">Билдирүүлөр</h1>
          {totalUnread > 0 && (
            <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold rounded-full animate-pulse shadow-lg">
              {totalUnread} жаңы
            </span>
          )}
        </div>
        <p className="text-gray-500 mt-1">Кардарлар менен сүйлөшүү</p>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-[calc(100vh-200px)] min-h-[500px]">
        <div className="flex h-full">
          {/* Conversations List */}
          <div className={`w-full md:w-[360px] lg:w-[400px] border-r border-gray-100 flex flex-col bg-white ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
            {/* Search */}
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Кардар издөө..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-red-500/30 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredConversations.map((conv, index) => {
                    const isOnline = conv.user?.id ? onlineUsers.has(conv.user.id) : false;
                    const isSelected = selectedConversation?.id === conv.id;

                    return (
                      <button
                        key={conv.id}
                        onClick={() => selectConversation(conv)}
                        className={`w-full px-4 py-4 flex items-center gap-4 hover:bg-gray-50 text-left transition-all duration-200 group ${
                          isSelected ? 'bg-red-50 border-l-4 border-red-500' : ''
                        }`}
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          {conv.user?.avatar_url ? (
                            <Image
                              src={conv.user.avatar_url}
                              alt={conv.user.full_name || 'User'}
                              width={56}
                              height={56}
                              className="rounded-2xl object-cover ring-2 ring-gray-100 group-hover:ring-red-100 transition-all"
                            />
                          ) : (
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                              <span className="text-white text-xl font-bold">
                                {(conv.user?.full_name || 'K').charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm transition-colors ${
                            isOnline ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className={`font-semibold truncate transition-colors ${isSelected ? 'text-red-600' : 'text-gray-900 group-hover:text-red-600'}`}>
                              {conv.user?.full_name || 'Кардар'}
                            </p>
                            {conv.last_message_at && (
                              <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                                {formatTime(conv.last_message_at)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {conv.last_message || 'Жаңы сүйлөшүү'}
                          </p>
                        </div>

                        {conv.unread_count > 0 && (
                          <span className="w-7 h-7 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                            {conv.unread_count > 9 ? '9+' : conv.unread_count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col bg-gray-50 ${showMobileChat ? 'flex' : 'hidden md:flex'}`}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="px-5 py-4 bg-white border-b border-gray-100 flex items-center gap-4">
                  <button
                    onClick={() => setShowMobileChat(false)}
                    className="md:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <div className="relative flex-shrink-0">
                    {selectedConversation.user?.avatar_url ? (
                      <Image
                        src={selectedConversation.user.avatar_url}
                        alt={selectedConversation.user.full_name || 'User'}
                        width={48}
                        height={48}
                        className="rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg font-bold">
                          {(selectedConversation.user?.full_name || 'K').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                      selectedConversation.user?.id && onlineUsers.has(selectedConversation.user.id)
                        ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                      {selectedConversation.user?.full_name || 'Кардар'}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${
                        selectedConversation.user?.id && onlineUsers.has(selectedConversation.user.id)
                          ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                      {selectedConversation.user?.id && onlineUsers.has(selectedConversation.user.id)
                        ? 'Онлайн' : 'Офлайн'}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-5 space-y-4">
                  {messagesLoading ? (
                    <div className="space-y-4">
                      <MessageSkeleton isMe={false} />
                      <MessageSkeleton isMe={true} />
                      <MessageSkeleton isMe={false} />
                      <MessageSkeleton isMe={true} />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4">
                        <span className="text-4xl">👋</span>
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-1">Биринчи болуп жазыңыз!</h4>
                      <p className="text-sm text-gray-500">Кардарыңызга жооп бериңиз</p>
                    </div>
                  ) : (
                    <>
                      {/* Load More Trigger */}
                      {pagination?.hasMore && (
                        <div ref={loadMoreTriggerRef} className="h-1">
                          {loadingMore && (
                            <div className="flex justify-center py-3">
                              <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                                <span>Жүктөлүүдө...</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {messages.map((msg, index) => {
                        const isMe = msg.sender_id === user?.id;
                        const showAvatar = !isMe && (index === 0 || messages[index - 1]?.sender_id === user?.id);

                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            {!isMe && showAvatar && (
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center mr-3 flex-shrink-0">
                                <span className="text-white text-sm font-bold">
                                  {(selectedConversation.user?.full_name || 'K').charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            {!isMe && !showAvatar && <div className="w-13" />}

                            <div
                              className={`max-w-[70%] px-5 py-3 shadow-sm ${
                                isMe
                                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl rounded-br-md'
                                  : 'bg-white text-gray-800 rounded-2xl rounded-bl-md'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{msg.message}</p>
                              <div className={`flex items-center gap-1 mt-1.5 ${isMe ? 'justify-end' : ''}`}>
                                <span className={`text-[11px] ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                                  {formatTime(msg.created_at)}
                                </span>
                                {isMe && (
                                  <span className="ml-1">
                                    {msg.is_read ? (
                                      <svg className="w-4 h-4 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z" />
                                      </svg>
                                    ) : (
                                      <svg className="w-4 h-4 text-white/50" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                      </svg>
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Typing Indicator */}
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center mr-3">
                            <span className="text-white text-sm font-bold">
                              {(selectedConversation.user?.full_name || 'K').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="bg-white px-5 py-4 rounded-2xl rounded-bl-md shadow-sm">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="bg-white border-t border-gray-100 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Жооп жазыңыз..."
                        className="w-full bg-gray-100 rounded-2xl px-5 py-3.5 text-sm outline-none focus:ring-2 focus:ring-red-500/30 focus:bg-white transition-all pr-14"
                        disabled={sending}
                      />
                      <button className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    </div>

                    <button
                      onClick={sendMessage}
                      disabled={!inputMessage.trim() || sending}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                        inputMessage.trim() && !sending
                          ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {sending ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg className="w-5 h-5 rotate-45" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Empty Selection State */
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center px-8">
                  <div className="w-28 h-28 bg-white rounded-[2rem] shadow-xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-14 h-14 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Сүйлөшүү тандаңыз</h3>
                  <p className="text-gray-500 max-w-sm">
                    Сол тараптан кардарды тандап, аны менен сүйлөшүүнү баштаңыз
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}