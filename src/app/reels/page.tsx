'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useReels } from '@/hooks/useReels';
import { Video } from '@/data/types';

export default function ReelsPage() {
  const router = useRouter();
  const { reels: videos, loading } = useReels({ limit: 50 });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [isMuted, setIsMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Handle scroll snap
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const itemHeight = container.clientHeight;
      const newIndex = Math.round(scrollTop / itemHeight);

      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < videos.length) {
        setCurrentIndex(newIndex);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentIndex, videos.length]);

  // Play current video, pause others
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentIndex) {
          video.currentTime = 0;
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      }
    });
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' && currentIndex < videos.length - 1) {
        scrollToIndex(currentIndex + 1);
      } else if (e.key === 'ArrowUp' && currentIndex > 0) {
        scrollToIndex(currentIndex - 1);
      } else if (e.key === 'm') {
        setIsMuted(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, videos.length]);

  const scrollToIndex = (index: number) => {
    const container = containerRef.current;
    if (container) {
      container.scrollTo({
        top: index * container.clientHeight,
        behavior: 'smooth'
      });
    }
  };

  const toggleLike = (videoId: string) => {
    setLiked(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) newSet.delete(videoId);
      else newSet.add(videoId);
      return newSet;
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 10000) return `${(num / 10000).toFixed(1)}万`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPrice = (price: number) => price.toLocaleString('ru-RU');

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Видеолор жүктөлүүдө...</p>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl">🎬</span>
          <p className="text-gray-600 mt-4 text-lg">Видео табылган жок</p>
          <Link href="/" className="text-orange-500 hover:underline mt-2 inline-block">
            Башкы бетке кайтуу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="font-bold text-xl text-gray-800 hidden sm:block">Pinduo</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link href="/" className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                Башкы
              </Link>
              <Link href="/reels" className="px-4 py-2 bg-gray-100 text-gray-900 font-medium rounded-lg">
                Shorts
              </Link>
              <Link href="/categories" className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                Категориялар
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title={isMuted ? 'Үндү ачуу' : 'Үндү өчүрүү'}
            >
              {isMuted ? (
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>
            <Link href="/profile" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-16 flex">
        {/* Left Sidebar - Desktop only */}
        <aside className="hidden lg:flex flex-col w-60 fixed left-0 top-16 bottom-0 border-r border-gray-200 p-4">
          <nav className="space-y-1">
            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Башкы бет</span>
            </Link>
            <Link href="/reels" className="flex items-center gap-3 px-3 py-2.5 bg-gray-100 text-gray-900 font-medium rounded-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.53 7.47a.75.75 0 0 0-1.06 0L12 11.94 7.53 7.47a.75.75 0 0 0-1.06 1.06L12 14.06l5.53-5.53a.75.75 0 0 0 0-1.06ZM12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z"/>
              </svg>
              <span>Shorts</span>
            </Link>
            <Link href="/categories" className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              <span>Категориялар</span>
            </Link>
            <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Профиль</span>
            </Link>
          </nav>

          <div className="mt-auto pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-400 px-3">
              © 2024 Pinduo Shop
            </p>
          </div>
        </aside>

        {/* Videos Container */}
        <main className="flex-1 lg:ml-60">
          <div
            ref={containerRef}
            className="h-[calc(100vh-64px)] overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
            style={{ scrollSnapType: 'y mandatory' }}
          >
            {videos.map((video, index) => (
              <div
                key={video.id}
                className="h-[calc(100vh-64px)] snap-start snap-always flex items-center justify-center py-4"
              >
                <div className="flex items-center gap-4 max-w-4xl mx-auto px-4">
                  {/* Video Container */}
                  <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl" style={{ width: '360px', height: '640px' }}>
                    <video
                      ref={el => { videoRefs.current[index] = el; }}
                      src={video.videoUrl}
                      className="w-full h-full object-cover"
                      loop
                      muted={isMuted}
                      playsInline
                      onClick={(e) => {
                        const vid = e.currentTarget;
                        if (vid.paused) vid.play();
                        else vid.pause();
                      }}
                    />

                    {/* Video Progress */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-white/20">
                      <div className="h-full bg-white/80 transition-all" style={{ width: '0%' }} />
                    </div>

                    {/* Product Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                      {/* Shop info */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold">
                          {video.product.shop?.name?.[0] || 'S'}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{video.product.shop?.name || 'Дүкөн'}</p>
                          <p className="text-white/70 text-xs">{video.product.brand || ''}</p>
                        </div>
                      </div>

                      {/* Product title */}
                      <p className="text-white text-sm line-clamp-2 mb-2">{video.product.title}</p>

                      {/* Price */}
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold text-lg">¥{formatPrice(video.product.price)}</span>
                        {video.product.originalPrice && (
                          <span className="text-white/50 text-sm line-through">¥{formatPrice(video.product.originalPrice)}</span>
                        )}
                      </div>
                    </div>

                    {/* Click to view product */}
                    <Link
                      href={`/product/${video.productId}`}
                      className="absolute bottom-20 left-4 right-4 py-2.5 bg-white/95 text-gray-900 text-center font-medium text-sm rounded-lg hover:bg-white transition-colors"
                    >
                      Товарды көрүү
                    </Link>
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-col items-center gap-6">
                    {/* Like */}
                    <button
                      onClick={() => toggleLike(video.id)}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        liked.has(video.id)
                          ? 'bg-red-100 text-red-500'
                          : 'bg-gray-100 text-gray-700 group-hover:bg-gray-200'
                      }`}>
                        <svg className="w-6 h-6" fill={liked.has(video.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-600">{formatNumber(video.likes + (liked.has(video.id) ? 1 : 0))}</span>
                    </button>

                    {/* Dislike */}
                    <button className="flex flex-col items-center gap-1 group">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 group-hover:bg-gray-200 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" transform="rotate(180 12 12)" />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-600">Жок</span>
                    </button>

                    {/* Comments */}
                    <button className="flex flex-col items-center gap-1 group">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 group-hover:bg-gray-200 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-600">{formatNumber(video.comments)}</span>
                    </button>

                    {/* Share */}
                    <button className="flex flex-col items-center gap-1 group">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 group-hover:bg-gray-200 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-600">Бөлүшүү</span>
                    </button>

                    {/* Product thumbnail */}
                    <Link
                      href={`/product/${video.productId}`}
                      className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white shadow-md hover:scale-110 transition-transform"
                    >
                      <Image
                        src={video.product.images[0]}
                        alt={video.product.title}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Navigation Arrows - Fixed right side */}
        <div className="fixed right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-40">
          <button
            onClick={() => currentIndex > 0 && scrollToIndex(currentIndex - 1)}
            disabled={currentIndex === 0}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
              currentIndex === 0
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            onClick={() => currentIndex < videos.length - 1 && scrollToIndex(currentIndex + 1)}
            disabled={currentIndex === videos.length - 1}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
              currentIndex === videos.length - 1
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Video Counter */}
        <div className="fixed right-8 bottom-8 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm z-40">
          {currentIndex + 1} / {videos.length}
        </div>
      </div>
    </div>
  );
}