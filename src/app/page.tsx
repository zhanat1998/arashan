'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import CategoryBar from '@/components/CategoryBar';
import ProductCard from '@/components/ProductCard';
import VideoFeed from '@/components/VideoFeed';
import VideoReelButton from '@/components/VideoReelButton';
import { products, categories, videos } from '@/data/products';
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

  const handleVideoClick = (productId: string) => {
    const videoIndex = videos.findIndex(v => v.productId === productId);
    if (videoIndex !== -1) {
      setInitialVideoIndex(videoIndex);
      setShowVideoFeed(true);
    }
  };

  // Filter by category
  const filteredProducts = activeCategory === '1'
    ? products
    : products.filter(item => item.categoryId === activeCategory);

  // Hot products (group buy or flash sale)
  const hotProducts = products.filter(item => item.isGroupBuy || item.isFlashSale).slice(0, 10);

  // Displayed items (limited for infinite scroll)
  const displayedProducts = filteredProducts.slice(0, displayCount);
  const hasMore = displayCount < filteredProducts.length;

  // Reset display count when category changes
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [activeCategory]);

  // Load more function
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setTimeout(() => {
      setDisplayCount(prev => Math.min(prev + ITEMS_PER_PAGE, filteredProducts.length));
      setIsLoading(false);
    }, 300);
  }, [isLoading, hasMore, filteredProducts.length]);

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
        <div className="relative h-44 md:h-64 rounded-3xl overflow-hidden bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 shadow-xl">
          <div className="absolute inset-0 flex items-center justify-between px-6 md:px-10">
            <div className="text-white max-w-md">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                  Жаңы
                </span>
                <span className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-sm font-bold">
                  FLASH SALE
                </span>
              </div>
              <h2 className="text-2xl md:text-4xl font-bold mb-2">Супер арзандатуу!</h2>
              <p className="text-sm md:text-lg text-white/90 mb-4">50%ка чейин арзандатуу • Бирге алуу</p>
              <Link
                href="/categories"
                className="inline-block px-6 py-2.5 bg-white text-orange-600 font-bold rounded-full hover:bg-gray-100 transition-colors shadow-lg"
              >
                Сатып алуу
              </Link>
            </div>
            <div className="text-7xl md:text-9xl opacity-90">
              🛍️
            </div>
          </div>
          <div className="absolute top-4 right-32 w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-4 left-20 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </div>
      </div>

      {/* 🔥 Trending/Popular Products */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
            <span className="text-lg">🔥</span>
            Эң көп каралган
          </h3>
          <Link href="/categories?sort=popular" className="text-orange-600 text-xs font-medium">
            Баары →
          </Link>
        </div>

        {/* Horizontal Scroll of Mini Product Cards */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {[...products]
            .sort((a, b) => (b.views + b.likes * 10) - (a.views + a.likes * 10))
            .slice(0, 15)
            .map((item) => (
              <Link
                key={item.id}
                href={`/product/${item.id}`}
                className="flex-shrink-0 group"
              >
                <div className="w-20 bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:border-orange-300 hover:shadow-md transition-all">
                  <div className="relative w-20 h-20">
                    <Image
                      src={item.images[0]}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                    {[...products].sort((a, b) => (b.views + b.likes * 10) - (a.views + a.likes * 10)).slice(0, 5).includes(item) && (
                      <div className="absolute top-0.5 left-0.5 px-1 py-0.5 bg-red-500 text-white text-[8px] font-bold rounded">
                        ХИТ
                      </div>
                    )}
                    {item.originalPrice && (
                      <div className="absolute top-0.5 right-0.5 px-1 py-0.5 bg-orange-500 text-white text-[8px] font-bold rounded">
                        -{Math.round((1 - item.price / item.originalPrice) * 100)}%
                      </div>
                    )}
                  </div>
                  <div className="p-1.5 text-center">
                    <div className="text-xs font-bold text-red-600 truncate">
                      ¥{item.price >= 1000 ? `${(item.price / 1000).toFixed(0)}K` : item.price}
                    </div>
                    {item.originalPrice && (
                      <div className="text-[9px] text-gray-400 line-through">
                        ¥{item.originalPrice >= 1000 ? `${Math.round(item.originalPrice / 1000)}K` : item.originalPrice}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>

      {/* Hot Deals Section - Group Buy & Flash Sales */}
      {hotProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="text-2xl">👥</span>
                Бирге алуу & Flash Sale
              </h3>
              <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded-full animate-pulse">
                🔥 HOT
              </span>
            </div>
            <Link href="/categories?filter=deals" className="text-orange-600 text-sm font-medium hover:underline">
              Баарын көрүү →
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            {hotProducts.map((item) => (
              <Link
                key={item.id}
                href={`/product/${item.id}`}
                className="flex-shrink-0 w-72"
              >
                <div className={`bg-gradient-to-br ${item.isGroupBuy ? 'from-orange-50 to-pink-50 border-orange-200' : 'from-yellow-50 to-red-50 border-yellow-200'} rounded-2xl p-4 border-2 hover:shadow-lg transition-all`}>
                  <div className="relative h-40 rounded-xl overflow-hidden mb-3">
                    <Image
                      src={item.images[0]}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                    {item.isGroupBuy && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                        <span>👥</span> БИРГЕ АЛУУ
                      </div>
                    )}
                    {item.isFlashSale && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-gradient-to-r from-yellow-500 to-red-500 text-white text-xs font-bold rounded-full flex items-center gap-1 animate-pulse">
                        <span>⚡</span> FLASH
                      </div>
                    )}
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
                    {item.brand && (
                      <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                        {item.brand}
                      </span>
                    )}
                    {item.hasFreeship && (
                      <span className="text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                        🚚 Акысыз
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-gray-800 line-clamp-1 mb-2">{item.title}</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold text-red-600">
                        ¥{item.isGroupBuy && item.groupBuyPrice ? item.groupBuyPrice.toLocaleString() : item.price.toLocaleString()}
                      </div>
                      {item.isGroupBuy && (
                        <div className="text-xs text-orange-600">{item.groupBuyMinPeople}+ адам керек</div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      Сатылды {item.soldCount.toLocaleString()}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All Products Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-24">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span className="text-2xl">🛍️</span>
            {activeCategory === '1' ? 'Бардык товарлар' : categories.find(c => c.id === activeCategory)?.name}
            <span className="text-sm font-normal text-gray-500">({filteredProducts.length})</span>
          </h3>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm bg-orange-500 text-white rounded-full">
              Баары
            </button>
            <button className="px-3 py-1.5 text-sm bg-white text-gray-600 rounded-full hover:bg-gray-100 border border-gray-200">
              Жаңы
            </button>
            <button className="px-3 py-1.5 text-sm bg-white text-gray-600 rounded-full hover:bg-gray-100 border border-gray-200">
              Арзан
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3">
          {displayedProducts.map((item, index) => (
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
              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-500 text-sm">Жүктөлүүдө...</span>
            </div>
          )}
          {hasMore && !isLoading && (
            <div className="text-gray-400 text-sm py-4">
              {displayCount} / {filteredProducts.length} көрсөтүлдү
            </div>
          )}
          {!hasMore && filteredProducts.length > 0 && (
            <div className="text-gray-400 text-sm py-4">
              Бардык товарлар жүктөлдү ({filteredProducts.length})
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
          <button className="flex flex-col items-center gap-0.5 text-orange-600">
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
            <div className="w-12 h-12 -mt-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
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
    </main>
  );
}