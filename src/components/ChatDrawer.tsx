'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';

export default function ChatDrawer() {
  const { user } = useAuth();
  const {
    conversations,
    currentConversation,
    messages,
    loading,
    sending,
    unreadTotal,
    openConversation,
    sendMessage,
    closeConversation,
  } = useChat();

  const [isOpen, setIsOpen] = useState(false);
  const [showList, setShowList] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Билдирүүлөргө автоматтык түшүү
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Сүйлөшүү ачылганда
  useEffect(() => {
    if (currentConversation) {
      setShowList(false);
    }
  }, [currentConversation]);

  const handleSend = async () => {
    if (!inputMessage.trim() || sending) return;

    const message = inputMessage;
    setInputMessage('');
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('ky-KG', { hour: '2-digit', minute: '2-digit' });
    }

    return date.toLocaleDateString('ky-KG', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleBack = () => {
    closeConversation();
    setShowList(true);
  };

  if (!user) return null;

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 bg-gradient-to-r from-red-500 to-orange-500 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {unreadTotal > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
                {unreadTotal > 9 ? '9+' : unreadTotal}
              </span>
            )}
          </>
        )}
      </button>

      {/* Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-36 right-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[70vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-3 flex items-center gap-3">
            {!showList && currentConversation && (
              <button onClick={handleBack} className="p-1 hover:bg-white/20 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div className="flex-1">
              {showList ? (
                <h3 className="font-bold">Билдирүүлөр</h3>
              ) : currentConversation?.shop ? (
                <div className="flex items-center gap-2">
                  {currentConversation.shop.logo ? (
                    <Image
                      src={currentConversation.shop.logo}
                      alt={currentConversation.shop.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-sm">🏪</span>
                    </div>
                  )}
                  <span className="font-medium">{currentConversation.shop.name}</span>
                </div>
              ) : (
                <h3 className="font-bold">Чат</h3>
              )}
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {showList ? (
              /* Conversations List */
              <div className="h-full overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <svg className="w-16 h-16 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-sm">Азырынча билдирүү жок</p>
                    <p className="text-xs text-gray-400 mt-1">Дүкөндөр менен сүйлөшүңүз</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {conversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => openConversation(conv.id)}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 text-left"
                      >
                        {conv.shop?.logo ? (
                          <Image
                            src={conv.shop.logo}
                            alt={conv.shop.name}
                            width={48}
                            height={48}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-xl">🏪</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm truncate">
                              {conv.shop?.name || 'Дүкөн'}
                            </p>
                            {conv.last_message_at && (
                              <span className="text-xs text-gray-400">
                                {formatTime(conv.last_message_at)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {conv.last_message || 'Жаңы сүйлөшүү'}
                          </p>
                        </div>
                        {conv.unread_count > 0 && (
                          <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            {conv.unread_count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Messages */
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <p className="text-sm">Билдирүү жок</p>
                      <p className="text-xs text-gray-400 mt-1">Биринчи болуп жазыңыз!</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.sender_id === user?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                              isMe
                                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-br-sm'
                                : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                            <p
                              className={`text-[10px] mt-1 ${
                                isMe ? 'text-white/70' : 'text-gray-400'
                              }`}
                            >
                              {formatTime(msg.created_at)}
                              {isMe && msg.is_read && ' ✓✓'}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t p-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Билдирүү жазыңыз..."
                    className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500/50"
                    disabled={sending}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputMessage.trim() || sending}
                    className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full flex items-center justify-center disabled:opacity-50 hover:scale-105 transition-transform"
                  >
                    {sending ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
