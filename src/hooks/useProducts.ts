'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { transformProduct, transformProducts, transformCategories } from '@/lib/transformers';
import type { Product, Category } from '@/data/types';

interface UseProductsOptions {
  category?: string;
  search?: string;
  limit?: number;
  groupBuy?: boolean;
  flashSale?: boolean;
}

export function useProducts(options: UseProductsOptions = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const { category, search, limit = 20, groupBuy, flashSale } = options;

  const fetchProducts = useCallback(async (pageNum: number, append = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: limit.toString(),
      });

      if (category && category !== '1') params.set('category', category);
      if (search) params.set('search', search);
      if (groupBuy) params.set('groupBuy', 'true');
      if (flashSale) params.set('flashSale', 'true');

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch products');
      }

      const apiProducts = data.products || [];
      const transformedProducts = transformProducts(apiProducts);

      if (append) {
        setProducts(prev => [...prev, ...transformedProducts]);
      } else {
        setProducts(transformedProducts);
      }

      setHasMore(pageNum < data.pagination?.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [category, search, limit, groupBuy, flashSale]);

  useEffect(() => {
    setPage(1);
    fetchProducts(1, false);
  }, [fetchProducts]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage, true);
    }
  }, [loading, hasMore, page, fetchProducts]);

  const refetch = useCallback(() => {
    setPage(1);
    fetchProducts(1, false);
  }, [fetchProducts]);

  return { products, loading, error, hasMore, loadMore, refetch };
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/products/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Product not found');
        }

        setProduct(transformProduct(data));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProduct();
    }
  }, [id]);

  return { product, loading, error };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('sort_order');

        if (error) throw error;

        // Add "All" category at the beginning
        const allCategory: Category = {
          id: '1',
          name: 'Баары',
          icon: '🏠',
          color: '#f97316',
        };

        const transformedCategories = transformCategories(data || []);
        setCategories([allCategory, ...transformedCategories]);
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Fallback to default categories
        setCategories([
          { id: '1', name: 'Баары', icon: '🏠', color: '#f97316' },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return { categories, loading };
}