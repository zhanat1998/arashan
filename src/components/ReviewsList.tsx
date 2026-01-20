'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

interface Review {
  id: string;
  user_id: string;
  product_id?: string;
  video_id?: string;
  rating: number;
  content?: string;
  images: string[];
  selected_options?: Record<string, string>;
  is_anonymous: boolean;
  is_verified_purchase: boolean;
  helpful_count: number;
  reply_count: number;
  created_at: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  replies?: {
    id: string;
    content: string;
    created_at: string;
    shop?: {
      id: string;
      name: string;
      logo?: string;
    };
  }[];
}

interface ReviewStats {
  total: number;
  average: string;
  distribution: {
    rating: number;
    count: number;
    percentage: number;
  }[];
}

interface ReviewsListProps {
  productId?: string;
  videoId?: string;
  showWriteReview?: boolean;
  onWriteReviewClick?: () => void;
}

export default function ReviewsList({
  productId,
  videoId,
  showWriteReview = false,
  onWriteReviewClick
}: ReviewsListProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1' | 'images'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'helpful' | 'highest' | 'lowest'>('newest');
  const [expandedImages, setExpandedImages] = useState<string[] | null>(null);
  const [helpfulIds, setHelpfulIds] = useState<Set<string>>(new Set());

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sort: sortBy
      });

      if (productId) params.append('product_id', productId);
      if (videoId) params.append('video_id', videoId);
      if (filter !== 'all' && filter !== 'images') params.append('rating', filter);
      if (filter === 'images') params.append('with_images', 'true');

      const response = await fetch(`/api/reviews?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setReviews(data.reviews || []);
        setStats(data.stats);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  }, [productId, videoId, page, filter, sortBy]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleHelpful = async (reviewId: string) => {
    if (!user) return;

    const isHelpful = helpfulIds.has(reviewId);

    try {
      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: isHelpful ? 'DELETE' : 'POST'
      });

      if (response.ok) {
        setHelpfulIds(prev => {
          const newSet = new Set(prev);
          if (isHelpful) {
            newSet.delete(reviewId);
          } else {
            newSet.add(reviewId);
          }
          return newSet;
        });

        // Update review count locally
        setReviews(prev => prev.map(r => {
          if (r.id === reviewId) {
            return {
              ...r,
              helpful_count: r.helpful_count + (isHelpful ? -1 : 1)
            };
          }
          return r;
        }));
      }
    } catch (error) {
      console.error('Error toggling helpful:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Бүгүн';
    if (days === 1) return 'Кечээ';
    if (days < 7) return `${days} күн мурун`;
    if (days < 30) return `${Math.floor(days / 7)} апта мурун`;
    if (days < 365) return `${Math.floor(days / 30)} ай мурун`;
    return `${Math.floor(days / 365)} жыл мурун`;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-3.5 h-3.5 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white">
      {/* Stats Header */}
      {stats && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-4">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-800">{stats.average}</div>
              <div className="flex justify-center mt-1">
                {renderStars(Math.round(parseFloat(stats.average)))}
              </div>
              <div className="text-xs text-gray-500 mt-1">{stats.total} пикир</div>
            </div>

            {/* Distribution */}
            <div className="flex-1 space-y-1">
              {stats.distribution.slice().reverse().map((item) => (
                <div key={item.rating} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-3">{item.rating}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-8">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Write Review Button */}
          {showWriteReview && (
            <button
              onClick={onWriteReviewClick}
              className="w-full mt-4 py-2.5 border-2 border-orange-500 text-orange-500 rounded-lg text-sm font-medium hover:bg-orange-50 transition-colors"
            >
              + Пикир жазуу
            </button>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto border-b border-gray-100">
        {[
          { key: 'all', label: 'Баары' },
          { key: 'images', label: 'Сүрөттүү' },
          { key: '5', label: '5★' },
          { key: '4', label: '4★' },
          { key: '3', label: '3★' },
          { key: '2', label: '2★' },
          { key: '1', label: '1★' },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => { setFilter(item.key as typeof filter); setPage(1); }}
            className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${
              filter === item.key
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="px-4 py-2 flex justify-end">
        <select
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value as typeof sortBy); setPage(1); }}
          className="text-xs text-gray-600 bg-transparent focus:outline-none"
        >
          <option value="newest">Жаңы</option>
          <option value="helpful">Пайдалуу</option>
          <option value="highest">Жогорку рейтинг</option>
          <option value="lowest">Төмөн рейтинг</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="divide-y divide-gray-100">
        {isLoading ? (
          <div className="py-8 text-center">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-500 text-sm mt-2">Жүктөлүүдө...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-8 text-center">
            <span className="text-4xl">📝</span>
            <p className="text-gray-500 text-sm mt-2">Пикир жок</p>
            {showWriteReview && (
              <button
                onClick={onWriteReviewClick}
                className="mt-3 text-orange-500 text-sm font-medium"
              >
                Биринчи пикир жазыңыз!
              </button>
            )}
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="p-4">
              {/* User Info */}
              <div className="flex items-center gap-2 mb-2">
                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                  {review.is_anonymous ? (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">👤</div>
                  ) : review.user?.avatar ? (
                    <Image src={review.user.avatar} alt="" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      {review.user?.name?.[0] || '?'}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800">
                      {review.is_anonymous ? 'Аноним' : review.user?.name || 'Колдонуучу'}
                    </span>
                    {review.is_verified_purchase && (
                      <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded">
                        ✓ Сатып алган
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {renderStars(review.rating)}
                    <span className="text-xs text-gray-400">{formatDate(review.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Selected Options */}
              {review.selected_options && Object.keys(review.selected_options).length > 0 && (
                <div className="mb-2 text-xs text-gray-500">
                  {Object.entries(review.selected_options).map(([key, value]) => (
                    <span key={key} className="mr-2">{key}: {value}</span>
                  ))}
                </div>
              )}

              {/* Content */}
              {review.content && (
                <p className="text-sm text-gray-700 mb-3 whitespace-pre-line">{review.content}</p>
              )}

              {/* Images */}
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mb-3 overflow-x-auto">
                  {review.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setExpandedImages(review.images)}
                      className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0"
                    >
                      <Image src={img} alt="" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Helpful Button */}
              <button
                onClick={() => handleHelpful(review.id)}
                className={`flex items-center gap-1 text-xs ${
                  helpfulIds.has(review.id) ? 'text-orange-500' : 'text-gray-400'
                }`}
              >
                <svg className="w-4 h-4" fill={helpfulIds.has(review.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                <span>Пайдалуу ({review.helpful_count})</span>
              </button>

              {/* Shop Replies */}
              {review.replies && review.replies.length > 0 && (
                <div className="mt-3 pl-4 border-l-2 border-orange-200">
                  {review.replies.map((reply) => (
                    <div key={reply.id} className="bg-orange-50 rounded-lg p-3 mt-2">
                      <div className="flex items-center gap-2 mb-1">
                        {reply.shop?.logo && (
                          <div className="relative w-5 h-5 rounded overflow-hidden">
                            <Image src={reply.shop.logo} alt="" fill className="object-cover" />
                          </div>
                        )}
                        <span className="text-xs font-medium text-orange-600">
                          {reply.shop?.name || 'Дүкөн'} жооп берди
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 flex justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 text-sm border border-gray-200 rounded disabled:opacity-50"
          >
            ←
          </button>
          <span className="px-3 py-1 text-sm text-gray-600">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 text-sm border border-gray-200 rounded disabled:opacity-50"
          >
            →
          </button>
        </div>
      )}

      {/* Image Modal */}
      {expandedImages && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setExpandedImages(null)}
        >
          <button
            onClick={() => setExpandedImages(null)}
            className="absolute top-4 right-4 text-white p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex gap-2 overflow-x-auto p-4">
            {expandedImages.map((img, index) => (
              <div key={index} className="relative w-[80vw] h-[80vh] shrink-0">
                <Image src={img} alt="" fill className="object-contain" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
