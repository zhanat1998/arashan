'use client';

import { useState } from 'react';
import Link from 'next/link';
import { videos } from '@/data/products';

export default function AdminVideos() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVideos = videos.filter(video =>
    video.product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatNumber = (num: number) => {
    if (num >= 10000) return `${(num / 10000).toFixed(1)}万`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Видеолор</h1>
          <p className="text-gray-500 mt-1">{videos.length} видео</p>
        </div>
        <Link
          href="/admin/videos/upload"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:shadow-lg transition-all"
        >
          <span>🎥</span>
          Видео жүктөө
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Видео издөө..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredVideos.map((video) => (
          <div
            key={video.id}
            className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
          >
            {/* Video Thumbnail */}
            <div className="relative aspect-[9/16] bg-gray-100">
              <img
                src={video.thumbnailUrl}
                alt={video.product.title}
                className="w-full h-full object-cover"
              />

              {/* Play overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>

              {/* Duration */}
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
              </div>

              {/* Live badge */}
              {video.isLive && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded flex items-center gap-1">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  LIVE
                </div>
              )}
            </div>

            {/* Video Info */}
            <div className="p-3">
              <p className="text-sm font-medium text-gray-800 line-clamp-2 mb-2">
                {video.product.title}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    ❤️ {formatNumber(video.likes)}
                  </span>
                  <span className="flex items-center gap-1">
                    💬 {formatNumber(video.comments)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-3">
                <button className="flex-1 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  Өзгөртүү
                </button>
                <button className="px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className="text-center py-12">
          <span className="text-6xl">🎬</span>
          <p className="text-gray-500 mt-4">Видео табылган жок</p>
        </div>
      )}
    </div>
  );
}