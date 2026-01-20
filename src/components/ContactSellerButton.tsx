'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { useRouter } from 'next/navigation';

interface ContactSellerButtonProps {
  shopId: string;
  shopName?: string;
  productId?: string;
  productTitle?: string;
  className?: string;
  variant?: 'icon' | 'button' | 'full';
}

export default function ContactSellerButton({
  shopId,
  shopName,
  productId,
  productTitle,
  className = '',
  variant = 'button',
}: ContactSellerButtonProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { startConversation } = useChat();
  const [loading, setLoading] = useState(false);

  const handleContact = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    setLoading(true);
    try {
      // Товар жөнүндө билдирүү менен баштоо
      const initialMessage = productTitle
        ? `Саламатсызбы! "${productTitle}" товары жөнүндө сурагым бар.`
        : undefined;

      await startConversation(shopId, initialMessage);
    } catch (error) {
      console.error('Error starting conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleContact}
        disabled={loading}
        className={`w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors disabled:opacity-50 ${className}`}
        title="Сатуучуга жазуу"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>
    );
  }

  if (variant === 'full') {
    return (
      <button
        onClick={handleContact}
        disabled={loading}
        className={`flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors disabled:opacity-50 ${className}`}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Сатуучуга жазуу</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleContact}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 border border-green-200 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors disabled:opacity-50 ${className}`}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )}
      <span>Жазуу</span>
    </button>
  );
}
