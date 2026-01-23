'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Livestream {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  scheduled_at?: string;
  started_at?: string;
  ended_at?: string;
  viewer_count: number;
  peak_viewers: number;
  total_likes: number;
  total_comments: number;
  total_orders: number;
  total_revenue: number;
}

export default function SellerLivePage() {
  const [livestreams, setLivestreams] = useState<Livestream[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'live' | 'scheduled' | 'ended'>('all');

  useEffect(() => {
    fetchLivestreams();
  }, []);

  const fetchLivestreams = async () => {
    try {
      const res = await fetch('/api/seller/live');
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

  const handleAction = async (livestreamId: string, action: string) => {
    try {
      const res = await fetch('/api/seller/live', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ livestream_id: livestreamId, action }),
      });

      if (res.ok) {
        fetchLivestreams();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const filteredStreams = livestreams.filter((stream) => {
    if (activeTab === 'all') return true;
    return stream.status === activeTab;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('ky-KG', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (start?: string, end?: string) => {
    if (!start) return '-';
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const diff = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    return hours > 0 ? `${hours}с ${minutes}м` : `${minutes}м`;
  };

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Түз эфирлер</h1>
          <p className="text-gray-500 mt-1">Жалпы: {livestreams.length} эфир</p>
        </div>
        <Link
          href="/seller/live/start"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium rounded-xl hover:from-red-600 hover:to-pink-600 transition-all shadow-lg"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
          Эфир баштоо
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'Баары', count: livestreams.length },
          { key: 'live', label: '🔴 Түз эфир', count: livestreams.filter(s => s.status === 'live').length },
          { key: 'scheduled', label: '📅 Пландалган', count: livestreams.filter(s => s.status === 'scheduled').length },
          { key: 'ended', label: '✅ Бүткөн', count: livestreams.filter(s => s.status === 'ended').length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredStreams.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Эфирлер жок</h3>
          <p className="text-gray-500 mb-4">Биринчи түз эфириңизди баштаңыз</p>
          <Link
            href="/seller/live/start"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium rounded-xl"
          >
            Эфир баштоо
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredStreams.map((stream) => (
            <div
              key={stream.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4">
                {/* Thumbnail */}
                <div className="relative w-32 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                  {stream.thumbnail_url ? (
                    <Image
                      src={stream.thumbnail_url}
                      alt={stream.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {/* Status badge */}
                  <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                    stream.status === 'live'
                      ? 'bg-red-500 text-white animate-pulse'
                      : stream.status === 'scheduled'
                      ? 'bg-blue-500 text-white'
                      : stream.status === 'ended'
                      ? 'bg-gray-500 text-white'
                      : 'bg-gray-400 text-white'
                  }`}>
                    {stream.status === 'live' && '🔴 LIVE'}
                    {stream.status === 'scheduled' && '📅 Пландалган'}
                    {stream.status === 'ended' && '✅ Бүттү'}
                    {stream.status === 'cancelled' && '❌ Жокко чыгарылды'}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">{stream.title}</h3>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                    {stream.status === 'scheduled' && stream.scheduled_at && (
                      <span>📅 {formatDate(stream.scheduled_at)}</span>
                    )}
                    {stream.status === 'live' && (
                      <>
                        <span>👁 {stream.viewer_count} көрүүчү</span>
                        <span>⏱ {formatDuration(stream.started_at)}</span>
                      </>
                    )}
                    {stream.status === 'ended' && (
                      <>
                        <span>👁 {stream.peak_viewers} макс</span>
                        <span>❤️ {stream.total_likes}</span>
                        <span>💬 {stream.total_comments}</span>
                        <span>⏱ {formatDuration(stream.started_at, stream.ended_at)}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {stream.status === 'scheduled' && (
                    <>
                      <button
                        onClick={() => handleAction(stream.id, 'start')}
                        className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Баштоо
                      </button>
                      <button
                        onClick={() => handleAction(stream.id, 'cancel')}
                        className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Жокко чыгаруу
                      </button>
                    </>
                  )}
                  {stream.status === 'live' && (
                    <>
                      <Link
                        href={`/seller/live/${stream.id}`}
                        className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Башкаруу
                      </Link>
                      <button
                        onClick={() => handleAction(stream.id, 'end')}
                        className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors"
                      >
                        Бүтүрүү
                      </button>
                    </>
                  )}
                  {stream.status === 'ended' && (
                    <Link
                      href={`/live/${stream.id}`}
                      className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Көрүү
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}