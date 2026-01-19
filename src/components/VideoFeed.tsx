'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Video } from '@/data/types';

interface VideoFeedProps {
  videos: Video[];
  onClose: () => void;
  initialIndex?: number;
}

export default function VideoFeed({ videos, onClose, initialIndex = 0 }: VideoFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const touchStartY = useRef(0);

  const currentVideo = videos[currentIndex];

  // Auto-play current video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [currentIndex, isPlaying]);

  // Navigate to next/prev video
  const goToVideo = useCallback((direction: 'next' | 'prev') => {
    if (isTransitioning) return;

    if (direction === 'next' && currentIndex < videos.length - 1) {
      setIsTransitioning(true);
      setCurrentIndex(prev => prev + 1);
      setTimeout(() => setIsTransitioning(false), 300);
    } else if (direction === 'prev' && currentIndex > 0) {
      setIsTransitioning(true);
      setCurrentIndex(prev => prev - 1);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  }, [currentIndex, videos.length, isTransitioning]);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToVideo('next');
      } else {
        goToVideo('prev');
      }
    }
  };

  // Wheel handler for desktop
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) > 30) {
      if (e.deltaY > 0) {
        goToVideo('next');
      } else {
        goToVideo('prev');
      }
    }
  }, [goToVideo]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowUp') goToVideo('prev');
      if (e.key === 'ArrowDown') goToVideo('next');
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToVideo, onClose]);

  const formatNumber = (num: number) => {
    if (num >= 10000) return `${(num / 10000).toFixed(1)}万`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const formatPrice = (price: number) => price.toLocaleString('ru-RU');

  const toggleLike = (videoId: string) => {
    setLiked(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 left-4 z-50 w-10 h-10 flex items-center justify-center text-white bg-black/30 rounded-full backdrop-blur-sm hover:bg-black/50 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Video counter */}
      <div className="absolute top-4 right-4 z-50 px-3 py-1 bg-black/30 backdrop-blur-sm rounded-full text-white text-sm">
        {currentIndex + 1} / {videos.length}
      </div>

      {/* Main video container */}
      <div className="h-full w-full relative flex items-center justify-center">
        {/* Video */}
        <video
          ref={videoRef}
          key={currentVideo.id}
          src={currentVideo.videoUrl}
          className="h-full w-full object-cover md:object-contain transition-opacity duration-300"
          loop
          muted={isMuted}
          playsInline
          autoPlay
          onClick={() => setIsPlaying(prev => !prev)}
        />

        {/* Live badge */}
        {currentVideo.isLive && (
          <div className="absolute top-16 right-4 px-3 py-1 bg-red-600 text-white text-sm font-bold rounded-full flex items-center gap-2 animate-pulse">
            <span className="w-2 h-2 bg-white rounded-full"></span>
            LIVE
          </div>
        )}

        {/* Play/Pause indicator */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-20 h-20 bg-black/40 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        )}

        {/* Right side actions */}
        <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6">
          {/* Like */}
          <button
            onClick={() => toggleLike(currentVideo.id)}
            className="flex flex-col items-center gap-1"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${liked.has(currentVideo.id) ? 'bg-red-500 scale-110' : 'bg-black/30 backdrop-blur-sm'}`}>
              <svg className="w-7 h-7 text-white" fill={liked.has(currentVideo.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-white text-xs font-medium">
              {formatNumber(currentVideo.likes + (liked.has(currentVideo.id) ? 1 : 0))}
            </span>
          </button>

          {/* Comments */}
          <button className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <span className="text-white text-xs font-medium">{formatNumber(currentVideo.comments)}</span>
          </button>

          {/* Share */}
          <button className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <span className="text-white text-xs font-medium">{formatNumber(currentVideo.shares)}</span>
          </button>

          {/* Sound toggle */}
          <button
            onClick={() => setIsMuted(prev => !prev)}
            className="flex flex-col items-center gap-1"
          >
            <div className="w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center">
              {isMuted ? (
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </div>
          </button>
        </div>

        {/* Bottom product card */}
        <div className="absolute bottom-4 left-4 right-20 bg-white/95 backdrop-blur-sm rounded-2xl p-3 shadow-xl">
          <div className="flex gap-3">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
              <Image
                src={currentVideo.livestock.images[0]}
                alt={currentVideo.livestock.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-medium text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded-full">
                  {currentVideo.livestock.breed}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  currentVideo.livestock.gender === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
                }`}>
                  {currentVideo.livestock.gender === 'male' ? '♂' : '♀'}
                </span>
              </div>
              <h4 className="text-sm font-medium text-gray-800 line-clamp-1">
                {currentVideo.livestock.title}
              </h4>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-lg font-bold text-emerald-600">
                  {formatPrice(currentVideo.livestock.price)} сом
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                </svg>
                {currentVideo.livestock.location}
              </div>
            </div>
            <button className="self-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold rounded-full whitespace-nowrap">
              Көрүү
            </button>
          </div>
        </div>

        {/* Navigation hints */}
        <div className="absolute top-1/2 right-2 -translate-y-1/2 flex flex-col items-center gap-2">
          {currentIndex > 0 && (
            <button
              onClick={() => goToVideo('prev')}
              className="w-8 h-8 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          )}
          {currentIndex < videos.length - 1 && (
            <button
              onClick={() => goToVideo('next')}
              className="w-8 h-8 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}