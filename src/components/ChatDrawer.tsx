'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { getSupabaseClient } from '@/lib/supabase/client';
import MediaPicker from './MediaPicker';

// Skeleton Components
const ConversationSkeleton = () => (
  <div className="px-4 py-3 flex items-center gap-3 animate-pulse">
    <div className="w-12 h-12 bg-gray-200 rounded-full" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
    </div>
  </div>
);

const MessageSkeleton = ({ isMe }: { isMe: boolean }) => (
  <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-pulse`}>
    <div className={`${isMe ? 'bg-gray-200' : 'bg-gray-100'} rounded-2xl ${isMe ? 'rounded-br-sm' : 'rounded-bl-sm'} px-4 py-3 max-w-[70%]`}>
      <div className="h-4 bg-gray-300 rounded w-32 mb-2" />
      <div className="h-3 bg-gray-300 rounded w-20" />
    </div>
  </div>
);

// Loading More Skeleton
const LoadingMoreSkeleton = () => (
  <div className="flex justify-center py-2">
    <div className="flex items-center gap-2 text-gray-400 text-sm">
      <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
      <span>Жүктөлүүдө...</span>
    </div>
  </div>
);

// Message interface for action menu
interface MessageForAction {
  id: string;
  message: string;
  sender_id: string;
  message_type: string;
}

export default function ChatDrawer() {
  const { user } = useAuth();
  const {
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
    openConversation,
    loadMoreMessages,
    sendMessage,
    deleteMessage,
    editMessage,
    setReplyingTo,
    setEditingMessage,
    closeConversation,
    setTyping,
    fetchConversations,
  } = useChat();

  const [showList, setShowList] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<{ url: string; type: 'image' | 'video'; file: File } | null>(null);
  const [actionMenuMessage, setActionMenuMessage] = useState<MessageForAction | null>(null);
  const [actionMenuPosition, setActionMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const supabase = getSupabaseClient();

  // Мобилдик клавиатура үчүн offset
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  // Drawer ачылганда анимация
  useEffect(() => {
    if (isDrawerOpen) {
      setIsAnimating(true);
      setConversationsLoading(true);
      fetchConversations().finally(() => {
        setTimeout(() => setConversationsLoading(false), 300);
      });
    }
  }, [isDrawerOpen, fetchConversations]);

  // Мобилдик клавиатура ачылганда input'ту жогору көтөрүү (10px клавиатурадан)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const viewport = window.visualViewport;
    if (!viewport) return;

    const updatePosition = () => {
      // Экран бийиктиги менен viewport бийиктигинин айырмасы = клавиатура бийиктиги
      const keyboardHeight = window.innerHeight - viewport.height;

      if (keyboardHeight > 100) {
        // Клавиатура ачылды
        setKeyboardOffset(keyboardHeight);
        setIsKeyboardOpen(true);

        // Body scroll'ду өчүрүү
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
      } else {
        // Клавиатура жабылды
        setKeyboardOffset(0);
        setIsKeyboardOpen(false);

        // Body scroll'ду кайра иштетүү
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
      }
    };

    viewport.addEventListener('resize', updatePosition);

    return () => {
      viewport.removeEventListener('resize', updatePosition);
      // Cleanup body styles
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, []);

  // currentConversation бар болсо list'ди көрсөтпөө
  useEffect(() => {
    if (currentConversation && isDrawerOpen) {
      setShowList(false);
    }
  }, [currentConversation, isDrawerOpen]);

  // Билдирүүлөргө автоматтык түшүү
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Сүйлөшүү ачылганда
  useEffect(() => {
    if (currentConversation) {
      setShowList(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [currentConversation]);

  // Infinite scroll - жогору скролл кылганда көбүрөөк жүктөө
  useEffect(() => {
    const trigger = loadMoreTriggerRef.current;
    const container = messagesContainerRef.current;

    if (!trigger || !container || !pagination?.hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && pagination?.hasMore) {
          // Учурдагы scroll позициясын сактоо
          const scrollHeight = container.scrollHeight;
          loadMoreMessages().then(() => {
            // Scroll позициясын сактоо (жаңы билдирүүлөр жогоруга кошулат)
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

  // Typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
    if (e.target.value.trim()) {
      setTyping(true);
    }
  };

  const handleSend = async () => {
    if (!inputMessage.trim() || sending) return;
    const message = inputMessage;
    setInputMessage('');

    // Edit mode
    if (editingMessage) {
      await editMessage(editingMessage.id, message);
      setEditingMessage(null);
      return;
    }

    // Reply mode - metadata'га reply_to кошуу
    if (replyingTo) {
      await sendMessage(message, 'text', {
        reply_to: {
          id: replyingTo.id,
          message: replyingTo.message.slice(0, 100),
          sender_id: replyingTo.sender_id,
        },
      });
      setReplyingTo(null);
      return;
    }

    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape') {
      cancelEdit();
      cancelReply();
    }
  };

  // Edit mode - текстти коюу
  useEffect(() => {
    if (editingMessage) {
      setInputMessage(editingMessage.message);
      inputRef.current?.focus();
    }
  }, [editingMessage]);

  // Quick reaction emojis
  const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

  // Message action menu ачуу - ONLY right-click or long-press
  const openActionMenu = (msg: MessageForAction, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = (e.target as HTMLElement).closest('[data-message-id]')?.getBoundingClientRect()
      || (e.target as HTMLElement).getBoundingClientRect();
    const drawerRect = drawerRef.current?.getBoundingClientRect();

    if (drawerRect) {
      // Menu позициясын drawer ичинде эсептөө
      let x = rect.left - drawerRect.left + rect.width / 2;
      let y = rect.top - drawerRect.top;

      // Экрандан чыгып кетпеши үчүн
      x = Math.max(100, Math.min(x, drawerRect.width - 100));
      y = Math.max(80, y);

      setActionMenuPosition({ x, y });
    }

    setActionMenuMessage(msg);
  };

  // Highlight message temporarily (for reply)
  const highlightMessage = (msgId: string) => {
    setSelectedMessageId(msgId);
    // 3 секунддан кийин өчүрүү
    setTimeout(() => {
      setSelectedMessageId(null);
    }, 3000);
  };

  // Right-click handler (desktop - two finger tap)
  const handleContextMenu = (msg: MessageForAction) => (e: React.MouseEvent) => {
    openActionMenu(msg, e);
  };

  // Long press handler (mobile)
  const handleTouchStart = (msg: MessageForAction) => (e: React.TouchEvent) => {
    longPressTimerRef.current = setTimeout(() => {
      openActionMenu(msg, e);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };


  // Quick reaction
  const handleQuickReaction = async (emoji: string) => {
    if (actionMenuMessage) {
      // Реакцияны билдирүү катары жөнөтүү
      await sendMessage(emoji, 'reaction', {
        reaction_to: actionMenuMessage.id,
      });
      closeActionMenu();
    }
  };

  // Scroll to replied message
  const scrollToMessage = (messageId: string) => {
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Көк фон менен белгилөө (3 сек)
      highlightMessage(messageId);
    }
  };

  // Action menu жабуу
  const closeActionMenu = () => {
    setActionMenuMessage(null);
  };

  // Reply
  const handleReply = () => {
    if (actionMenuMessage) {
      // Кайсыл билдирүүгө жооп берип атканын көрсөтүү (3 сек)
      highlightMessage(actionMenuMessage.id);

      setReplyingTo({
        id: actionMenuMessage.id,
        message: actionMenuMessage.message,
        sender_id: actionMenuMessage.sender_id,
        conversation_id: currentConversation?.id || '',
        receiver_id: '',
        message_type: actionMenuMessage.message_type,
        is_read: false,
        created_at: '',
      });
      closeActionMenu();
      inputRef.current?.focus();
    }
  };

  // Edit
  const handleEdit = () => {
    if (actionMenuMessage && actionMenuMessage.sender_id === user?.id) {
      setEditingMessage({
        id: actionMenuMessage.id,
        message: actionMenuMessage.message,
        sender_id: actionMenuMessage.sender_id,
        conversation_id: currentConversation?.id || '',
        receiver_id: '',
        message_type: actionMenuMessage.message_type,
        is_read: false,
        created_at: '',
      });
      closeActionMenu();
    }
  };

  // Delete
  const handleDelete = async () => {
    if (actionMenuMessage && actionMenuMessage.sender_id === user?.id) {
      await deleteMessage(actionMenuMessage.id);
      closeActionMenu();
    }
  };

  // Copy
  const handleCopy = async () => {
    if (actionMenuMessage) {
      try {
        await navigator.clipboard.writeText(actionMenuMessage.message);
        closeActionMenu();
      } catch (err) {
        console.error('Copy failed:', err);
      }
    }
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingMessage(null);
    setInputMessage('');
  };

  // Cancel reply
  const cancelReply = () => {
    setReplyingTo(null);
  };

  // Emoji тандоо
  const handleEmojiSelect = (emoji: string) => {
    setInputMessage(prev => prev + emoji);
    inputRef.current?.focus();
  };

  // GIF жөнөтүү
  const handleGifSelect = async (url: string) => {
    setShowEmojiPicker(false);
    await sendMessage('GIF', 'gif', { url });
  };

  // Стикер жөнөтүү
  const handleStickerSelect = async (url: string) => {
    setShowEmojiPicker(false);
    await sendMessage('Стикер', 'sticker', { url });
  };

  // Файл тандоо
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Файл өлчөмүн текшерүү (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('Файл 10MB дан ашпашы керек');
      return;
    }

    // Файл түрүн текшерүү
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      alert('Сүрөт же видео гана жүктөй аласыз');
      return;
    }

    // Preview көрсөтүү
    const url = URL.createObjectURL(file);
    setMediaPreview({
      url,
      type: isImage ? 'image' : 'video',
      file,
    });

    // Input'ду тазалоо
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Media preview жабуу
  const cancelMediaPreview = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview.url);
      setMediaPreview(null);
    }
  };

  // Media жөнөтүү
  const handleSendMedia = async () => {
    if (!mediaPreview || !currentConversation || uploadingMedia) return;

    setUploadingMedia(true);

    try {
      // Supabase storage'га жүктөө
      const fileExt = mediaPreview.file.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
      const bucket = mediaPreview.type === 'image' ? 'chat-images' : 'chat-videos';

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, mediaPreview.file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        // Bucket жок болсо түзүү
        if (uploadError.message.includes('not found')) {
          alert('Storage конфигурациясы жок. Администраторго кайрылыңыз.');
        } else {
          alert('Жүктөө катасы: ' + uploadError.message);
        }
        return;
      }

      // Public URL алуу
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      // Билдирүү жөнөтүү
      await sendMessage(
        mediaPreview.type === 'image' ? '📷 Сүрөт' : '🎥 Видео',
        mediaPreview.type,
        { url: urlData.publicUrl, fileName: mediaPreview.file.name }
      );

      // Preview тазалоо
      cancelMediaPreview();
    } catch (error) {
      console.error('Error sending media:', error);
      alert('Жөнөтүүдө ката кетти');
    } finally {
      setUploadingMedia(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'азыр';
    if (minutes < 60) return `${minutes} мин`;
    if (hours < 24) return `${hours} саат`;
    if (days === 1) return 'кечээ';
    if (days < 7) return `${days} күн`;

    return date.toLocaleDateString('ky-KG', { day: 'numeric', month: 'short' });
  };

  const handleBack = () => {
    setShowList(true);
    closeConversation(); // currentConversation'ду тазалайт
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => setDrawerOpen(false), 200);
  };

  const handleOpen = () => {
    setDrawerOpen(true);
    setShowList(true);
  };

  const isShopOnline = currentConversation?.shop?.owner_id
    ? onlineUsers.has(currentConversation.shop.owner_id)
    : false;

  // Эгер currentConversation бар болсо, conversation көрсөтүү (list эмес)
  // showList true болсо да, currentConversation бар болсо conversation көрүнөт
  const effectiveShowList = showList && !currentConversation;

  if (!user) return null;

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => isDrawerOpen ? handleClose() : handleOpen()}
        className={`fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-300 ${
          isDrawerOpen
            ? 'bg-gray-700 rotate-0 scale-90'
            : 'bg-gradient-to-r from-red-500 to-orange-500 hover:scale-110 hover:shadow-xl'
        }`}
      >
        <div className={`transition-transform duration-300 ${isDrawerOpen ? 'rotate-180' : ''}`}>
          {isDrawerOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          )}
        </div>

        {/* Unread Badge */}
        {!isDrawerOpen && unreadTotal > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce shadow-lg">
            {unreadTotal > 9 ? '9+' : unreadTotal}
          </span>
        )}

        {/* Pulse Ring */}
        {!isDrawerOpen && unreadTotal > 0 && (
          <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
        )}
      </button>

      {/* Chat Drawer */}
      {isDrawerOpen && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300"
            style={{ opacity: isAnimating ? 1 : 0 }}
            onClick={handleClose}
          />

          <div
            ref={drawerRef}
            className={`fixed z-50 bg-white shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
              isKeyboardOpen
                ? 'inset-0 rounded-none'
                : 'bottom-36 right-4 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[75vh] rounded-3xl'
            } ${
              isAnimating
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 translate-y-4 scale-95'
            }`}
            style={{
              boxShadow: isKeyboardOpen ? 'none' : '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 via-red-500 to-orange-500 text-white px-5 py-4 flex items-center gap-3 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white rounded-full" />
                <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-white rounded-full" />
              </div>

              <div className="relative z-10 flex items-center gap-3 flex-1">
                {!effectiveShowList && currentConversation && (
                  <button
                    onClick={handleBack}
                    className="p-2 -ml-2 hover:bg-white/20 rounded-xl transition-all duration-200 active:scale-90"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}

                <div className="flex-1 min-w-0">
                  {effectiveShowList ? (
                    <div>
                      <h3 className="font-bold text-lg">Билдирүүлөр</h3>
                      <p className="text-white/70 text-xs">Дүкөндөр менен байланыш</p>
                    </div>
                  ) : currentConversation?.shop ? (
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {currentConversation.shop.logo ? (
                          <Image
                            src={currentConversation.shop.logo}
                            alt={currentConversation.shop.name}
                            width={40}
                            height={40}
                            className="rounded-xl object-cover ring-2 ring-white/30"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <span className="text-lg">🏪</span>
                          </div>
                        )}
                        <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white transition-colors ${
                          isShopOnline ? 'bg-green-400' : 'bg-gray-400'
                        }`} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{currentConversation.shop.name}</p>
                        <p className="text-xs text-white/70 flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${isShopOnline ? 'bg-green-400' : 'bg-gray-400'}`} />
                          {isShopOnline ? 'Онлайн' : 'Офлайн'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <h3 className="font-bold text-lg">Чат</h3>
                  )}
                </div>
              </div>

              <button
                onClick={handleClose}
                className="relative z-10 p-2 hover:bg-white/20 rounded-xl transition-all duration-200 active:scale-90"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden bg-gray-50">
              {effectiveShowList ? (
                /* Conversations List */
                <div className="h-full overflow-y-auto">
                  {conversationsLoading ? (
                    /* Skeleton Loading */
                    <div className="divide-y divide-gray-100">
                      {[...Array(4)].map((_, i) => (
                        <ConversationSkeleton key={i} />
                      ))}
                    </div>
                  ) : conversations.length === 0 ? (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mb-4 shadow-inner">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-1">Билдирүү жок</h4>
                      <p className="text-sm text-gray-500">Продукт бетинен дүкөнгө жазыңыз</p>
                    </div>
                  ) : (
                    /* Conversations */
                    <div className="divide-y divide-gray-100">
                      {conversations.map((conv, index) => {
                        const shopOnline = conv.shop?.owner_id ? onlineUsers.has(conv.shop.owner_id) : false;

                        return (
                          <button
                            key={conv.id}
                            onClick={() => {
                              setShowList(false);
                              openConversation(conv.id);
                            }}
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white text-left transition-all duration-200 group"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <div className="relative flex-shrink-0">
                              {conv.shop?.logo ? (
                                <Image
                                  src={conv.shop.logo}
                                  alt={conv.shop.name}
                                  width={52}
                                  height={52}
                                  className="rounded-2xl object-cover ring-2 ring-gray-100 group-hover:ring-red-100 transition-all"
                                />
                              ) : (
                                <div className="w-13 h-13 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center">
                                  <span className="text-2xl">🏪</span>
                                </div>
                              )}
                              <span className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white shadow-sm transition-colors ${
                                shopOnline ? 'bg-green-500' : 'bg-gray-400'
                              }`} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-0.5">
                                <p className="font-semibold text-gray-900 truncate group-hover:text-red-600 transition-colors">
                                  {conv.shop?.name || 'Дүкөн'}
                                </p>
                                {conv.last_message_at && (
                                  <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                                    {formatTime(conv.last_message_at)}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 truncate">
                                {conv.last_message || 'Жаңы сүйлөшүү баштаңыз'}
                              </p>
                            </div>

                            {conv.unread_count > 0 && (
                              <span className="w-6 h-6 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                {conv.unread_count > 9 ? '9+' : conv.unread_count}
                              </span>
                            )}

                            <svg className="w-5 h-5 text-gray-300 group-hover:text-red-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* Messages View */
                <div className="h-full flex flex-col">
                  <div
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-3"
                    style={{
                      paddingBottom: isKeyboardOpen ? '100px' : undefined,
                    }}
                  >
                    {loading ? (
                      /* Message Skeletons */
                      <div className="space-y-3">
                        <MessageSkeleton isMe={false} />
                        <MessageSkeleton isMe={true} />
                        <MessageSkeleton isMe={false} />
                        <MessageSkeleton isMe={true} />
                      </div>
                    ) : messages.length === 0 ? (
                      /* Empty Chat */
                      <div className="flex flex-col items-center justify-center h-full text-center px-6">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4">
                          <span className="text-3xl">👋</span>
                        </div>
                        <h4 className="font-semibold text-gray-800 mb-1">Саламатсызбы!</h4>
                        <p className="text-sm text-gray-500">Биринчи билдирүү жазыңыз</p>
                      </div>
                    ) : (
                      <>
                        {/* Load More Trigger - жогору скролл кылганда */}
                        {pagination?.hasMore && (
                          <div ref={loadMoreTriggerRef} className="h-1">
                            {loadingMore && <LoadingMoreSkeleton />}
                          </div>
                        )}

                        {messages.map((msg, index) => {
                          const isMe = msg.sender_id === user?.id;
                          const showAvatar = !isMe && (index === 0 || messages[index - 1]?.sender_id === user?.id);
                          const replyData = msg.metadata?.reply_to || msg.reply_to;
                          const isSelected = selectedMessageId === msg.id;

                          return (
                            <div
                              key={msg.id}
                              className={`relative py-0.5 -mx-2 px-2 rounded-xl transition-colors duration-200 ${
                                isSelected ? 'bg-blue-100/70' : ''
                              }`}
                            >
                              <div
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                                style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
                              >
                              {!isMe && showAvatar && (
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center mr-2 flex-shrink-0">
                                  <span className="text-sm">🏪</span>
                                </div>
                              )}
                              {!isMe && !showAvatar && <div className="w-10" />}

                              <div
                                data-message-id={msg.id}
                                className={`max-w-[75%] shadow-sm select-none transition-all duration-300 ${
                                  isMe
                                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl rounded-br-md'
                                    : 'bg-white text-gray-800 rounded-2xl rounded-bl-md'
                                } ${['image', 'video', 'gif', 'sticker'].includes(msg.message_type) ? 'p-1.5' : 'px-4 py-2.5'}`}
                                onContextMenu={handleContextMenu(msg)}
                                onTouchStart={handleTouchStart(msg)}
                                onTouchEnd={handleTouchEnd}
                                onTouchMove={handleTouchEnd}
                              >
                                {/* Reply Preview - clickable to scroll */}
                                {replyData && (
                                  <div
                                    className={`mb-2 pl-2 border-l-2 cursor-pointer hover:opacity-80 transition-opacity ${isMe ? 'border-white/50' : 'border-red-300'}`}
                                    onClick={() => scrollToMessage(replyData.id)}
                                  >
                                    <p className={`text-[10px] ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                                      {replyData.sender_id === user?.id ? 'Сиз' : 'Дүкөн'}
                                    </p>
                                    <p className={`text-xs truncate ${isMe ? 'text-white/80' : 'text-gray-500'}`}>
                                      {replyData.message}
                                    </p>
                                  </div>
                                )}
                                {/* Сүрөт */}
                                {msg.message_type === 'image' && msg.metadata?.url && (
                                  <a href={msg.metadata.url} target="_blank" rel="noopener noreferrer">
                                    <img
                                      src={msg.metadata.url}
                                      alt="Сүрөт"
                                      className="max-w-full rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                                      style={{ maxHeight: '200px' }}
                                      loading="lazy"
                                    />
                                  </a>
                                )}

                                {/* Видео */}
                                {msg.message_type === 'video' && msg.metadata?.url && (
                                  <video
                                    src={msg.metadata.url}
                                    controls
                                    className="max-w-full rounded-xl"
                                    style={{ maxHeight: '200px' }}
                                  />
                                )}

                                {/* GIF */}
                                {msg.message_type === 'gif' && msg.metadata?.url && (
                                  <img
                                    src={msg.metadata.url}
                                    alt="GIF"
                                    className="max-w-full rounded-xl"
                                    style={{ maxHeight: '180px' }}
                                    loading="lazy"
                                  />
                                )}

                                {/* Стикер */}
                                {msg.message_type === 'sticker' && msg.metadata?.url && (
                                  <img
                                    src={msg.metadata.url}
                                    alt="Стикер"
                                    className="max-w-full"
                                    style={{ maxHeight: '120px' }}
                                    loading="lazy"
                                  />
                                )}

                                {/* Текст билдирүү */}
                                {!['image', 'video', 'gif', 'sticker'].includes(msg.message_type) && (
                                  <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{msg.message}</p>
                                )}

                                <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : ''} ${
                                  ['image', 'video', 'gif', 'sticker'].includes(msg.message_type) ? 'px-2 pb-1' : ''
                                }`}>
                                  {msg.is_edited && (
                                    <span className={`text-[10px] ${isMe ? 'text-white/50' : 'text-gray-400'}`}>
                                      түзөт.
                                    </span>
                                  )}
                                  <span className={`text-[10px] ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                                    {formatTime(msg.created_at)}
                                  </span>
                                  {isMe && (
                                    <span className="ml-0.5">
                                      {msg.is_read ? (
                                        <svg className="w-3.5 h-3.5 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z" />
                                        </svg>
                                      ) : (
                                        <svg className="w-3.5 h-3.5 text-white/50" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                        </svg>
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* Typing Indicator */}
                        {isTyping && (
                          <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center mr-2">
                              <span className="text-sm">🏪</span>
                            </div>
                            <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '0.6s' }} />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms', animationDuration: '0.6s' }} />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms', animationDuration: '0.6s' }} />
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Action Menu */}
                  {actionMenuMessage && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="absolute inset-0 z-40 bg-black/10"
                        onClick={closeActionMenu}
                      />
                      {/* Menu */}
                      <div
                        className="absolute z-50 animate-in fade-in zoom-in-95 duration-150"
                        style={{
                          left: `${actionMenuPosition.x}px`,
                          top: `${actionMenuPosition.y}px`,
                          transform: 'translate(-50%, -100%)',
                        }}
                      >
                        {/* Quick Reaction Emojis */}
                        <div className="bg-white rounded-full shadow-xl px-2 py-1.5 mb-2 flex items-center gap-0.5">
                          {quickReactions.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => handleQuickReaction(emoji)}
                              className="w-9 h-9 flex items-center justify-center text-xl hover:scale-125 hover:bg-gray-100 rounded-full transition-all duration-150 active:scale-95"
                            >
                              {emoji}
                            </button>
                          ))}
                          {/* More emojis button */}
                          <button
                            onClick={() => {
                              closeActionMenu();
                              setShowEmojiPicker(true);
                            }}
                            className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                          >
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                        </div>

                        {/* Action Menu */}
                        <div className="bg-white rounded-2xl shadow-xl py-1.5 min-w-[180px]">
                          <button
                            onClick={handleReply}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                          >
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                            Жооп берүү
                          </button>

                          <button
                            onClick={handleCopy}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                          >
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Көчүрүү
                          </button>

                          {/* Edit & Delete - only for own messages */}
                          {actionMenuMessage.sender_id === user?.id && (
                            <>
                              {actionMenuMessage.message_type === 'text' && (
                                <button
                                  onClick={handleEdit}
                                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                >
                                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Түзөтүү
                                </button>
                              )}

                              <div className="border-t border-gray-100 my-1" />

                              <button
                                onClick={handleDelete}
                                className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Өчүрүү
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Input Area - клавиатура ачылганда 10px жогорураак турат */}
                  <div
                    ref={inputContainerRef}
                    className={`bg-white border-t border-gray-100 p-3 transition-all duration-150 ${
                      isKeyboardOpen ? 'fixed left-0 right-0 z-[60]' : ''
                    }`}
                    style={{
                      bottom: isKeyboardOpen ? `${keyboardOffset + 10}px` : undefined,
                    }}
                  >
                    {/* Reply Preview Bar */}
                    {replyingTo && (
                      <div className="mb-2 flex items-center gap-2 p-2 bg-gray-50 rounded-xl animate-in slide-in-from-bottom-2 duration-200">
                        <div className="flex-1 pl-2 border-l-2 border-red-400">
                          <p className="text-xs text-gray-400">
                            {replyingTo.sender_id === user?.id ? 'Өзүңүзгө жооп' : 'Дүкөнгө жооп'}
                          </p>
                          <p className="text-sm text-gray-600 truncate">{replyingTo.message}</p>
                        </div>
                        <button
                          onClick={cancelReply}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}

                    {/* Edit Mode Bar */}
                    {editingMessage && (
                      <div className="mb-2 flex items-center gap-2 p-2 bg-blue-50 rounded-xl animate-in slide-in-from-bottom-2 duration-200">
                        <div className="flex-1 pl-2 border-l-2 border-blue-400">
                          <p className="text-xs text-blue-500 font-medium">Түзөтүү режими</p>
                          <p className="text-sm text-gray-600 truncate">{editingMessage.message}</p>
                        </div>
                        <button
                          onClick={cancelEdit}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}

                    {/* Media Preview */}
                    {mediaPreview && (
                      <div className="mb-3 relative">
                        <div className="bg-gray-100 rounded-xl p-2 relative inline-block">
                          {mediaPreview.type === 'image' ? (
                            <img
                              src={mediaPreview.url}
                              alt="Preview"
                              className="max-h-32 rounded-lg object-cover"
                            />
                          ) : (
                            <video
                              src={mediaPreview.url}
                              className="max-h-32 rounded-lg"
                              controls
                            />
                          )}
                          <button
                            onClick={cancelMediaPreview}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <button
                          onClick={handleSendMedia}
                          disabled={uploadingMedia}
                          className="ml-2 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50"
                        >
                          {uploadingMedia ? (
                            <span className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Жүктөлүүдө...
                            </span>
                          ) : (
                            'Жөнөтүү'
                          )}
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {/* File Upload Button */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={sending || uploadingMedia}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-red-500 transition-all disabled:opacity-50"
                        title="Сүрөт/видео жүктөө"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>

                      <div className="flex-1 relative">
                        <input
                          ref={inputRef}
                          type="text"
                          value={inputMessage}
                          onChange={handleInputChange}
                          onKeyPress={handleKeyPress}
                          placeholder={editingMessage ? "Билдирүүнү түзөтүңүз..." : replyingTo ? "Жооп жазыңыз..." : "Билдирүү жазыңыз..."}
                          className={`w-full rounded-2xl px-4 py-3 text-sm outline-none transition-all duration-200 pr-12 ${
                            editingMessage
                              ? 'bg-blue-50 focus:ring-2 focus:ring-blue-500/30 focus:bg-white'
                              : 'bg-gray-100 focus:ring-2 focus:ring-red-500/30 focus:bg-white'
                          }`}
                          disabled={sending || uploadingMedia}
                        />
                        {/* Emoji Button */}
                        <button
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 transition-colors ${
                            showEmojiPicker ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>

                        {/* Media Picker (Emoji, GIF, Sticker) */}
                        {showEmojiPicker && (
                          <MediaPicker
                            onSelectEmoji={handleEmojiSelect}
                            onSelectGif={handleGifSelect}
                            onSelectSticker={handleStickerSelect}
                            onClose={() => setShowEmojiPicker(false)}
                          />
                        )}
                      </div>

                      <button
                        onClick={handleSend}
                        disabled={!inputMessage.trim() || sending || uploadingMedia}
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                          inputMessage.trim() && !sending && !uploadingMedia
                            ? editingMessage
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                              : 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        {sending ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : editingMessage ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 rotate-45" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}