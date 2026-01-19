'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Video } from '@/data/types';
import { generateReelComments, ReelComment } from '@/data/reelsComments';

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
  const [showComments, setShowComments] = useState(false);
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
    router.push(`/product/${currentVideo.productId}`);
  };

  // Auto-play current video
  useEffect(() => {
    if (videoRef.current && !isDragging) {
      videoRef.current.currentTime = 0;
      if (isPlaying && !showComments) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [currentIndex, isPlaying, isDragging, showComments]);

  // Pause when comments open
  useEffect(() => {
    if (showComments && videoRef.current) {
      videoRef.current.pause();
    } else if (!showComments && videoRef.current && isPlaying) {
      videoRef.current.play().catch(() => {});
    }
  }, [showComments, isPlaying]);

  // Animate to target position
  const animateToIndex = useCallback((targetIndex: number) => {
    const windowHeight = window.innerHeight;
    const diff = targetIndex - currentIndex;
    const targetOffset = -diff * windowHeight;

    const startOffset = dragOffset;
    const startTime = performance.now();
    const duration = 300;

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
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

  // Drag handlers
  const handleDragStart = (clientY: number) => {
    if (showComments) return;
    setIsDragging(true);
    dragStartY.current = clientY;
    lastDragY.current = clientY;
    velocityRef.current = 0;
  };

  const handleDragMove = (clientY: number) => {
    if (!isDragging || showComments) return;

    const diff = clientY - dragStartY.current;
    velocityRef.current = clientY - lastDragY.current;
    lastDragY.current = clientY;

    if ((currentIndex === 0 && diff > 0) || (currentIndex === videos.length - 1 && diff < 0)) {
      setDragOffset(diff * 0.3);
    } else {
      setDragOffset(diff);
    }
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const windowHeight = window.innerHeight;
    const threshold = windowHeight * 0.2;
    const velocity = velocityRef.current;

    if (dragOffset < -threshold || velocity < -10) {
      if (currentIndex < videos.length - 1) {
        animateToIndex(currentIndex + 1);
        return;
      }
    } else if (dragOffset > threshold || velocity > 10) {
      if (currentIndex > 0) {
        animateToIndex(currentIndex - 1);
        return;
      }
    }

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

  // Touch/Mouse handlers
  const handleTouchStart = (e: React.TouchEvent) => handleDragStart(e.touches[0].clientY);
  const handleTouchMove = (e: React.TouchEvent) => handleDragMove(e.touches[0].clientY);
  const handleTouchEnd = () => handleDragEnd();
  const handleMouseDown = (e: React.MouseEvent) => { e.preventDefault(); handleDragStart(e.clientY); };
  const handleMouseMove = (e: React.MouseEvent) => handleDragMove(e.clientY);
  const handleMouseUp = () => handleDragEnd();
  const handleMouseLeave = () => { if (isDragging) handleDragEnd(); };

  // Wheel handler
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (isDragging || showComments) return;
    if (Math.abs(e.deltaY) > 50) {
      if (e.deltaY > 0 && currentIndex < videos.length - 1) {
        animateToIndex(currentIndex + 1);
      } else if (e.deltaY < 0 && currentIndex > 0) {
        animateToIndex(currentIndex - 1);
      }
    }
  }, [currentIndex, videos.length, isDragging, showComments, animateToIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showComments) {
        if (e.key === 'Escape') setShowComments(false);
        return;
      }
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowUp' && currentIndex > 0) animateToIndex(currentIndex - 1);
      if (e.key === 'ArrowDown' && currentIndex < videos.length - 1) animateToIndex(currentIndex + 1);
      if (e.key === ' ') { e.preventDefault(); setIsPlaying(prev => !prev); }
      if (e.key === 'c') setShowComments(true);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, videos.length, onClose, animateToIndex, showComments]);

  const formatNumber = (num: number) => {
    if (num >= 10000) return `${(num / 10000).toFixed(1)}万`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const formatPrice = (price: number) => price.toLocaleString('ru-RU');

  const toggleLike = (videoId: string) => {
    setLiked(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) newSet.delete(videoId);
      else newSet.add(videoId);
      return newSet;
    });
  };

  // Render video slide
  const renderVideoSlide = (video: Video, position: 'prev' | 'current' | 'next') => {
    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    let translateY = 0;
    if (position === 'prev') translateY = -windowHeight + dragOffset;
    else if (position === 'current') translateY = dragOffset;
    else if (position === 'next') translateY = windowHeight + dragOffset;

    return (
      <div key={video.id} className="absolute inset-0 w-full h-full" style={{ transform: `translateY(${translateY}px)`, transition: isDragging ? 'none' : undefined }}>
        <video ref={position === 'current' ? videoRef : undefined} src={video.videoUrl} className="h-full w-full object-cover" loop muted={isMuted} playsInline autoPlay={position === 'current'} />
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black overflow-hidden select-none"
      onTouchStart={!showComments ? handleTouchStart : undefined}
      onTouchMove={!showComments ? handleTouchMove : undefined}
      onTouchEnd={!showComments ? handleTouchEnd : undefined}
      onMouseDown={!showComments ? handleMouseDown : undefined}
      onMouseMove={isDragging && !showComments ? handleMouseMove : undefined}
      onMouseUp={!showComments ? handleMouseUp : undefined}
      onMouseLeave={!showComments ? handleMouseLeave : undefined}
      onWheel={!showComments ? handleWheel : undefined}
      style={{ touchAction: showComments ? 'auto' : 'none' }}
    >
      {/* Video slides */}
      <div className="relative h-full w-full">
        {prevVideo && renderVideoSlide(prevVideo, 'prev')}
        {renderVideoSlide(currentVideo, 'current')}
        {nextVideo && renderVideoSlide(nextVideo, 'next')}
      </div>

      {/* Close button */}
      <button onClick={onClose} className="absolute top-4 left-4 z-50 w-10 h-10 flex items-center justify-center text-white bg-black/30 rounded-full backdrop-blur-sm">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Video counter */}
      <div className="absolute top-4 right-4 z-50 px-3 py-1 bg-black/30 backdrop-blur-sm rounded-full text-white text-sm">
        {currentIndex + 1} / {videos.length}
      </div>

      {/* Play/Pause indicator */}
      {!isPlaying && !showComments && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className="w-20 h-20 bg-black/40 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      )}

      {/* Right side actions */}
      <div className={`absolute right-3 bottom-32 flex flex-col items-center gap-5 z-40 transition-opacity ${showComments ? 'opacity-0' : 'opacity-100'}`}>
        {/* Like */}
        <button onClick={(e) => { e.stopPropagation(); toggleLike(currentVideo.id); }} className="flex flex-col items-center gap-1">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${liked.has(currentVideo.id) ? 'bg-red-500 scale-110' : 'bg-black/30 backdrop-blur-sm'}`}>
            <svg className="w-6 h-6 text-white" fill={liked.has(currentVideo.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="text-white text-[11px] font-medium">{formatNumber(currentVideo.likes + (liked.has(currentVideo.id) ? 1 : 0))}</span>
        </button>

        {/* Comments */}
        <button onClick={(e) => { e.stopPropagation(); setShowComments(true); }} className="flex flex-col items-center gap-1">
          <div className="w-11 h-11 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <span className="text-white text-[11px] font-medium">{formatNumber(currentVideo.comments)}</span>
        </button>

        {/* Share */}
        <button onClick={(e) => e.stopPropagation()} className="flex flex-col items-center gap-1">
          <div className="w-11 h-11 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </div>
          <span className="text-white text-[11px] font-medium">{formatNumber(currentVideo.shares)}</span>
        </button>

        {/* Sound */}
        <button onClick={(e) => { e.stopPropagation(); setIsMuted(prev => !prev); }} className="flex flex-col items-center gap-1">
          <div className="w-11 h-11 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center">
            {isMuted ? (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </div>
        </button>
      </div>

      {/* Bottom product card */}
      <div
        onClick={handleProductClick}
        className={`absolute bottom-4 left-3 right-16 bg-white/95 backdrop-blur-sm rounded-xl p-2.5 shadow-xl cursor-pointer z-40 transition-all ${showComments ? 'opacity-0 translate-y-4' : 'opacity-100'}`}
      >
        <div className="flex gap-2.5">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            <Image src={currentVideo.product.images[0]} alt={currentVideo.product.title} fill className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-medium text-gray-800 line-clamp-2">{currentVideo.product.title}</h4>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-base font-bold text-red-600">¥{formatPrice(currentVideo.product.price)}</span>
              {currentVideo.product.originalPrice && (
                <span className="text-[10px] text-gray-400 line-through">¥{formatPrice(currentVideo.product.originalPrice)}</span>
              )}
            </div>
          </div>
          <div className="self-center">
            <div className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-full">Алуу</div>
          </div>
        </div>
      </div>

      {/* Comments Modal - Instagram Style */}
      <CommentsSheet
        videoId={currentVideo.id}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        commentCount={currentVideo.comments}
      />
    </div>
  );
}

// Instagram-style Comments Sheet
function CommentsSheet({ videoId, isOpen, onClose, commentCount }: { videoId: string; isOpen: boolean; onClose: () => void; commentCount: number }) {
  const [comments, setComments] = useState<ReelComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Generate comments on open
  useEffect(() => {
    if (isOpen) {
      setComments(generateReelComments(videoId, 100));
    }
  }, [isOpen, videoId]);

  // Handle drag to close
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (sheetRef.current && sheetRef.current.scrollTop <= 0) {
      dragStartY.current = e.touches[0].clientY;
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientY - dragStartY.current;
    if (diff > 0) setDragY(diff);
  };

  const handleTouchEnd = () => {
    if (dragY > 100) onClose();
    setDragY(0);
    setIsDragging(false);
  };

  const toggleLikeComment = (commentId: string) => {
    setLikedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) newSet.delete(commentId);
      else newSet.add(commentId);
      return newSet;
    });
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) newSet.delete(commentId);
      else newSet.add(commentId);
      return newSet;
    });
  };

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    const newCommentObj: ReelComment = {
      id: `new-${Date.now()}`,
      videoId,
      userId: 'me',
      userName: 'Сиз',
      userAvatar: 'https://i.pravatar.cc/100?img=68',
      content: newComment,
      likes: 0,
      isLiked: false,
      isVerified: false,
      replies: [],
      createdAt: 'азыр',
    };
    setComments([newCommentObj, ...comments]);
    setNewComment('');
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[75vh] flex flex-col transition-transform"
        style={{ transform: `translateY(${dragY}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Handle */}
        <div className="flex justify-center py-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-4 pb-2 border-b border-gray-100 flex items-center justify-between">
          <span className="font-semibold text-sm">Комментарийлер</span>
          <span className="text-xs text-gray-500">{commentCount.toLocaleString()}</span>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-2">
          {comments.map(comment => (
            <div key={comment.id} className="py-2">
              <div className="flex gap-2.5">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <Image src={comment.userAvatar} alt="" width={32} height={32} className="object-cover" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold text-gray-900">{comment.userName}</span>
                    {comment.isVerified && (
                      <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className="text-[10px] text-gray-400 ml-1">{comment.createdAt}</span>
                  </div>
                  <p className="text-xs text-gray-800 mt-0.5 break-words">{comment.content}</p>

                  {/* Actions */}
                  <div className="flex items-center gap-4 mt-1.5">
                    <button onClick={() => toggleLikeComment(comment.id)} className="flex items-center gap-1 text-[10px] text-gray-500">
                      <svg className={`w-3.5 h-3.5 ${likedComments.has(comment.id) ? 'text-red-500 fill-current' : ''}`} fill={likedComments.has(comment.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {comment.likes + (likedComments.has(comment.id) ? 1 : 0)}
                    </button>
                    <button className="text-[10px] text-gray-500 font-medium">Жооп</button>
                  </div>

                  {/* Replies */}
                  {comment.replies.length > 0 && (
                    <div className="mt-2">
                      {!expandedReplies.has(comment.id) ? (
                        <button onClick={() => toggleReplies(comment.id)} className="text-[10px] text-gray-500 flex items-center gap-1">
                          <div className="w-6 h-px bg-gray-300" />
                          {comment.replies.length} жооп көрүү
                        </button>
                      ) : (
                        <div className="space-y-2">
                          {comment.replies.map(reply => (
                            <div key={reply.id} className="flex gap-2">
                              <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                                <Image src={reply.userAvatar} alt="" width={24} height={24} className="object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                  <span className="text-[11px] font-semibold text-gray-900">{reply.userName}</span>
                                  {reply.isVerified && (
                                    <svg className="w-2.5 h-2.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                  <span className="text-[9px] text-gray-400">{reply.createdAt}</span>
                                </div>
                                <p className="text-[11px] text-gray-800 break-words">{reply.content}</p>
                                <button onClick={() => toggleLikeComment(reply.id)} className="flex items-center gap-1 text-[9px] text-gray-500 mt-1">
                                  <svg className={`w-3 h-3 ${likedComments.has(reply.id) ? 'text-red-500 fill-current' : ''}`} fill={likedComments.has(reply.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                  </svg>
                                  {reply.likes + (likedComments.has(reply.id) ? 1 : 0)}
                                </button>
                              </div>
                            </div>
                          ))}
                          <button onClick={() => toggleReplies(comment.id)} className="text-[10px] text-gray-500">
                            Жашыруу
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Like button (right side) */}
                <button onClick={() => toggleLikeComment(comment.id)} className="flex-shrink-0 pt-1">
                  <svg className={`w-4 h-4 ${likedComments.has(comment.id) ? 'text-red-500 fill-current' : 'text-gray-400'}`} fill={likedComments.has(comment.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2 bg-white safe-bottom">
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
            <Image src="https://i.pravatar.cc/100?img=68" alt="" width={32} height={32} className="object-cover" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Комментарий жазыңыз..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none"
          />
          {newComment.trim() && (
            <button onClick={handleSubmit} className="text-blue-500 font-semibold text-sm">
              Жөнөт
            </button>
          )}
        </div>
      </div>
    </div>
  );
}