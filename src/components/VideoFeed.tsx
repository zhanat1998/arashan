'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Video } from '@/data/types';

interface VideoFeedProps {
  videos: Video[];
  onClose: () => void;
  initialIndex?: number;
}

export default function VideoFeed({ videos, onClose, initialIndex = 0 }: VideoFeedProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Swipe animation state
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const lastDragY = useRef(0);
  const velocityRef = useRef(0);

  const currentVideo = videos[currentIndex];
  const prevVideo = currentIndex > 0 ? videos[currentIndex - 1] : null;
  const nextVideo = currentIndex < videos.length - 1 ? videos[currentIndex + 1] : null;

  // Navigate to product page
  const handleProductClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
    router.push(`/product/${currentVideo.livestockId}`);
  };

  // Auto-play current video
  useEffect(() => {
    if (videoRef.current && !isDragging) {
      videoRef.current.currentTime = 0;
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [currentIndex, isPlaying, isDragging]);

  // Animate to target position
  const animateToIndex = useCallback((targetIndex: number) => {
    const windowHeight = window.innerHeight;
    const diff = targetIndex - currentIndex;
    const targetOffset = -diff * windowHeight;

    // Animate
    const startOffset = dragOffset;
    const startTime = performance.now();
    const duration = 300;

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const newOffset = startOffset + (targetOffset - startOffset) * eased;

      if (progress < 1) {
        setDragOffset(newOffset);
        requestAnimationFrame(animate);
      } else {
        setDragOffset(0);
        setCurrentIndex(targetIndex);
      }
    };

    requestAnimationFrame(animate);
  }, [currentIndex, dragOffset]);

  // Handle drag start
  const handleDragStart = (clientY: number) => {
    setIsDragging(true);
    dragStartY.current = clientY;
    lastDragY.current = clientY;
    velocityRef.current = 0;
  };

  // Handle drag move
  const handleDragMove = (clientY: number) => {
    if (!isDragging) return;

    const diff = clientY - dragStartY.current;
    velocityRef.current = clientY - lastDragY.current;
    lastDragY.current = clientY;

    // Limit drag at boundaries
    if ((currentIndex === 0 && diff > 0) || (currentIndex === videos.length - 1 && diff < 0)) {
      setDragOffset(diff * 0.3); // Rubber band effect
    } else {
      setDragOffset(diff);
    }
  };

  // Handle drag end
  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const windowHeight = window.innerHeight;
    const threshold = windowHeight * 0.2; // 20% threshold
    const velocity = velocityRef.current;

    // Determine target based on drag distance and velocity
    if (dragOffset < -threshold || velocity < -10) {
      // Swipe up - go to next
      if (currentIndex < videos.length - 1) {
        animateToIndex(currentIndex + 1);
        return;
      }
    } else if (dragOffset > threshold || velocity > 10) {
      // Swipe down - go to prev
      if (currentIndex > 0) {
        animateToIndex(currentIndex - 1);
        return;
      }
    }

    // Snap back to current
    const startOffset = dragOffset;
    const startTime = performance.now();
    const duration = 200;

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const newOffset = startOffset * (1 - eased);

      if (progress < 1) {
        setDragOffset(newOffset);
        requestAnimationFrame(animate);
      } else {
        setDragOffset(0);
      }
    };

    requestAnimationFrame(animate);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientY);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  const handleMouseLeave = () => {
    if (isDragging) handleDragEnd();
  };

  // Wheel handler
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (isDragging) return;

    if (Math.abs(e.deltaY) > 50) {
      if (e.deltaY > 0 && currentIndex < videos.length - 1) {
        animateToIndex(currentIndex + 1);
      } else if (e.deltaY < 0 && currentIndex > 0) {
        animateToIndex(currentIndex - 1);
      }
    }
  }, [currentIndex, videos.length, isDragging, animateToIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowUp' && currentIndex > 0) animateToIndex(currentIndex - 1);
      if (e.key === 'ArrowDown' && currentIndex < videos.length - 1) animateToIndex(currentIndex + 1);
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, videos.length, onClose, animateToIndex]);

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

  // Render video slide
  const renderVideoSlide = (video: Video, position: 'prev' | 'current' | 'next') => {
    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    let translateY = 0;

    if (position === 'prev') {
      translateY = -windowHeight + dragOffset;
    } else if (position === 'current') {
      translateY = dragOffset;
    } else if (position === 'next') {
      translateY = windowHeight + dragOffset;
    }

    return (
      <div
        key={video.id}
        className="absolute inset-0 w-full h-full"
        style={{
          transform: `translateY(${translateY}px)`,
          transition: isDragging ? 'none' : undefined,
        }}
      >
        <video
          ref={position === 'current' ? videoRef : undefined}
          src={video.videoUrl}
          className="h-full w-full object-cover"
          loop
          muted={isMuted}
          playsInline
          autoPlay={position === 'current'}
        />
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={isDragging ? handleMouseMove : undefined}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
      style={{ touchAction: 'none' }}
    >
      {/* Video slides container */}
      <div className="relative h-full w-full">
        {prevVideo && renderVideoSlide(prevVideo, 'prev')}
        {renderVideoSlide(currentVideo, 'current')}
        {nextVideo && renderVideoSlide(nextVideo, 'next')}
      </div>

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

      {/* Play/Pause indicator */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className="w-20 h-20 bg-black/40 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      )}

      {/* Right side actions */}
      <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6 z-40">
        {/* Like */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleLike(currentVideo.id); }}
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
        <button onClick={(e) => e.stopPropagation()} className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <span className="text-white text-xs font-medium">{formatNumber(currentVideo.comments)}</span>
        </button>

        {/* Share */}
        <button onClick={(e) => e.stopPropagation()} className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </div>
          <span className="text-white text-xs font-medium">{formatNumber(currentVideo.shares)}</span>
        </button>

        {/* Sound toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); setIsMuted(prev => !prev); }}
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

      {/* Bottom product card - CLICKABLE */}
      <div
        onClick={handleProductClick}
        className="absolute bottom-4 left-4 right-20 bg-white/95 backdrop-blur-sm rounded-2xl p-3 shadow-xl hover:bg-white transition-colors active:scale-[0.98] cursor-pointer z-40"
      >
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
              <span className="text-lg font-bold text-red-600">
                {formatPrice(currentVideo.livestock.price)} с
              </span>
              {currentVideo.livestock.originalPrice && (
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(currentVideo.livestock.originalPrice)}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              <span>📍</span>
              {currentVideo.livestock.location}
            </div>
          </div>
          <div className="self-center flex flex-col items-center">
            <div className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold rounded-full whitespace-nowrap">
              Сатып ал
            </div>
          </div>
        </div>
      </div>

      {/* Swipe hint indicator */}
      <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-40">
        <div className="w-10 h-1 bg-white/50 rounded-full" />
      </div>
    </div>
  );
}