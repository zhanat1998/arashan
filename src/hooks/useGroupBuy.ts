'use client';

import { useState, useEffect, useCallback } from 'react';

export interface GroupBuy {
  id: string;
  product_id: string;
  initiator_id: string;
  current_people: number;
  required_people: number;
  group_price: number;
  status: 'active' | 'completed' | 'expired' | 'cancelled';
  expires_at: string;
  created_at: string;
  product?: {
    id: string;
    title: string;
    price: number;
    images: string[];
    shop?: {
      name: string;
      logo?: string;
    };
  };
  participants?: {
    user: {
      id: string;
      full_name?: string;
      avatar_url?: string;
    };
  }[];
}

export function useGroupBuys(productId?: string) {
  const [groupBuys, setGroupBuys] = useState<GroupBuy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroupBuys = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ status: 'active' });
      if (productId) params.set('productId', productId);

      const response = await fetch(`/api/group-buy?${params}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);
      setGroupBuys(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchGroupBuys();
  }, [fetchGroupBuys]);

  const startGroupBuy = async (productId: string) => {
    try {
      const response = await fetch('/api/group-buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      await fetchGroupBuys();
      return data;
    } catch (err) {
      throw err;
    }
  };

  const joinGroupBuy = async (groupBuyId: string) => {
    try {
      const response = await fetch(`/api/group-buy/${groupBuyId}/join`, {
        method: 'POST',
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      await fetchGroupBuys();
      return data;
    } catch (err) {
      throw err;
    }
  };

  return { groupBuys, loading, error, startGroupBuy, joinGroupBuy, refetch: fetchGroupBuys };
}