'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { products, categories } from '@/data/products';
import { useCart } from '@/context/CartContext';

const ITEMS_PER_PAGE = 20;

const popularSearches = [
  'iPhone', 'Nike', 'Samsung', 'Adidas', 'Xiaomi', 'Apple Watch', 'AirPods', 'PlayStation'
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200000]);
  const [sortBy, setSortBy] = useState<'relevant' | 'price-low' | 'price-high' | 'popular'>('relevant');
  const [hasSearched, setHasSearched] = useState(false);
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { totalItems, setIsCartOpen } = useCart();

  useEffect(() => {
    const saved = localStorage.getItem('searchHistory');
    if (saved) {
      setSearchHistory(JSON.parse(saved));
    }
    inputRef.current?.focus();
  }, []);

  const saveToHistory = (term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...searchHistory.filter(h => h !== term)].slice(0, 10);
    setSearchHistory(updated);
    localStorage.setItem('searchHistory', JSON.stringify(updated));
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const handleSearch = (term: string) => {
    setQuery(term);
    if (term.trim()) {
      saveToHistory(term);
      setHasSearched(true);
    }
  };

  // Filter products
  const filteredProducts = products.filter(item => {
    const matchesQuery = query.trim() === '' ||
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      (item.brand && item.brand.toLowerCase().includes(query.toLowerCase())) ||
      item.shop.name.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = !selectedCategory || item.categoryId === selectedCategory;
    const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];
    return matchesQuery && matchesCategory && matchesPrice;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'popular':
        return b.soldCount - a.soldCount;
      case 'relevant':
      default:
        const aRelevance = a.title.toLowerCase().startsWith(query.toLowerCase()) ? 1000 : 0;
        const bRelevance = b.title.toLowerCase().startsWith(query.toLowerCase()) ? 1000 : 0;
        return (bRelevance + b.soldCount) - (aRelevance + a.soldCount);
    }
  });

  const displayedProducts = sortedProducts.slice(0, displayCount);
  const hasMore = displayCount < sortedProducts.length;

  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [query, selectedCategory, priceRange, sortBy]);

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setTimeout(() => {
      setDisplayCount(prev => Math.min(prev + ITEMS_PER_PAGE, sortedProducts.length));
      setIsLoading(false);
    }, 300);
  }, [isLoading, hasMore, sortedProducts.length]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Search */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>

            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
                placeholder="Товар издөө..."
                className="w-full py-2.5 pl-10 pr-4 rounded-full bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {query && (
                <button
                  onClick={() => { setQuery(''); setHasSearched(false); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center"
                >
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <button
              onClick={() => handleSearch(query)}
              className="px-4 py-2 bg-white text-orange-600 rounded-full text-sm font-bold"
            >
              Издөө
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-2 md:px-4 py-4 pb-24 md:pb-8">
        {/* Before search */}
        {!hasSearched && !query && (
          <>
            {searchHistory.length > 0 && (
              <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-800">Издөө тарыхы</h3>
                  <button onClick={clearHistory} className="text-sm text-gray-500 hover:text-red-500">
                    Тазалоо
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(term)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-xl">🔥</span>
                Популярдуу издөөлөр
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((term, index) => (
                  <button
                    key={term}
                    onClick={() => handleSearch(term)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      index < 3
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {index < 3 && <span className="mr-1">{index + 1}</span>}
                    {term}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-3">Категориялар</h3>
              <div className="grid grid-cols-5 gap-3">
                {categories.slice(1).map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setHasSearched(true);
                    }}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-orange-50 transition-colors"
                  >
                    <span className="text-3xl">{category.icon}</span>
                    <span className="text-xs text-gray-600 text-center">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Search Results */}
        {(hasSearched || query) && (
          <>
            <div className="bg-white rounded-xl p-3 mb-4 shadow-sm">
              <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                    showFilters || selectedCategory
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Фильтр
                </button>

                <div className="h-6 w-px bg-gray-200" />

                {['relevant', 'popular', 'price-low', 'price-high'].map((sort) => (
                  <button
                    key={sort}
                    onClick={() => setSortBy(sort as any)}
                    className={`px-3 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                      sortBy === sort ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {sort === 'relevant' && 'Актуалдуу'}
                    {sort === 'popular' && 'Популярдуу'}
                    {sort === 'price-low' && 'Арзан'}
                    {sort === 'price-high' && 'Кымбат'}
                  </button>
                ))}
              </div>

              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Категория</h4>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                          !selectedCategory ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        Баары
                      </button>
                      {categories.slice(1).map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                            selectedCategory === cat.id ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {cat.icon} {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Баа диапазону</h4>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                        placeholder="Мин"
                        className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <span className="text-gray-400">—</span>
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                        placeholder="Макс"
                        className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <button
                        onClick={() => setPriceRange([0, 200000])}
                        className="px-3 py-2 text-sm text-gray-500 hover:text-orange-600"
                      >
                        Сброс
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                {query && <span className="font-medium">&quot;{query}&quot;</span>}
                {selectedCategory && (
                  <span className="font-medium"> {categories.find(c => c.id === selectedCategory)?.name}</span>
                )} боюнча{' '}
                <span className="font-bold text-orange-600">{sortedProducts.length}</span> товар табылды
              </p>
            </div>

            {sortedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 md:gap-3">
                  {displayedProducts.map((item, index) => (
                    <div
                      key={item.id}
                      className="animate-fadeIn"
                      style={{ animationDelay: `${Math.min(index, 20) * 30}ms` }}
                    >
                      <ProductCard product={item} />
                    </div>
                  ))}
                </div>

                <div ref={loadMoreRef} className="flex flex-col items-center mt-6 pb-4">
                  {isLoading && (
                    <div className="flex items-center gap-3 py-4">
                      <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
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
                  <span className="text-4xl">🛍️</span>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Товар табылган жок</h3>
                <p className="text-gray-500 mb-4">
                  {query && <>&quot;{query}&quot; боюнча</>} эч нерсе табылган жок
                </p>
                <button
                  onClick={() => { setQuery(''); setHasSearched(false); setSelectedCategory(null); }}
                  className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors"
                >
                  Кайра издөө
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Bottom Navigation - Mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 md:hidden">
        <div className="flex items-center justify-around py-2">
          <Link href="/" className="flex flex-col items-center gap-0.5 text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs">Башкы</span>
          </Link>
          <Link href="/categories" className="flex flex-col items-center gap-0.5 text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            <span className="text-xs">Категория</span>
          </Link>
          <Link href="/" className="flex flex-col items-center gap-0.5 text-gray-500 relative">
            <div className="w-12 h-12 -mt-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
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
              <span className="absolute -top-1 right-2 w-4 h-4 bg-orange-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
            <span className="text-xs">Себет</span>
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