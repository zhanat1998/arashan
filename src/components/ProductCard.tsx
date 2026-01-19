'use client';

import Image from 'next/image';
import { Livestock } from '@/data/types';
import { useState } from 'react';

interface ProductCardProps {
  product: Livestock;
  onVideoClick?: (e?: React.MouseEvent) => void;
}

export default function ProductCard({ product, onVideoClick }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} млн`;
    }
    return price.toLocaleString('ru-RU');
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'premium':
        return 'bg-gradient-to-r from-amber-500 to-yellow-400 text-white';
      case 'top':
        return 'bg-gradient-to-r from-purple-600 to-pink-500 text-white';
      case 'hot':
        return 'bg-gradient-to-r from-red-500 to-orange-500 text-white';
      case 'new':
        return 'bg-gradient-to-r from-green-500 to-emerald-400 text-white';
      case 'sale':
        return 'bg-gradient-to-r from-red-600 to-red-500 text-white';
      case 'verified':
        return 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white';
      case 'urgent':
        return 'bg-gradient-to-r from-red-700 to-red-600 text-white animate-pulse';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Image
          src={imageError ? 'https://via.placeholder.com/400x300?text=Сүрөт+жок' : product.images[0]}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          onError={() => setImageError(true)}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1 max-w-[70%]">
          {product.badges.slice(0, 2).map((badge, index) => (
            <span
              key={index}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-full shadow-lg ${getBadgeStyle(badge.type)}`}
            >
              {badge.text}
            </span>
          ))}
        </div>

        {/* Premium Crown */}
        {product.isPremium && (
          <div className="absolute top-2 right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-sm">👑</span>
          </div>
        )}

        {/* Video Button */}
        {product.videoUrl && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onVideoClick?.(e);
            }}
            className="absolute bottom-2 right-2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all"
          >
            <svg className="w-5 h-5 text-red-500 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        )}

        {/* Like Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className={`absolute bottom-2 left-2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${
            isLiked ? 'bg-red-500 scale-110' : 'bg-white/90 backdrop-blur-sm hover:bg-white'
          }`}
        >
          <svg
            className={`w-5 h-5 transition-colors ${isLiked ? 'text-white' : 'text-gray-600'}`}
            fill={isLiked ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>

        {/* Verified Badge */}
        {product.isVerified && (
          <div className="absolute top-12 right-2 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            <span>Текшерилген</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Breed & Gender */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
            {product.breed}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            product.gender === 'male'
              ? 'bg-blue-50 text-blue-600'
              : 'bg-pink-50 text-pink-600'
          }`}>
            {product.gender === 'male' ? '♂ Эркек' : '♀ Ургаачы'}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 min-h-[40px] mb-2 group-hover:text-purple-700 transition-colors">
          {product.title}
        </h3>

        {/* Stats Row */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {product.age}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
            {product.weight}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <span>{product.location}</span>
        </div>

        {/* Price Section */}
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              <span className="text-xs font-medium text-gray-500">сом</span>
            </div>
            {product.originalPrice && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
                <span className="text-xs font-bold text-red-500">-{discount}%</span>
              </div>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
            <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            <span className="text-xs font-bold text-amber-600">{product.rating}</span>
          </div>
        </div>

        {/* Features Icons */}
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-100 flex-wrap">
          {product.hasDocuments && (
            <div className="flex items-center gap-1 text-[10px] text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
              </svg>
              <span>Документ</span>
            </div>
          )}
          {product.hasDelivery && (
            <div className="flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
              </svg>
              <span>Жеткирүү</span>
            </div>
          )}
          {product.isNegotiable && (
            <div className="flex items-center gap-1 text-[10px] text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
              <span>Келишим</span>
            </div>
          )}
        </div>

        {/* Seller Info */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            <Image
              src={product.seller.avatar}
              alt={product.seller.name}
              fill
              className="object-cover"
            />
            {product.seller.isVerified && (
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-800 truncate">{product.seller.name}</p>
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              <span className="text-[10px] text-gray-500">{product.seller.rating} • {product.seller.salesCount} сатуу</span>
            </div>
          </div>
        </div>

        {/* Views */}
        <div className="flex items-center justify-between mt-2 text-[10px] text-gray-400">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {product.views} көрүү
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            {product.likes}
          </span>
        </div>
      </div>
    </div>
  );
}