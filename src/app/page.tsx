'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import CategoryBar from '@/components/CategoryBar';
import ProductCard from '@/components/ProductCard';
import VideoFeed from '@/components/VideoFeed';
import VideoReelButton from '@/components/VideoReelButton';
import { livestock, categories, videos } from '@/data/products';
import { useCart } from '@/context/CartContext';

const ITEMS_PER_PAGE = 20;

export default function Home() {
  const [showVideoFeed, setShowVideoFeed] = useState(false);
  const [initialVideoIndex, setInitialVideoIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState('1');
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { totalItems, setIsCartOpen } = useCart();

  const handleVideoClick = (livestockId: string) => {
    const videoIndex = videos.findIndex(v => v.livestockId === livestockId);
    if (videoIndex !== -1) {
      setInitialVideoIndex(videoIndex);
      setShowVideoFeed(true);
    }
  };

  // Filter by category
  const filteredLivestock = activeCategory === '1'
    ? livestock
    : livestock.filter(item => item.categoryId === activeCategory);

  // Premium livestock
  const premiumLivestock = livestock.filter(item => item.isPremium);

  // Displayed items (limited for infinite scroll)
  const displayedLivestock = filteredLivestock.slice(0, displayCount);
  const hasMore = displayCount < filteredLivestock.length;

  // Reset display count when category changes
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [activeCategory]);

  // Load more function
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    // Simulate loading delay for smooth UX
    setTimeout(() => {
      setDisplayCount(prev => Math.min(prev + ITEMS_PER_PAGE, filteredLivestock.length));
      setIsLoading(false);
    }, 300);
  }, [isLoading, hasMore, filteredLivestock.length]);

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

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />
      <CategoryBar categories={categories} onCategoryChange={setActiveCategory} />

      {/* Hero Banner */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="relative h-44 md:h-64 rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 shadow-xl">
          <div className="absolute inset-0 flex items-center justify-between px-6 md:px-10">
            <div className="text-white max-w-md">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                  Жаңы
                </span>
                <span className="px-3 py-1 bg-amber-400 text-amber-900 rounded-full text-sm font-bold">
                  Элита
                </span>
              </div>
              <h2 className="text-2xl md:text-4xl font-bold mb-2">Премиум малдар</h2>
              <p className="text-sm md:text-lg text-white/90 mb-4">Арашан, Гисар койлор жана пародистый аттар</p>
              <Link
                href="/categories"
                className="inline-block px-6 py-2.5 bg-white text-emerald-600 font-bold rounded-full hover:bg-gray-100 transition-colors shadow-lg"
              >
                Баарын көрүү
              </Link>
            </div>
            <div className="text-7xl md:text-9xl opacity-90">
              🐴
            </div>
          </div>
          {/* Decorative */}
          <div className="absolute top-4 right-32 w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-4 left-20 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </div>
      </div>

      {/* 🔥 Trending/Popular Products - Pinduoduo Style */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
            <span className="text-lg">🔥</span>
            Эң көп каралган
          </h3>
          <Link href="/categories?sort=popular" className="text-emerald-600 text-xs font-medium">
            Баары →
          </Link>
        </div>

        {/* Horizontal Scroll of Mini Product Cards */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {[...livestock]
            .sort((a, b) => (b.views + b.likes * 10) - (a.views + a.likes * 10))
            .slice(0, 15)
            .map((item) => (
              <Link
                key={item.id}
                href={`/product/${item.id}`}
                className="flex-shrink-0 group"
              >
                <div className="w-20 bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:border-red-300 hover:shadow-md transition-all">
                  {/* Mini Image */}
                  <div className="relative w-20 h-20">
                    <Image
                      src={item.images[0]}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                    {/* Hot badge for top 5 */}
                    {[...livestock].sort((a, b) => (b.views + b.likes * 10) - (a.views + a.likes * 10)).slice(0, 5).includes(item) && (
                      <div className="absolute top-0.5 left-0.5 px-1 py-0.5 bg-red-500 text-white text-[8px] font-bold rounded">
                        ХИТ
                      </div>
                    )}
                    {/* Discount badge */}
                    {item.originalPrice && (
                      <div className="absolute top-0.5 right-0.5 px-1 py-0.5 bg-orange-500 text-white text-[8px] font-bold rounded">
                        -{Math.round((1 - item.price / item.originalPrice) * 100)}%
                      </div>
                    )}
                  </div>
                  {/* Price */}
                  <div className="p-1.5 text-center">
                    <div className="text-xs font-bold text-red-600 truncate">
                      {item.price >= 1000000
                        ? `${(item.price / 1000000).toFixed(1)}M`
                        : item.price >= 1000
                          ? `${Math.round(item.price / 1000)}K`
                          : item.price
                      }
                      <span className="text-[9px] text-gray-400 font-normal"> с</span>
                    </div>
                    {item.originalPrice && (
                      <div className="text-[9px] text-gray-400 line-through">
                        {item.originalPrice >= 1000 ? `${Math.round(item.originalPrice / 1000)}K` : item.originalPrice}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>

      {/* Premium Section */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="text-2xl">👑</span>
              Премиум малдар
            </h3>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
              ТОП {premiumLivestock.length}
            </span>
          </div>
          <Link href="/categories?filter=premium" className="text-emerald-600 text-sm font-medium hover:underline">
            Баарын көрүү →
          </Link>
        </div>

        {/* Premium Horizontal Scroll */}
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          {premiumLivestock.map((item) => (
            <Link
              key={item.id}
              href={`/product/${item.id}`}
              className="flex-shrink-0 w-72"
            >
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-4 border-2 border-amber-200 hover:border-amber-400 transition-all hover:shadow-lg">
                <div className="relative h-40 rounded-xl overflow-hidden mb-3">
                  <Image
                    src={item.images[0]}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-white text-xs font-bold rounded-full flex items-center gap-1">
                    <span>👑</span> ПРЕМИУМ
                  </div>
                  {item.videoUrl && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleVideoClick(item.id);
                      }}
                      className="absolute bottom-2 right-2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <svg className="w-5 h-5 text-red-500 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                    {item.breed}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    item.gender === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
                  }`}>
                    {item.gender === 'male' ? '♂' : '♀'}
                  </span>
                </div>
                <h4 className="font-semibold text-gray-800 line-clamp-1 mb-2">{item.title}</h4>
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-gray-900">
                    {item.price >= 1000000
                      ? `${(item.price / 1000000).toFixed(1)} млн`
                      : item.price.toLocaleString('ru-RU')
                    } <span className="text-xs font-normal text-gray-500">сом</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    <span className="text-sm font-bold">{item.rating}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* All Livestock Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-24">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            {activeCategory === '1' ? 'Бардык жарнамалар' : categories.find(c => c.id === activeCategory)?.name}
            <span className="text-sm font-normal text-gray-500">({filteredLivestock.length})</span>
          </h3>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-full">
              Баары
            </button>
            <button className="px-3 py-1.5 text-sm bg-white text-gray-600 rounded-full hover:bg-gray-100 border border-gray-200">
              Видео
            </button>
            <button className="px-3 py-1.5 text-sm bg-white text-gray-600 rounded-full hover:bg-gray-100 border border-gray-200">
              Жаңы
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3">
          {displayedLivestock.map((item, index) => (
            <div
              key={item.id}
              className="animate-fadeIn"
              style={{ animationDelay: `${Math.min(index, 20) * 30}ms` }}
            >
              <ProductCard
                product={item}
                onVideoClick={item.videoUrl ? (e) => {
                  e?.preventDefault();
                  handleVideoClick(item.id);
                } : undefined}
              />
            </div>
          ))}
        </div>

        {/* Infinite Scroll Trigger & Loading */}
        <div ref={loadMoreRef} className="flex flex-col items-center mt-8 pb-4">
          {isLoading && (
            <div className="flex items-center gap-3 py-4">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-500 text-sm">Жүктөлүүдө...</span>
            </div>
          )}
          {hasMore && !isLoading && (
            <div className="text-gray-400 text-sm py-4">
              {displayCount} / {filteredLivestock.length} көрсөтүлдү
            </div>
          )}
          {!hasMore && filteredLivestock.length > 0 && (
            <div className="text-gray-400 text-sm py-4">
              Бардык жарнамалар жүктөлдү ({filteredLivestock.length})
            </div>
          )}
        </div>
      </div>

      {/* Video Reel Button */}
      <VideoReelButton onClick={() => setShowVideoFeed(true)} videoCount={videos.length} />

      {/* Video Feed */}
      {showVideoFeed && (
        <VideoFeed
          videos={videos}
          onClose={() => setShowVideoFeed(false)}
          initialIndex={initialVideoIndex}
        />
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-30">
        <div className="flex items-center justify-around py-2">
          <button className="flex flex-col items-center gap-0.5 text-emerald-600">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            <span className="text-xs font-medium">Башкы</span>
          </button>
          <Link href="/categories" className="flex flex-col items-center gap-0.5 text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            <span className="text-xs">Категория</span>
          </Link>
          <button
            onClick={() => setShowVideoFeed(true)}
            className="flex flex-col items-center gap-0.5 text-gray-500 relative"
          >
            <div className="w-12 h-12 -mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <span className="text-xs mt-1">Видео</span>
          </button>
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex flex-col items-center gap-0.5 text-gray-500 relative"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
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
    </main>
  );
}