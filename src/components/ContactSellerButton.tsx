'use client';

import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { useRouter } from 'next/navigation';

interface ContactSellerButtonProps {
  shopId: string;
  shopName?: string;
  shopLogo?: string;
  className?: string;
  variant?: 'icon' | 'button' | 'full';
}

export default function ContactSellerButton({
  shopId,
  shopName,
  shopLogo,
  className = '',
  variant = 'button',
}: ContactSellerButtonProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { startConversation } = useChat();

  const handleContact = () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Чатты ачуу - билдирүү жөнөтүлбөйт, колдонуучу өзү жазат
    startConversation(shopId, undefined, {
      name: shopName || 'Дүкөн',
      logo: shopLogo,
    });
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleContact}
        className={`w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 active:scale-95 transition-all ${className}`}
        title="Сатуучуга жазуу"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    );
  }

  if (variant === 'full') {
    return (
      <button
        onClick={handleContact}
        className={`flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 active:scale-95 transition-all ${className}`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span>Сатуучуга жазуу</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleContact}
      className={`flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 border border-green-200 rounded-xl text-sm font-medium hover:bg-green-100 active:scale-95 transition-all ${className}`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <span>Жазуу</span>
    </button>
  );
}
