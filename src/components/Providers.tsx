'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { ChatProvider } from '@/context/ChatContext';
import CartDrawer from '@/components/CartDrawer';
import ChatDrawer from '@/components/ChatDrawer';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <ChatProvider>
            {children}
            <CartDrawer />
            <ChatDrawer />
          </ChatProvider>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}