'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Video } from '@/data/types';

interface UseReelsOptions {
  limit?: number;
}

export function useReels(options: UseReelsOptions = {}) {
  const [reels, setReels] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const { limit = 50 } = options;

  const fetchReels = useCallback(async (pageNum: number, append = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`/api/reels?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch reels');
      }

      const fetchedReels = data.reels || [];

      if (append) {
        setReels(prev => [...prev, ...fetchedReels]);
      } else {
        setReels(fetchedReels);
      }

      setHasMore(pageNum < (data.pagination?.totalPages || 1));
    } catch (err) {
      console.error('Error fetching reels:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchReels(1, false);
  }, [fetchReels]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchReels(nextPage, true);
    }
  }, [loading, hasMore, page, fetchReels]);

  const refetch = useCallback(() => {
    setPage(1);
    fetchReels(1, false);
  }, [fetchReels]);

  return { reels, loading, error, hasMore, loadMore, refetch };
}