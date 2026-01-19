'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { products, categories } from '@/data/products';
import { useCart } from '@/context/CartContext';

const ITEMS_PER_PAGE = 20;

export default function CategoriesPage() {
  const [activeCategory, setActiveCategory] = useState('1');
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high' | 'newest'>('popular');
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { totalItems, setIsCartOpen } = useCart();

  // Filter products by category
  const filteredProducts = activeCategory === '1'
    ? products
    : products.filter(p => p.categoryId === activeCategory);

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'newest':
        return b.badges.some(badge => badge.type === 'new') ? 1 : -1;
      case 'popular':
      default:
        return b.views - a.views;
    }
  });

  // Displayed products (limited for infinite scroll)
  const displayedProducts = sortedProducts.slice(0, displayCount);
  const hasMore = displayCount < sortedProducts.length;

  // Reset display count when category or sort changes
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [activeCategory, sortBy]);

  // Load more function
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setTimeout(() => {
      setDisplayCount(prev => Math.min(prev + ITEMS_PER_PAGE, sortedProducts.length));
      setIsLoading(false);
    }, 300);
  }, [isLoading, hasMore, sortedProducts.length]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMore]);

  const activeCateg = categories.find(c => c.id === activeCategory);

  return (
    <div className="min-h-screen bg-[var(--pdd-gray)]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-gray-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Артка</span>
            </Link>
            <h1 className="text-lg font-bold text-gray-800">Категориялар</h1>
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative w-10 h-10 flex items-center justify-center"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--pdd-red)] text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Categories */}
        <aside className="w-24 md:w-32 bg-white min-h-[calc(100vh-60px)] sticky top-[60px] shadow-sm">
          <div className="py-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`w-full py-4 px-2 flex flex-col items-center gap-1 transition-all relative ${
                  activeCategory === category.id
                    ? 'bg-[var(--pdd-gray)]'
                    : 'hover:bg-gray-50'
                }`}
              >
                {activeCategory === category.id && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                    style={{ backgroundColor: category.color }}
                  />
                )}
                <span
                  className="text-2xl"
                  style={{
                    filter: activeCategory === category.id ? 'none' : 'grayscale(50%)',
                  }}
                >
                  {category.icon}
                </span>
                <span
                  className={`text-xs text-center leading-tight ${
                    activeCategory === category.id
                      ? 'font-bold'
                      : 'text-gray-600'
                  }`}
                  style={{
                    color: activeCategory === category.id ? category.color : undefined,
                  }}
                >
                  {category.name}
                </span>
                {/* Product count badge */}
                <span className="text-[10px] text-gray-400">
                  {category.id === '1'
                    ? products.length
                    : products.filter(p => p.categoryId === category.id).length}
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 pb-24">
          {/* Category Header */}
          <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{activeCateg?.icon}</span>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{activeCateg?.name}</h2>
                <p className="text-sm text-gray-500">{sortedProducts.length} товар</p>
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              <button
                onClick={() => setSortBy('popular')}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  sortBy === 'popular'
                    ? 'bg-[var(--pdd-red)] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Популярдуу
              </button>
              <button
                onClick={() => setSortBy('price-low')}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  sortBy === 'price-low'
                    ? 'bg-[var(--pdd-red)] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Арзан
              </button>
              <button
                onClick={() => setSortBy('price-high')}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  sortBy === 'price-high'
                    ? 'bg-[var(--pdd-red)] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Кымбат
              </button>
              <button
                onClick={() => setSortBy('newest')}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  sortBy === 'newest'
                    ? 'bg-[var(--pdd-red)] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Жаңы
              </button>
            </div>
          </div>

          {/* Products Grid */}
          {sortedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {displayedProducts.map((product, index) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="animate-fadeIn block"
                    style={{ animationDelay: `${Math.min(index, 20) * 50}ms` }}
                  >
                    <ProductCard product={product} />
                  </Link>
                ))}
              </div>

              {/* Infinite Scroll Trigger & Loading */}
              <div ref={loadMoreRef} className="flex flex-col items-center mt-6 pb-4">
                {isLoading && (
                  <div className="flex items-center gap-3 py-4">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-500 text-sm">Жүктөлүүдө...</span>
                  </div>
                )}
                {hasMore && !isLoading && (
                  <div className="text-gray-400 text-sm py-4">
                    {displayCount} / {sortedProducts.length} көрсөтүлдү
                  </div>
                )}
                {!hasMore && sortedProducts.length > 0 && (
                  <div className="text-gray-400 text-sm py-4">
                    Бардыгы жүктөлдү ({sortedProducts.length})
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Товар жок</h3>
              <p className="text-gray-500 mb-4">Бул категорияда азырынча товарлар жок</p>
              <button
                onClick={() => setActiveCategory('1')}
                className="px-6 py-2 bg-[var(--pdd-red)] text-white rounded-full font-medium hover:bg-[var(--pdd-red-dark)] transition-colors"
              >
                Баарын көрүү
              </button>
            </div>
          )}

          {/* Subcategories for some categories */}
          {activeCategory === '3' && (
            <div className="mt-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3">Подкатегориялар</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {[
                  { name: 'Телефондор', icon: '📱' },
                  { name: 'Ноутбуктар', icon: '💻' },
                  { name: 'Наушниктер', icon: '🎧' },
                  { name: 'Сааттар', icon: '⌚' },
                  { name: 'Камералар', icon: '📷' },
                  { name: 'Аксессуарлар', icon: '🔌' },
                ].map((sub) => (
                  <button
                    key={sub.name}
                    className="bg-white rounded-xl p-4 text-center hover:shadow-md transition-shadow"
                  >
                    <span className="text-2xl block mb-2">{sub.icon}</span>
                    <span className="text-xs text-gray-600">{sub.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeCategory === '2' && (
            <div className="mt-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3">Подкатегориялар</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {[
                  { name: 'Аялдар', icon: '👗' },
                  { name: 'Эркектер', icon: '👔' },
                  { name: 'Балдар', icon: '👶' },
                  { name: 'Бут кийим', icon: '👟' },
                  { name: 'Сумкалар', icon: '👜' },
                  { name: 'Аксессуарлар', icon: '💍' },
                ].map((sub) => (
                  <button
                    key={sub.name}
                    className="bg-white rounded-xl p-4 text-center hover:shadow-md transition-shadow"
                  >
                    <span className="text-2xl block mb-2">{sub.icon}</span>
                    <span className="text-xs text-gray-600">{sub.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="flex items-center justify-around py-2">
          <Link href="/" className="flex flex-col items-center gap-0.5 text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs">Башкы</span>
          </Link>
          <button className="flex flex-col items-center gap-0.5 text-[var(--pdd-red)]">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
            </svg>
            <span className="text-xs font-medium">Категория</span>
          </button>
          <Link href="/" className="flex flex-col items-center gap-0.5 text-gray-500 relative">
            <div className="w-12 h-12 -mt-6 bg-gradient-to-r from-[var(--pdd-red)] to-[var(--pdd-orange)] rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <span className="text-xs mt-1">Видео</span>
          </Link>
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex flex-col items-center gap-0.5 text-gray-500 relative"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 right-2 w-4 h-4 bg-[var(--pdd-red)] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
            <span className="text-xs">Корзина</span>
          </button>
          <Link href="/profile" className="flex flex-col items-center gap-0.5 text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs">Профиль</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}