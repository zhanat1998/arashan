'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';

interface WishlistItem {
  id: string;
  product_id: string;
  product: {
    id: string;
    title: string;
    price: number;
    original_price?: number;
    images: string[];
    rating: number;
    sold_count: number;
    shop?: {
      id: string;
      name: string;
    };
  };
  created_at: string;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  wishlistIds: Set<string>;
  loading: boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Fetch wishlist from API
  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlist([]);
      setWishlistIds(new Set());
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/wishlist');
      if (response.ok) {
        const data = await response.json();
        setWishlist(data.wishlist || []);
        const ids = new Set<string>(
          (data.wishlist || []).map((item: WishlistItem) => item.product?.id).filter(Boolean)
        );
        setWishlistIds(ids);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load wishlist when user changes
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const addToWishlist = async (productId: string) => {
    if (!user) {
      throw new Error('Кирүү керек');
    }

    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ката кетти');
      }

      // Update local state
      setWishlistIds(prev => new Set(prev).add(productId));
      await fetchWishlist(); // Refresh to get full product data
    } catch (error) {
      throw error;
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) {
      throw new Error('Кирүү керек');
    }

    try {
      const response = await fetch(`/api/wishlist?product_id=${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ката кетти');
      }

      // Update local state
      setWishlistIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
      setWishlist(prev => prev.filter(item => item.product?.id !== productId));
    } catch (error) {
      throw error;
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlistIds.has(productId);
  };

  const toggleWishlist = async (productId: string) => {
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  const refreshWishlist = async () => {
    await fetchWishlist();
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistIds,
        loading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
