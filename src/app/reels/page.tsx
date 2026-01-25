'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useReels } from '@/hooks/useReels';
import {
  RiyilsViewer,
  RiyilsObserverProvider,
  PlaybackControllerProvider,
  type Video,
  type RiyilsViewerControl,
  type RiyilsViewerControlContext,
} from 'react-riyils';
import 'react-riyils/dist/index.css';

export default function ReelsPage() {
  const router = useRouter();
  const { reels, loading } = useReels({ limit: 50 });
  const [viewerOpen, setViewerOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-open viewer on mobile
  useEffect(() => {
    if (isMobile && reels.length > 0 && !viewerOpen) {
      setViewerOpen(true);
    }
  }, [isMobile, reels.length]);

  // Transform reels to react-riyils Video format
  const videos: Video[] = useMemo(() => {
    return reels.map(reel => ({
      id: reel.id,
      videoUrl: reel.videoUrl,
      thumbnailUrl: reel.thumbnailUrl,
      caption: reel.product.title,
    }));
  }, [reels]);

  const openViewer = (index: number) => {
    setInitialIndex(index);
    setCurrentIndex(index);
    setViewerOpen(true);
  };

  const closeViewer = () => {
    setViewerOpen(false);
    if (isMobile) {
      router.push('/');
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

  // Custom controls for the viewer
  const customControls: RiyilsViewerControl[] = useMemo(() => {
    const currentReel = reels[currentIndex];
    if (!currentReel) return [];

    return [
      {
        id: 'like',
        icon: (
          <svg className="w-7 h-7" fill={liked.has(currentReel.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        ),
        ariaLabel: 'Жактыруу',
        onClick: () => toggleLike(currentReel.id),
        className: liked.has(currentReel.id) ? 'text-red-500' : 'text-white',
      },
      {
        id: 'comment',
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        ),
        ariaLabel: 'Комментарий',
        onClick: () => {},
        className: 'text-white',
      },
      {
        id: 'share',
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        ),
        ariaLabel: 'Бөлүшүү',
        onClick: () => {
          if (navigator.share) {
            navigator.share({
              title: currentReel.product.title,
              url: `/product/${currentReel.productId}`,
            });
          }
        },
        className: 'text-white',
      },
    ];
  }, [currentIndex, reels, liked]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Видеолор жүктөлүүдө...</p>
        </div>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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

  const currentReel = reels[currentIndex];

  return (
    <RiyilsObserverProvider onEvent={() => {}} logLevel="error">
      <PlaybackControllerProvider>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200">
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
                <Link href="/cart" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </Link>
                <Link href="/profile" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
              </div>
            </div>
          </header>

          {/* Main Content - Video Grid */}
          <main className="pt-20 pb-8 px-4 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-800">🎬 Shorts</h1>
              <p className="text-gray-500">{reels.length} видео</p>
            </div>

            {/* Video Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {reels.map((reel, index) => (
                <button
                  key={reel.id}
                  onClick={() => openViewer(index)}
                  className="group relative aspect-[9/16] bg-gray-200 rounded-xl overflow-hidden hover:ring-2 hover:ring-orange-500 transition-all"
                >
                  {/* Thumbnail */}
                  <Image
                    src={reel.thumbnailUrl}
                    alt={reel.product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center">
                      <svg className="w-7 h-7 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>

                  {/* Duration badge */}
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-white text-xs rounded">
                    {Math.floor(reel.duration / 60)}:{(reel.duration % 60).toString().padStart(2, '0')}
                  </div>

                  {/* Stats */}
                  <div className="absolute bottom-2 left-2 flex items-center gap-2">
                    <span className="flex items-center gap-1 text-white text-xs">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {formatNumber(reel.likes)}
                    </span>
                  </div>

                  {/* Product price badge */}
                  <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                    ¥{formatPrice(reel.product.price)}
                  </div>
                </button>
              ))}
            </div>
          </main>

          {/* Riyils Viewer */}
          {viewerOpen && videos.length > 0 && (
            <>
              <RiyilsViewer
                videos={videos}
                initialIndex={initialIndex}
                onClose={closeViewer}
                onVideoChange={(index) => setCurrentIndex(index)}
                progressBarColor="#f97316"
                enableAutoAdvance={true}
                translations={{
                  close: 'Жабуу',
                  play: 'Ойнотуу',
                  pause: 'Токтотуу',
                  mute: 'Үндү өчүрүү',
                  unmute: 'Үндү ачуу',
                  forward: 'Алдыга',
                  rewind: 'Артка',
                  speedIndicator: 'Ылдамдык',
                  videoPlayer: 'Видео ойноткуч',
                  more: 'Көбүрөөк',
                  less: 'Азыраак',
                }}
              />

              {/* Custom Product Overlay */}
              {currentReel && (
                <div className="fixed bottom-0 left-0 right-0 z-[10001] pointer-events-none">
                  <div className="max-w-[400px] mx-auto px-4 pb-24 md:pb-8">
                    {/* Product card */}
                    <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-3 pointer-events-auto">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/product/${currentReel.productId}`}
                          className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 border-white/20"
                        >
                          <Image
                            src={currentReel.product.images[0]}
                            alt={currentReel.product.title}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium line-clamp-1">{currentReel.product.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-orange-400 font-bold">¥{formatPrice(currentReel.product.price)}</span>
                            {currentReel.product.originalPrice && (
                              <span className="text-white/50 text-xs line-through">¥{formatPrice(currentReel.product.originalPrice)}</span>
                            )}
                          </div>
                        </div>
                        <Link
                          href={`/product/${currentReel.productId}`}
                          className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-full hover:bg-orange-600 transition-colors flex-shrink-0"
                        >
                          Көрүү
                        </Link>
                      </div>
                    </div>

                    {/* Like/Share buttons for mobile */}
                    <div className="flex items-center justify-center gap-6 mt-4 md:hidden">
                      <button
                        onClick={() => toggleLike(currentReel.id)}
                        className="flex flex-col items-center gap-1"
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${liked.has(currentReel.id) ? 'bg-red-500' : 'bg-white/20'}`}>
                          <svg className="w-6 h-6 text-white" fill={liked.has(currentReel.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                        <span className="text-white text-xs">{formatNumber(currentReel.likes)}</span>
                      </button>

                      <button className="flex flex-col items-center gap-1">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <span className="text-white text-xs">{formatNumber(currentReel.comments)}</span>
                      </button>

                      <button
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: currentReel.product.title,
                              url: `/product/${currentReel.productId}`,
                            });
                          }
                        }}
                        className="flex flex-col items-center gap-1"
                      >
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                        </div>
                        <span className="text-white text-xs">Бөлүшүү</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Mobile Bottom Navigation */}
          {!viewerOpen && (
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
                <button className="flex flex-col items-center gap-0.5 text-orange-500 relative">
                  <div className="w-12 h-12 -mt-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <span className="text-xs mt-1 font-medium">Shorts</span>
                </button>
                <Link href="/cart" className="flex flex-col items-center gap-0.5 text-gray-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span className="text-xs">Корзина</span>
                </Link>
                <Link href="/profile" className="flex flex-col items-center gap-0.5 text-gray-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-xs">Профиль</span>
                </Link>
              </div>
            </nav>
          )}
        </div>
      </PlaybackControllerProvider>
    </RiyilsObserverProvider>
  );
}