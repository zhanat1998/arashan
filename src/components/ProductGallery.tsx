'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
  images: string[];
  videoUrl?: string;
  videos?: string[];
  title: string;
}

export default function ProductGallery({ images, videoUrl, videos = [], title }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Combine all videos (legacy videoUrl + new videos array)
  const allVideos = [...(videoUrl ? [videoUrl] : []), ...videos];

  // Build media array: videos first, then images
  const allMedia = [
    ...allVideos.map(url => ({ type: 'video' as const, url })),
    ...images.map(url => ({ type: 'image' as const, url }))
  ];
  const currentMedia = allMedia[activeIndex];

  const handleVideoToggle = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  return (
    <div className="w-full">
      {/* Main Display */}
      <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-4">
        {currentMedia.type === 'video' ? (
          <>
            <video
              ref={videoRef}
              src={currentMedia.url}
              className="w-full h-full object-cover"
              loop
              playsInline
              onClick={handleVideoToggle}
            />
            {!isVideoPlaying && (
              <button
                onClick={handleVideoToggle}
                className="absolute inset-0 flex items-center justify-center bg-black/20"
              >
                <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-10 h-10 text-[var(--pdd-red)] ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </button>
            )}
            {/* Video badge */}
            <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 text-white text-sm rounded-full flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Видео
            </div>
          </>
        ) : (
          <Image
            src={currentMedia.url}
            alt={title}
            fill
            className="object-cover"
            priority
          />
        )}

        {/* Image counter */}
        <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 text-white text-sm rounded-full">
          {activeIndex + 1} / {allMedia.length}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
        {allMedia.map((media, index) => (
          <button
            key={index}
            onClick={() => {
              setActiveIndex(index);
              if (media.type !== 'video') {
                setIsVideoPlaying(false);
                videoRef.current?.pause();
              }
            }}
            className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
              activeIndex === index ? 'border-[var(--pdd-red)] scale-105' : 'border-transparent opacity-70 hover:opacity-100'
            }`}
          >
            {media.type === 'video' ? (
              <>
                <video src={media.url} className="w-full h-full object-cover" muted />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </>
            ) : (
              <Image src={media.url} alt={`${title} ${index}`} fill className="object-cover" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}