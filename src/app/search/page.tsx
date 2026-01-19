'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { livestock, categories } from '@/data/products';
import { useCart } from '@/context/CartContext';

const ITEMS_PER_PAGE = 20;

const popularSearches = [
  'Арашан кой', 'Гисар кой', 'Араб ат', 'Акылтек', 'Симментал', 'Алабай', 'Той куш', 'Музоо'
];

const regions = [
  'Бишкек', 'Ош', 'Чүй', 'Нарын', 'Ысык-Көл', 'Талас', 'Жалал-Абад', 'Баткен'
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [sortBy, setSortBy] = useState<'relevant' | 'price-low' | 'price-high' | 'popular'>('relevant');
  const [hasSearched, setHasSearched] = useState(false);
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { totalItems, setIsCartOpen } = useCart();

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('searchHistory');
    if (saved) {
      setSearchHistory(JSON.parse(saved));
    }
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  // Save search to history
  const saveToHistory = (term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...searchHistory.filter(h => h !== term)].slice(0, 10);
    setSearchHistory(updated);
    localStorage.setItem('searchHistory', JSON.stringify(updated));
  };

  // Clear history
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  // Handle search
  const handleSearch = (term: string) => {
    setQuery(term);
    if (term.trim()) {
      saveToHistory(term);
      setHasSearched(true);
    }
  };

  // Filter livestock
  const filteredLivestock = livestock.filter(item => {
    const matchesQuery = query.trim() === '' ||
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.breed.toLowerCase().includes(query.toLowerCase()) ||
      item.location.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = !selectedCategory || item.categoryId === selectedCategory;
    const matchesRegion = !selectedRegion || item.region === selectedRegion;
    const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];
    return matchesQuery && matchesCategory && matchesRegion && matchesPrice;
  });

  // Sort livestock
  const sortedLivestock = [...filteredLivestock].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'popular':
        return b.views - a.views;
      case 'relevant':
      default:
        // Relevance: prioritize exact matches and views
        const aRelevance = a.title.toLowerCase().startsWith(query.toLowerCase()) ? 1000 : 0;
        const bRelevance = b.title.toLowerCase().startsWith(query.toLowerCase()) ? 1000 : 0;
        return (bRelevance + b.views) - (aRelevance + a.views);
    }
  });

  // Displayed livestock (limited for infinite scroll)
  const displayedLivestock = sortedLivestock.slice(0, displayCount);
  const hasMore = displayCount < sortedLivestock.length;

  // Reset display count when filters/sort change
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [query, selectedCategory, selectedRegion, priceRange, sortBy]);

  // Load more function
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setTimeout(() => {
      setDisplayCount(prev => Math.min(prev + ITEMS_PER_PAGE, sortedLivestock.length));
      setIsLoading(false);
    }, 300);
  }, [isLoading, hasMore, sortedLivestock.length]);

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

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} млн`;
    }
    return price.toLocaleString('ru-RU');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Search */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white shadow-lg">
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
                placeholder="Мал издөө... (кой, ат, уй)"
                className="w-full py-2.5 pl-10 pr-4 rounded-full bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
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
              className="px-4 py-2 bg-white text-emerald-600 rounded-full text-sm font-bold"
            >
              Издөө
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-4 pb-24">
        {/* Before search - show history and suggestions */}
        {!hasSearched && !query && (
          <>
            {/* Search History */}
            {searchHistory.length > 0 && (
              <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-800">Издөө тарыхы</h3>
                  <button
                    onClick={clearHistory}
                    className="text-sm text-gray-500 hover:text-red-500"
                  >
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

            {/* Popular Searches */}
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
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {index < 3 && <span className="mr-1">{index + 1}</span>}
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Quick Access */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-3">Категориялар</h3>
              <div className="grid grid-cols-4 gap-3">
                {categories.slice(1).map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setHasSearched(true);
                    }}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-emerald-50 transition-colors"
                  >
                    <span className="text-3xl">{category.icon}</span>
                    <span className="text-xs text-gray-600 text-center">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Regions */}
            <div className="bg-white rounded-xl p-4 mt-4 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-xl">📍</span>
                Региондор боюнча
              </h3>
              <div className="flex flex-wrap gap-2">
                {regions.map((region) => (
                  <button
                    key={region}
                    onClick={() => {
                      setSelectedRegion(region);
                      setHasSearched(true);
                    }}
                    className="px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Search Results */}
        {(hasSearched || query) && (
          <>
            {/* Filters Bar */}
            <div className="bg-white rounded-xl p-3 mb-4 shadow-sm">
              <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                    showFilters || selectedCategory || selectedRegion
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Фильтр
                  {(selectedCategory || selectedRegion) && (
                    <span className="ml-1 w-2 h-2 bg-white rounded-full"></span>
                  )}
                </button>

                <div className="h-6 w-px bg-gray-200" />

                <button
                  onClick={() => setSortBy('relevant')}
                  className={`px-3 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                    sortBy === 'relevant' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Актуалдуу
                </button>
                <button
                  onClick={() => setSortBy('popular')}
                  className={`px-3 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                    sortBy === 'popular' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Популярдуу
                </button>
                <button
                  onClick={() => setSortBy('price-low')}
                  className={`px-3 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                    sortBy === 'price-low' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Арзан
                </button>
                <button
                  onClick={() => setSortBy('price-high')}
                  className={`px-3 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                    sortBy === 'price-high' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Кымбат
                </button>
              </div>

              {/* Expanded Filters */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                  {/* Category Filter */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Категория</h4>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                          !selectedCategory
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        Баары
                      </button>
                      {categories.slice(1).map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                            selectedCategory === cat.id
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {cat.icon} {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Region Filter */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Регион</h4>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedRegion(null)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                          !selectedRegion
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        Баары
                      </button>
                      {regions.map((region) => (
                        <button
                          key={region}
                          onClick={() => setSelectedRegion(region)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                            selectedRegion === region
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {region}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Баа диапазону (сом)</h4>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <input
                          type="number"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                          placeholder="Мин"
                          className="w-full px-3 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <span className="text-gray-400">—</span>
                      <div className="flex-1">
                        <input
                          type="number"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                          placeholder="Макс"
                          className="w-full px-3 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <button
                        onClick={() => setPriceRange([0, 10000000])}
                        className="px-3 py-2 text-sm text-gray-500 hover:text-emerald-600"
                      >
                        Сброс
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                {query && <span className="font-medium">&quot;{query}&quot;</span>}
                {selectedCategory && (
                  <span className="font-medium"> {categories.find(c => c.id === selectedCategory)?.name}</span>
                )}
                {selectedRegion && (
                  <span className="font-medium"> ({selectedRegion})</span>
                )} боюнча{' '}
                <span className="font-bold text-emerald-600">{sortedLivestock.length}</span> жарнама табылды
              </p>
            </div>

            {/* Products Grid */}
            {sortedLivestock.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {displayedLivestock.map((item, index) => (
                    <Link
                      key={item.id}
                      href={`/product/${item.id}`}
                      className="animate-fadeIn block"
                      style={{ animationDelay: `${Math.min(index, 20) * 30}ms` }}
                    >
                      <ProductCard product={item} />
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
                      {displayCount} / {sortedLivestock.length} көрсөтүлдү
                    </div>
                  )}
                  {!hasMore && sortedLivestock.length > 0 && (
                    <div className="text-gray-400 text-sm py-4">
                      Бардыгы жүктөлдү ({sortedLivestock.length})
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl p-8 text-center shadow-sm">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🐾</span>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Мал табылган жок</h3>
                <p className="text-gray-500 mb-4">
                  {query && <>&quot;{query}&quot; боюнча</>} эч нерсе табылган жок
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Сунуштар:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Башка сөздөрдү колдонуп көрүңүз</li>
                    <li>• Фильтрлерди алып салыңыз</li>
                    <li>• Категорияларды карап көрүңүз</li>
                  </ul>
                </div>
                <button
                  onClick={() => { setQuery(''); setHasSearched(false); setSelectedCategory(null); setSelectedRegion(null); }}
                  className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 transition-colors"
                >
                  Кайра издөө
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
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
            <div className="w-12 h-12 -mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 right-2 w-4 h-4 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
            <span className="text-xs">Тандалма</span>
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