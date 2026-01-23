'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import CategoryBar from '@/components/CategoryBar';
import ProductCard from '@/components/ProductCard';
import VideoFeed from '@/components/VideoFeed';
import VideoReelButton from '@/components/VideoReelButton';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { useCart } from '@/context/CartContext';
import { videos } from '@/data/products';

export default function Home() {
  const [showVideoFeed, setShowVideoFeed] = useState(false);
  const [initialVideoIndex, setInitialVideoIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState('1');
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { totalItems, setIsCartOpen } = useCart();

  // Use hooks for data fetching
  const { products, loading, hasMore, loadMore } = useProducts({
    category: activeCategory,
    limit: 20,
  });
  const { categories, loading: categoriesLoading } = useCategories();

  // Hot products (group buy or flash sale)
  const hotProducts = products.filter(item => item.isGroupBuy || item.isFlashSale).slice(0, 10);

  const handleVideoClick = (productId: string) => {
    const videoIndex = videos.findIndex(v => v.productId === productId);
    if (videoIndex !== -1) {
      setInitialVideoIndex(videoIndex);
      setShowVideoFeed(true);
    }
  };

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }
    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  return (
    <main className="min-h-screen bg-gray-100">
      <Header />
      <CategoryBar categories={categories} onCategoryChange={setActiveCategory} />

      {/* Desktop Container */}
      <div className="max-w-7xl mx-auto">
        {/* Hero Banner - Compact on mobile, larger on desktop */}
        <div className="px-1.5 py-1.5 md:px-4 md:py-3">
          <div className="relative h-28 md:h-40 lg:h-48 rounded-lg md:rounded-xl overflow-hidden bg-gradient-to-r from-orange-500 via-red-500 to-pink-500">
          <div className="absolute inset-0 flex items-center justify-between px-3 md:px-8">
            <div className="text-white">
              <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                <span className="px-1.5 py-0.5 md:px-3 md:py-1 bg-white/20 rounded text-[10px] md:text-sm font-medium">Жаңы</span>
                <span className="px-1.5 py-0.5 md:px-3 md:py-1 bg-yellow-400 text-yellow-900 rounded text-[10px] md:text-sm font-bold">FLASH</span>
              </div>
              <h2 className="text-lg md:text-2xl lg:text-3xl font-bold">50% чейин арзан!</h2>
              <p className="text-[10px] md:text-sm text-white/90">Бирге алуу · Акысыз жеткирүү</p>
            </div>
            <div className="text-5xl md:text-7xl lg:text-8xl opacity-90">🛍️</div>
          </div>
        </div>
      </div>

      {/* Trending - Compact */}
      <div className="px-1.5 py-1 md:px-4 md:py-3">
        <div className="flex items-center justify-between mb-1 md:mb-3">
          <h3 className="text-xs md:text-base font-bold text-gray-800 flex items-center gap-1 md:gap-2">
            <span>🔥</span> Популярдуу
          </h3>
          <Link href="/categories?sort=popular" className="text-orange-600 text-[10px] md:text-sm hover:underline">Баары →</Link>
        </div>

        <div className="flex gap-1 md:gap-3 overflow-x-auto pb-1 -mx-1.5 px-1.5 md:-mx-4 md:px-4 scrollbar-hide">
          {[...products]
            .sort((a, b) => ((b.views || 0) + (b.likes || 0) * 10) - ((a.views || 0) + (a.likes || 0) * 10))
            .slice(0, 12)
            .map((item) => (
              <Link key={item.id} href={`/product/${item.id}`} className="flex-shrink-0">
                <div className="w-16 md:w-20 lg:w-24 bg-white rounded-lg overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="relative w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24">
                    <Image src={item.images[0]} alt={item.title} fill className="object-cover" />
                    {item.originalPrice && (
                      <div className="absolute top-0 right-0 px-0.5 md:px-1 bg-red-500 text-white text-[8px] md:text-[10px] font-bold rounded-bl">
                        -{Math.round((1 - item.price / item.originalPrice) * 100)}%
                      </div>
                    )}
                  </div>
                  <div className="p-1 md:p-1.5 text-center">
                    <div className="text-[10px] md:text-xs font-bold text-red-600">¥{item.price >= 1000 ? `${(item.price / 1000).toFixed(0)}K` : item.price}</div>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>

      {/* Hot Deals - Compact */}
      {hotProducts.length > 0 && (
        <div className="px-1.5 py-1 md:px-4 md:py-3">
          <div className="flex items-center justify-between mb-1 md:mb-3">
            <h3 className="text-xs md:text-base font-bold text-gray-800 flex items-center gap-1 md:gap-2">
              <span>👥</span> Бирге алуу
              <span className="px-1 py-0.5 md:px-2 md:py-1 bg-orange-100 text-orange-700 text-[8px] md:text-xs font-bold rounded animate-pulse">HOT</span>
            </h3>
            <Link href="/categories?filter=deals" className="text-orange-600 text-[10px] md:text-sm hover:underline">Баары →</Link>
          </div>

          <div className="flex gap-1.5 md:gap-3 overflow-x-auto pb-1 -mx-1.5 px-1.5 md:-mx-4 md:px-4 scrollbar-hide">
            {hotProducts.slice(0, 6).map((item) => (
              <Link key={item.id} href={`/product/${item.id}`} className="flex-shrink-0 w-36 md:w-44 lg:w-48">
                <div className={`bg-gradient-to-br ${item.isGroupBuy ? 'from-orange-50 to-pink-50' : 'from-yellow-50 to-red-50'} rounded-lg p-1.5 md:p-2 border border-orange-100 hover:shadow-md transition-shadow`}>
                  <div className="relative h-24 md:h-32 lg:h-36 rounded overflow-hidden mb-1 md:mb-2">
                    <Image src={item.images[0]} alt={item.title} fill className="object-cover" />
                    {item.isGroupBuy && (
                      <div className="absolute top-0.5 left-0.5 md:top-1 md:left-1 px-1 py-0.5 md:px-2 md:py-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-[8px] md:text-xs font-bold rounded">
                        👥 БИРГЕ
                      </div>
                    )}
                    {item.isFlashSale && !item.isGroupBuy && (
                      <div className="absolute top-0.5 left-0.5 md:top-1 md:left-1 px-1 py-0.5 md:px-2 md:py-1 bg-gradient-to-r from-yellow-500 to-red-500 text-white text-[8px] md:text-xs font-bold rounded animate-pulse">
                        ⚡ FLASH
                      </div>
                    )}
                    {item.videoUrl && (
                      <button
                        onClick={(e) => { e.preventDefault(); handleVideoClick(item.id); }}
                        className="absolute bottom-0.5 right-0.5 md:bottom-1 md:right-1 w-6 h-6 md:w-8 md:h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white"
                      >
                        <svg className="w-3 h-3 md:w-4 md:h-4 text-red-500 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </button>
                    )}
                  </div>
                  <h4 className="text-[10px] md:text-sm font-medium text-gray-800 line-clamp-1">{item.title}</h4>
                  <div className="flex items-center justify-between mt-0.5 md:mt-1">
                    <span className="text-xs md:text-sm font-bold text-red-600">¥{item.isGroupBuy && item.groupBuyPrice ? item.groupBuyPrice.toLocaleString() : item.price.toLocaleString()}</span>
                    <span className="text-[8px] md:text-xs text-gray-400">{item.soldCount > 1000 ? `${(item.soldCount/1000).toFixed(1)}K` : item.soldCount}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All Products Grid - Compact */}
      <div className="px-1.5 pb-16 md:px-4 md:pb-8">
        <div className="flex items-center justify-between mb-1.5 md:mb-3 py-1 md:py-2 bg-white rounded md:rounded-lg px-2 md:px-4">
          <h3 className="text-xs md:text-base font-bold text-gray-800 flex items-center gap-1 md:gap-2">
            🛍️ {activeCategory === '1' ? 'Баары' : categories.find(c => c.id === activeCategory)?.name}
            <span className="text-[10px] md:text-sm font-normal text-gray-400">({products.length})</span>
          </h3>
          <div className="flex items-center gap-1 md:gap-2">
            <button className="px-2 py-0.5 md:px-4 md:py-1.5 text-[10px] md:text-sm bg-orange-500 text-white rounded md:rounded-lg hover:bg-orange-600 transition-colors">Баары</button>
            <button className="px-2 py-0.5 md:px-4 md:py-1.5 text-[10px] md:text-sm bg-white text-gray-600 rounded md:rounded-lg border border-gray-200 hover:border-orange-300 transition-colors">Жаңы</button>
            <button className="px-2 py-0.5 md:px-4 md:py-1.5 text-[10px] md:text-sm bg-white text-gray-600 rounded md:rounded-lg border border-gray-200 hover:border-orange-300 transition-colors">Арзан</button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-1 md:gap-3">
          {loading && products.length === 0 ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden border border-gray-100 animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-2 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))
          ) : (
            products.map((item, index) => (
              <div key={item.id} className="animate-fadeIn" style={{ animationDelay: `${Math.min(index, 20) * 30}ms` }}>
                <ProductCard
                  product={item}
                  onVideoClick={item.videoUrl ? (e) => { e?.preventDefault(); handleVideoClick(item.id); } : undefined}
                />
              </div>
            ))
          )}
        </div>

        {/* Infinite Scroll */}
        <div ref={loadMoreRef} className="flex flex-col items-center mt-2 md:mt-4 pb-2 md:pb-4">
          {loading && products.length > 0 && (
            <div className="flex items-center gap-2 py-2 md:py-4">
              <div className="w-4 h-4 md:w-6 md:h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-500 text-[10px] md:text-sm">Жүктөлүүдө...</span>
            </div>
          )}
          {hasMore && !loading && (
            <div className="text-gray-400 text-[10px] md:text-sm py-2">Дагы жүктөө...</div>
          )}
          {!hasMore && products.length > 0 && (
            <div className="text-gray-400 text-[10px] md:text-sm py-2">Баары жүктөлдү ({products.length})</div>
          )}
        </div>
      </div>
      </div>{/* End Desktop Container */}

      {/* Video Reel Button */}
      <VideoReelButton onClick={() => setShowVideoFeed(true)} videoCount={videos.length} />

      {/* Video Feed */}
      {showVideoFeed && (
        <VideoFeed videos={videos} onClose={() => setShowVideoFeed(false)} initialIndex={initialVideoIndex} />
      )}

      {/* Bottom Navigation - Compact */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-30">
        <div className="flex items-center justify-around py-1.5">
          <button className="flex flex-col items-center gap-0.5 text-orange-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            <span className="text-[10px] font-medium">Башкы</span>
          </button>
          <Link href="/categories" className="flex flex-col items-center gap-0.5 text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
            <span className="text-[10px]">Категория</span>
          </Link>
          <button onClick={() => setShowVideoFeed(true)} className="flex flex-col items-center gap-0.5 text-gray-500 relative">
            <div className="w-10 h-10 -mt-5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
            <span className="text-[10px]">Видео</span>
          </button>
          <button onClick={() => setIsCartOpen(true)} className="flex flex-col items-center gap-0.5 text-gray-500 relative">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 right-1 w-4 h-4 bg-orange-600 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
            <span className="text-[10px]">Себет</span>
          </button>
          <Link href="/profile" className="flex flex-col items-center gap-0.5 text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            <span className="text-[10px]">Профиль</span>
          </Link>
        </div>
      </nav>
    </main>
  );
}