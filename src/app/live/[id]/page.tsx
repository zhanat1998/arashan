'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase/client';

interface Livestream {
  id: string;
  title: string;
  description?: string;
  status: 'live' | 'ended' | 'scheduled';
  viewer_count: number;
  total_likes: number;
  started_at?: string;
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

interface Product {
  id: string;
  display_order: number;
  live_price?: number;
  is_featured: boolean;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
  };
}

interface Message {
  id: string;
  message: string;
  message_type: string;
  created_at: string;
  user: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface FloatingLike {
  id: number;
  emoji: string;
  x: number;
}

export default function LiveViewPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = getSupabaseClient();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const likeIdRef = useRef(0);

  const [livestream, setLivestream] = useState<Livestream | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [floatingLikes, setFloatingLikes] = useState<FloatingLike[]>([]);
  const [isLiking, setIsLiking] = useState(false);

  const livestreamId = params.id as string;

  // Fetch livestream data
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/live/${livestreamId}`);
      const data = await res.json();

      if (res.ok) {
        setLivestream(data.livestream);
        setProducts(data.products || []);
        setMessages(data.messages || []);
      } else {
        router.push('/live');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [livestreamId, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Realtime subscriptions
  useEffect(() => {
    if (!livestreamId) return;

    // Messages subscription
    const messagesChannel = supabase
      .channel(`live-messages-${livestreamId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'livestream_messages',
          filter: `livestream_id=eq.${livestreamId}`,
        },
        async (payload) => {
          const newMsg = payload.new as any;
          // Fetch user info
          const { data: user } = await supabase
            .from('users')
            .select('id, full_name, avatar_url')
            .eq('id', newMsg.user_id)
            .single();

          setMessages((prev) => [
            ...prev.slice(-99), // Keep last 100 messages
            { ...newMsg, user },
          ]);
        }
      )
      .subscribe();

    // Likes subscription
    const likesChannel = supabase
      .channel(`live-likes-${livestreamId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'livestream_likes',
          filter: `livestream_id=eq.${livestreamId}`,
        },
        (payload) => {
          const newLike = payload.new as any;
          addFloatingLike(newLike.emoji || '❤️');
          // Update total likes
          setLivestream((prev) =>
            prev ? { ...prev, total_likes: prev.total_likes + 1 } : prev
          );
        }
      )
      .subscribe();

    // Viewer count subscription
    const viewerChannel = supabase
      .channel(`live-viewers-${livestreamId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'livestreams',
          filter: `id=eq.${livestreamId}`,
        },
        (payload) => {
          const updated = payload.new as any;
          setLivestream((prev) =>
            prev
              ? {
                  ...prev,
                  viewer_count: updated.viewer_count,
                  status: updated.status,
                }
              : prev
          );
        }
      )
      .subscribe();

    // Cleanup - notify leave
    return () => {
      fetch(`/api/live/${livestreamId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'leave' }),
      }).catch(() => {});

      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(viewerChannel);
    };
  }, [livestreamId, supabase]);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add floating like animation
  const addFloatingLike = (emoji: string) => {
    const id = likeIdRef.current++;
    const x = Math.random() * 60 + 20; // 20-80% from left

    setFloatingLikes((prev) => [...prev, { id, emoji, x }]);

    // Remove after animation
    setTimeout(() => {
      setFloatingLikes((prev) => prev.filter((l) => l.id !== id));
    }, 2000);
  };

  // Send message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || sending) return;

    setSending(true);
    const message = inputMessage;
    setInputMessage('');

    try {
      await fetch(`/api/live/${livestreamId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'message', message }),
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSending(false);
    }
  };

  // Send like
  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);

    // Instant feedback
    addFloatingLike('❤️');

    try {
      await fetch(`/api/live/${livestreamId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'like', emoji: '❤️' }),
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setTimeout(() => setIsLiking(false), 300);
    }
  };

  const formatDuration = (startedAt?: string) => {
    if (!startedAt) return '0:00';
    const diff = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!livestream) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-xl mb-4">Эфир табылган жок</p>
          <Link href="/live" className="text-red-400 underline">
            Эфирлерге кайтуу
          </Link>
        </div>
      </div>
    );
  }

  const featuredProduct = products.find((p) => p.is_featured);

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden">
      {/* Video Background (placeholder) */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black">
        {/* This would be the actual video stream */}
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-white/50">Түз эфир</p>
          </div>
        </div>
      </div>

      {/* Floating Likes Animation */}
      <div className="absolute bottom-32 right-4 w-16 h-64 pointer-events-none overflow-hidden">
        {floatingLikes.map((like) => (
          <div
            key={like.id}
            className="absolute text-3xl animate-float-up"
            style={{
              left: `${like.x}%`,
              bottom: 0,
              animation: 'floatUp 2s ease-out forwards',
            }}
          >
            {like.emoji}
          </div>
        ))}
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10 bg-gradient-to-b from-black/60 to-transparent">
        {/* Host Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 bg-black/30 rounded-full backdrop-blur-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <Link
            href={`/shop/${livestream.shop.id}`}
            className="flex items-center gap-2 px-3 py-1.5 bg-black/30 backdrop-blur-sm rounded-full"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-600">
              {livestream.shop.logo && (
                <Image
                  src={livestream.shop.logo}
                  alt={livestream.shop.name}
                  width={32}
                  height={32}
                  className="object-cover"
                />
              )}
            </div>
            <span className="font-medium text-sm">{livestream.shop.name}</span>
          </Link>
        </div>

        {/* Live Stats */}
        <div className="flex items-center gap-2">
          {livestream.status === 'live' && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-red-500 rounded-full animate-pulse">
              <span className="w-2 h-2 bg-white rounded-full" />
              <span className="text-xs font-semibold">LIVE</span>
            </div>
          )}
          <div className="flex items-center gap-1 px-3 py-1.5 bg-black/30 backdrop-blur-sm rounded-full">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-medium">{livestream.viewer_count}</span>
          </div>
        </div>
      </div>

      {/* Featured Product */}
      {featuredProduct && (
        <div className="absolute top-20 left-4 right-4 z-10">
          <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-3 flex items-center gap-3 animate-in slide-in-from-top duration-300">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-700 flex-shrink-0">
              {featuredProduct.product.images?.[0] && (
                <Image
                  src={featuredProduct.product.images[0]}
                  alt={featuredProduct.product.name}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{featuredProduct.product.name}</p>
              <p className="text-red-400 font-bold">
                {featuredProduct.live_price || featuredProduct.product.price} сом
              </p>
            </div>
            <Link
              href={`/product/${featuredProduct.product.id}`}
              className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-xl flex-shrink-0"
            >
              Алуу
            </Link>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="absolute bottom-40 left-0 right-20 h-48 px-4 overflow-hidden">
        <div className="flex flex-col justify-end h-full space-y-2">
          {messages.slice(-20).map((msg) => (
            <div
              key={msg.id}
              className="flex items-start gap-2 animate-in slide-in-from-left duration-200"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-600 flex-shrink-0">
                {msg.user?.avatar_url && (
                  <Image
                    src={msg.user.avatar_url}
                    alt=""
                    width={24}
                    height={24}
                    className="object-cover"
                  />
                )}
              </div>
              <div className="bg-black/40 backdrop-blur-sm rounded-xl px-3 py-1.5 max-w-[80%]">
                <span className="text-xs text-yellow-400 font-medium">
                  {msg.user?.full_name || 'User'}
                </span>
                <p className="text-sm break-words">{msg.message}</p>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          {/* Chat Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Билдирүү жазыңыз..."
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-white/30"
            />
            <button
              onClick={handleSendMessage}
              disabled={sending || !inputMessage.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>

          {/* Products Button */}
          <button
            onClick={() => setShowProducts(!showProducts)}
            className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center relative"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {products.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-xs font-bold rounded-full flex items-center justify-center">
                {products.length}
              </span>
            )}
          </button>

          {/* Like Button */}
          <button
            onClick={handleLike}
            className={`w-12 h-12 bg-red-500 rounded-full flex items-center justify-center transition-transform ${
              isLiking ? 'scale-90' : 'active:scale-90'
            }`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Products Drawer */}
      {showProducts && (
        <>
          <div
            className="absolute inset-0 bg-black/50 z-20"
            onClick={() => setShowProducts(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white text-gray-800 rounded-t-3xl z-30 max-h-[60vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-lg">Продукттар ({products.length})</h3>
              <button
                onClick={() => setShowProducts(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto max-h-[50vh] p-4 space-y-3">
              {products.map((item) => (
                <Link
                  key={item.id}
                  href={`/product/${item.product.id}`}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    item.is_featured
                      ? 'bg-red-50 border-2 border-red-500'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                    {item.product.images?.[0] && (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.product.name}</p>
                    <p className="text-red-500 font-bold">
                      {item.live_price || item.product.price} сом
                    </p>
                  </div>
                  {item.is_featured && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                      LIVE
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      {/* CSS for floating animation */}
      <style jsx global>{`
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          50% {
            opacity: 1;
            transform: translateY(-100px) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translateY(-200px) scale(0.8);
          }
        }
      `}</style>
    </div>
  );
}