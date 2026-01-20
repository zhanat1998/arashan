'use client';

import { useState, useEffect, useCallback } from 'react';

export interface FlashSale {
  id: string;
  product_id: string;
  sale_price: number;
  original_price: number;
  stock: number;
  sold_count: number;
  starts_at: string;
  ends_at: string;
  remainingTime: number;
  percentSold: number;
  remainingStock: number;
  product?: {
    id: string;
    title: string;
    images: string[];
    shop?: {
      id: string;
      name: string;
      logo?: string;
      is_verified: boolean;
    };
  };
}

export function useFlashSales(limit = 20) {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlashSales = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/flash-sale?limit=${limit}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);
      setFlashSales(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchFlashSales();

    // Update remaining time every second
    const interval = setInterval(() => {
      setFlashSales(prev => prev.map(sale => ({
        ...sale,
        remainingTime: Math.max(0, new Date(sale.ends_at).getTime() - Date.now())
      })));
    }, 1000);

    return () => clearInterval(interval);
  }, [fetchFlashSales]);

  const buyFlashSale = async (flashSaleId: string, quantity = 1) => {
    try {
      const response = await fetch(`/api/flash-sale/${flashSaleId}/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      await fetchFlashSales();
      return data;
    } catch (err) {
      throw err;
    }
  };

  return { flashSales, loading, error, buyFlashSale, refetch: fetchFlashSales };
}