'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useReels } from '@/hooks/useReels';
import { VerticalFeed, VerticalFeedRef, VideoItem } from 'react-vertical-feed';

export default function ReelsPage() {
  const { reels, loading, loadMore, hasMore } = useReels({ limit: 20 });
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const feedRef = useRef<VerticalFeedRef>(null);

  // Transform reels to VideoItem format
  const videos: VideoItem[] = reels.map(reel => ({
    id: reel.id,
    src: reel.videoUrl,
    poster: reel.thumbnailUrl,
    muted: true,
    autoPlay: true,
    playsInline: true,
    loop: true,
    controls: false,
    metadata: {
      productId: reel.productId,
      product: reel.product,
      likes: reel.likes,
      comments: reel.comments,
    },
  }));

  const toggleLike = (id: string) => {
    setLiked(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 10000) return `${(num / 10000).toFixed(1)}万`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPrice = (price: number) => price.toLocaleString('ru-RU');

  if (loading && reels.length === 0) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Видеолор жүктөлүүдө...</p>
        </div>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl">🎬</span>
          <p className="text-gray-400 mt-4 text-lg">Видео табылган жок</p>
          <Link href="/" className="text-orange-500 hover:underline mt-2 inline-block">
            Башкы бетке кайтуу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between pointer-events-auto">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-bold text-xl text-white hidden sm:block">Shorts</span>
          </Link>
          <Link href="/" className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Link>
        </div>
      </header>

      {/* Video Feed */}
      <VerticalFeed
        ref={feedRef}
        items={videos}
        onEndReached={() => hasMore && loadMore?.()}
        threshold={0.75}
        className="h-full"
        renderItemOverlay={(item, index) => {
          const meta = item.metadata as any;
          const product = meta?.product;
          const videoId = item.id || String(index);

          return (
            <div className="absolute inset-0 pointer-events-none">
              {/* Product Info - Bottom Left */}
              <div className="absolute bottom-0 left-0 right-16 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-auto">
                {/* Shop */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                    {product?.shop?.name?.[0] || 'S'}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{product?.shop?.name || 'Дүкөн'}</p>
                    <p className="text-white/60 text-xs">{product?.brand || ''}</p>
                  </div>
                </div>

                {/* Title */}
                <p className="text-white text-sm line-clamp-2 mb-3">{product?.title}</p>

                {/* Product Card */}
                <Link
                  href={`/product/${meta?.productId}`}
                  className="flex items-center gap-3 p-2 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={product?.images?.[0] || '/placeholder.png'}
                      alt={product?.title || ''}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-orange-400 font-bold">¥{formatPrice(product?.price || 0)}</span>
                    {product?.originalPrice && (
                      <span className="text-white/40 text-xs line-through ml-2">
                        ¥{formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  <div className="px-3 py-1.5 bg-orange-500 text-white text-xs font-medium rounded-full">
                    Көрүү
                  </div>
                </Link>
              </div>

              {/* Actions - Right Side */}
              <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5 pointer-events-auto">
                {/* Like */}
                <button onClick={() => toggleLike(videoId)} className="flex flex-col items-center gap-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    liked.has(videoId) ? 'bg-red-500 scale-110' : 'bg-white/10 hover:bg-white/20'
                  }`}>
                    <svg
                      className="w-6 h-6 text-white"
                      fill={liked.has(videoId) ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <span className="text-white text-xs">{formatNumber((meta?.likes || 0) + (liked.has(videoId) ? 1 : 0))}</span>
                </button>

                {/* Comments */}
                <button className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <span className="text-white text-xs">{formatNumber(meta?.comments || 0)}</span>
                </button>

                {/* Share */}
                <button
                  onClick={() => navigator.share?.({ title: product?.title, url: `/product/${meta?.productId}` })}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </div>
                  <span className="text-white text-xs">Бөлүшүү</span>
                </button>

                {/* Product Thumbnail */}
                <Link
                  href={`/product/${meta?.productId}`}
                  className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white/30 hover:border-white/60 transition-colors"
                >
                  <Image
                    src={product?.images?.[0] || '/placeholder.png'}
                    alt={product?.title || ''}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </Link>
              </div>
            </div>
          );
        }}
      />

      {/* Video Counter */}
      <div className="fixed left-4 bottom-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm z-40">
        {(feedRef.current?.getCurrentItem() ?? 0) + 1} / {videos.length}
      </div>

      {/* Keyboard Hints - Desktop */}
      <div className="hidden md:block fixed left-4 top-1/2 -translate-y-1/2 text-white/40 text-xs space-y-2 z-40">
        <p>↑↓ Навигация</p>
        <p>Space Пауза</p>
      </div>
    </div>
  );
}