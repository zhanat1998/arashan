'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Livestream {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  status: 'live' | 'scheduled' | 'ended';
  scheduled_at?: string;
  started_at?: string;
  viewer_count: number;
  total_likes: number;
  shop: {
    id: string;
    name: string;
    logo?: string;
  };
  host: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export default function LivePage() {
  const [livestreams, setLivestreams] = useState<Livestream[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'live' | 'scheduled' | 'ended'>('live');

  useEffect(() => {
    fetchLivestreams();
  }, [activeTab]);

  const fetchLivestreams = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/live?status=${activeTab}&limit=30`);
      const data = await res.json();
      if (res.ok) {
        setLivestreams(data.livestreams || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatScheduleTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);

    if (hours < 0) return 'Башталды';
    if (hours === 0) return `${minutes} мин ичинде`;
    if (hours < 24) return `${hours} саат ичинде`;

    return date.toLocaleDateString('ky-KG', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-6">
        <h1 className="text-2xl font-bold mb-1">Түз эфирлер</h1>
        <p className="text-white/80 text-sm">Сатуучулардан түз көрсөтүү</p>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 bg-white z-10 px-4 py-3 shadow-sm">
        <div className="flex gap-2">
          {[
            { key: 'live', label: '🔴 Түз эфир' },
            { key: 'scheduled', label: '📅 Пландалган' },
            { key: 'ended', label: '📹 Жазылган' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-[9/16] bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : livestreams.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">
              {activeTab === 'live' && 'Азырынча түз эфир жок'}
              {activeTab === 'scheduled' && 'Пландалган эфирлер жок'}
              {activeTab === 'ended' && 'Жазылган эфирлер жок'}
            </h3>
            <p className="text-gray-500 text-sm">Кийинчерээк кайра текшериңиз</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {livestreams.map((stream) => (
              <Link
                key={stream.id}
                href={`/live/${stream.id}`}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
              >
                {/* Thumbnail */}
                <div className="relative aspect-[9/16] bg-gray-900">
                  {stream.thumbnail_url ? (
                    <Image
                      src={stream.thumbnail_url}
                      alt={stream.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-500 to-pink-500">
                      <svg className="w-12 h-12 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  {/* Status Badge */}
                  {stream.status === 'live' && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-red-500 rounded-full animate-pulse">
                      <span className="w-1.5 h-1.5 bg-white rounded-full" />
                      <span className="text-xs font-semibold text-white">LIVE</span>
                    </div>
                  )}

                  {stream.status === 'scheduled' && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-blue-500 rounded-full">
                      <span className="text-xs font-semibold text-white">
                        {formatScheduleTime(stream.scheduled_at)}
                      </span>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Shop avatar */}
                      <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white bg-gray-200">
                        {stream.shop.logo && (
                          <Image
                            src={stream.shop.logo}
                            alt={stream.shop.name}
                            width={32}
                            height={32}
                            className="object-cover"
                          />
                        )}
                      </div>
                      <span className="text-white text-xs font-medium truncate max-w-[80px]">
                        {stream.shop.name}
                      </span>
                    </div>

                    {stream.status === 'live' && (
                      <div className="flex items-center gap-2 text-white text-xs">
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                          {stream.viewer_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                          {stream.total_likes}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3 className="font-medium text-gray-800 text-sm line-clamp-2">{stream.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Floating CTA for sellers */}
      <Link
        href="/seller/live/start"
        className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-shadow z-20"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </Link>
    </div>
  );
}