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

  const filteredProducts = activeCategory === '1'
    ? products
    : products.filter(item => item.categoryId === activeCategory);

  const hotProducts = products.filter(item => item.isGroupBuy || item.isFlashSale).slice(0, 10);
  const displayedProducts = filteredProducts.slice(0, displayCount);
  const hasMore = displayCount < filteredProducts.length;

  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [activeCategory]);

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    setTimeout(() => {
      setDisplayCount(prev => Math.min(prev + ITEMS_PER_PAGE, filteredProducts.length));
      setIsLoading(false);
    }, 300);
  }, [isLoading, hasMore, filteredProducts.length]);

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
    <main className="min-h-screen bg-gray-100">
      <Header />
      <CategoryBar categories={categories} onCategoryChange={setActiveCategory} />

      {/* Hero Banner - Compact */}
      <div className="px-1.5 py-1.5">
        <div className="relative h-28 rounded-lg overflow-hidden bg-gradient-to-r from-orange-500 via-red-500 to-pink-500">
          <div className="absolute inset-0 flex items-center justify-between px-3">
            <div className="text-white">
              <div className="flex items-center gap-1 mb-1">
                <span className="px-1.5 py-0.5 bg-white/20 rounded text-[10px] font-medium">Жаңы</span>
                <span className="px-1.5 py-0.5 bg-yellow-400 text-yellow-900 rounded text-[10px] font-bold">FLASH</span>
              </div>
              <h2 className="text-lg font-bold">50% чейин арзан!</h2>
              <p className="text-[10px] text-white/90">Бирге алуу · Акысыз жеткирүү</p>
            </div>
            <div className="text-5xl opacity-90">🛍️</div>
          </div>
        </div>
      </div>

      {/* Trending - Compact */}
      <div className="px-1.5 py-1">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1">
            <span>🔥</span> Популярдуу
          </h3>
          <Link href="/categories?sort=popular" className="text-orange-600 text-[10px]">Баары →</Link>
        </div>

        <div className="flex gap-1 overflow-x-auto pb-1 -mx-1.5 px-1.5 scrollbar-hide">
          {[...products]
            .sort((a, b) => (b.views + b.likes * 10) - (a.views + a.likes * 10))
            .slice(0, 12)
            .map((item) => (
              <Link key={item.id} href={`/product/${item.id}`} className="flex-shrink-0">
                <div className="w-16 bg-white rounded-lg overflow-hidden border border-gray-100">
                  <div className="relative w-16 h-16">
                    <Image src={item.images[0]} alt={item.title} fill className="object-cover" />
                    {item.originalPrice && (
                      <div className="absolute top-0 right-0 px-0.5 bg-red-500 text-white text-[8px] font-bold rounded-bl">
                        -{Math.round((1 - item.price / item.originalPrice) * 100)}%
                      </div>
                    )}
                  </div>
                  <div className="p-1 text-center">
                    <div className="text-[10px] font-bold text-red-600">¥{item.price >= 1000 ? `${(item.price / 1000).toFixed(0)}K` : item.price}</div>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>

      {/* Hot Deals - Compact */}
      {hotProducts.length > 0 && (
        <div className="px-1.5 py-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1">
              <span>👥</span> Бирге алуу
              <span className="px-1 py-0.5 bg-orange-100 text-orange-700 text-[8px] font-bold rounded animate-pulse">HOT</span>
            </h3>
            <Link href="/categories?filter=deals" className="text-orange-600 text-[10px]">Баары →</Link>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1.5 px-1.5 scrollbar-hide">
            {hotProducts.slice(0, 6).map((item) => (
              <Link key={item.id} href={`/product/${item.id}`} className="flex-shrink-0 w-36">
                <div className={`bg-gradient-to-br ${item.isGroupBuy ? 'from-orange-50 to-pink-50' : 'from-yellow-50 to-red-50'} rounded-lg p-1.5 border border-orange-100`}>
                  <div className="relative h-24 rounded overflow-hidden mb-1">
                    <Image src={item.images[0]} alt={item.title} fill className="object-cover" />
                    {item.isGroupBuy && (
                      <div className="absolute top-0.5 left-0.5 px-1 py-0.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-[8px] font-bold rounded">
                        👥 БИРГЕ
                      </div>
                    )}
                    {item.isFlashSale && !item.isGroupBuy && (
                      <div className="absolute top-0.5 left-0.5 px-1 py-0.5 bg-gradient-to-r from-yellow-500 to-red-500 text-white text-[8px] font-bold rounded animate-pulse">
                        ⚡ FLASH
                      </div>
                    )}
                    {item.videoUrl && (
                      <button
                        onClick={(e) => { e.preventDefault(); handleVideoClick(item.id); }}
                        className="absolute bottom-0.5 right-0.5 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center"
                      >
                        <svg className="w-3 h-3 text-red-500 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </button>
                    )}
                  </div>
                  <h4 className="text-[10px] font-medium text-gray-800 line-clamp-1">{item.title}</h4>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs font-bold text-red-600">¥{item.isGroupBuy && item.groupBuyPrice ? item.groupBuyPrice.toLocaleString() : item.price.toLocaleString()}</span>
                    <span className="text-[8px] text-gray-400">{item.soldCount > 1000 ? `${(item.soldCount/1000).toFixed(1)}K` : item.soldCount}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All Products Grid - Compact */}
      <div className="px-1.5 pb-16">
        <div className="flex items-center justify-between mb-1.5 py-1 bg-white rounded px-2">
          <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1">
            🛍️ {activeCategory === '1' ? 'Баары' : categories.find(c => c.id === activeCategory)?.name}
            <span className="text-[10px] font-normal text-gray-400">({filteredProducts.length})</span>
          </h3>
          <div className="flex items-center gap-1">
            <button className="px-2 py-0.5 text-[10px] bg-orange-500 text-white rounded">Баары</button>
            <button className="px-2 py-0.5 text-[10px] bg-white text-gray-600 rounded border border-gray-200">Жаңы</button>
            <button className="px-2 py-0.5 text-[10px] bg-white text-gray-600 rounded border border-gray-200">Арзан</button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1">
          {displayedProducts.map((item, index) => (
            <div key={item.id} className="animate-fadeIn" style={{ animationDelay: `${Math.min(index, 20) * 30}ms` }}>
              <ProductCard
                product={item}
                onVideoClick={item.videoUrl ? (e) => { e?.preventDefault(); handleVideoClick(item.id); } : undefined}
              />
            </div>
          ))}
        </div>

        {/* Infinite Scroll */}
        <div ref={loadMoreRef} className="flex flex-col items-center mt-2 pb-2">
          {isLoading && (
            <div className="flex items-center gap-2 py-2">
              <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-500 text-[10px]">Жүктөлүүдө...</span>
            </div>
          )}
          {hasMore && !isLoading && (
            <div className="text-gray-400 text-[10px] py-2">{displayCount} / {filteredProducts.length}</div>
          )}
          {!hasMore && filteredProducts.length > 0 && (
            <div className="text-gray-400 text-[10px] py-2">Баары жүктөлдү ({filteredProducts.length})</div>
          )}
        </div>
      </div>

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