'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Livestock } from '@/data/types';
import { useState } from 'react';

interface ProductCardProps {
  product: Livestock;
  onVideoClick?: (e?: React.MouseEvent) => void;
}

// Non-animal categories: feed (9), fodder (10), vitamins (11)
const NON_ANIMAL_CATEGORIES = ['9', '10', '11'];

// Category icons for non-animal products
const getCategoryIcon = (categoryId: string) => {
  switch (categoryId) {
    case '9': return '🌾'; // Жем-чөп (feed)
    case '10': return '🥬'; // Тоют (fodder)
    case '11': return '💊'; // Витамин (vitamins)
    default: return null;
  }
};

export default function ProductCard({ product, onVideoClick }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  // Check if this is a non-animal product
  const isAnimalProduct = !NON_ANIMAL_CATEGORIES.includes(product.categoryId);

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`;
    }
    if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K`;
    }
    return price.toLocaleString('ru-RU');
  };

  const discountAmount = product.originalPrice
    ? product.originalPrice - product.price
    : 0;

  // Format discount amount for display
  const formatDiscount = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)} млн`;
    }
    if (amount >= 1000) {
      return `${Math.round(amount / 1000)}K`;
    }
    return amount.toLocaleString('ru-RU');
  };

  const categoryIcon = getCategoryIcon(product.categoryId);

  return (
    <Link href={`/product/${product.id}`} className="block">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
        {/* Image Container - Compact */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={imageError ? 'https://via.placeholder.com/300x300?text=Сүрөт+жок' : product.images[0]}
            alt={product.title}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />

          {/* BIG Discount Banner - Top */}
          {discountAmount > 0 && (
            <div className="absolute top-0 left-0 right-0">
              <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white py-1.5 px-2 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-black animate-pulse">🔥</span>
                  <span className="text-[10px] font-black tracking-tight">АРЗАН</span>
                </div>
                <div className="bg-white text-red-600 px-1.5 py-0.5 rounded text-[10px] font-black shadow-sm">
                  -{formatDiscount(discountAmount)} сом
                </div>
              </div>
            </div>
          )}

          {/* Negotiable Badge - Special */}
          {product.isNegotiable && !discountAmount && (
            <div className="absolute top-0 left-0 right-0">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-1.5 px-2 flex items-center justify-center gap-1">
                <span className="text-[10px]">💬</span>
                <span className="text-[10px] font-bold">СООДАЛАШАБЫЗ</span>
              </div>
            </div>
          )}

          {/* Urgent Sale Badge */}
          {product.isUrgent && (
            <div className="absolute top-0 left-0 right-0">
              <div className="bg-gradient-to-r from-orange-600 via-red-500 to-pink-500 text-white py-1.5 px-2 flex items-center justify-center gap-1 animate-pulse">
                <span className="text-[10px]">⚡</span>
                <span className="text-[10px] font-black">ШАШЫЛЫШ САТУУ!</span>
              </div>
            </div>
          )}

          {/* Top Left Badge - moved down if discount exists */}
          {product.badges.length > 0 && (
            <div className={`absolute left-1.5 ${discountAmount > 0 || product.isNegotiable || product.isUrgent ? 'top-9' : 'top-1.5'}`}>
              <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded shadow-sm ${
                product.badges[0].type === 'hot' ? 'bg-red-500 text-white' :
                product.badges[0].type === 'new' ? 'bg-green-500 text-white' :
                product.badges[0].type === 'premium' ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-white' :
                product.badges[0].type === 'verified' ? 'bg-blue-500 text-white' :
                'bg-gray-500 text-white'
              }`}>
                {product.badges[0].text}
              </span>
            </div>
          )}

          {/* Video indicator */}
          {product.videoUrl && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onVideoClick?.(e);
              }}
              className="absolute bottom-1.5 right-1.5 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center"
            >
              <svg className="w-3.5 h-3.5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          )}

          {/* Verified badge */}
          {product.isVerified && (
            <div className="absolute bottom-1.5 left-1.5 bg-blue-500 rounded-full p-1">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
          )}
        </div>

        {/* Content - Ultra Compact */}
        <div className="p-1.5">
          {/* Title - 1 line */}
          <h3 className="text-[11px] font-semibold text-gray-900 truncate mb-0.5">
            {product.title.split(' - ')[0]}
          </h3>

          {/* For ANIMAL products: Breed & Gender Row */}
          {isAnimalProduct ? (
            <>
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-[9px] font-medium text-purple-700 bg-purple-100 px-1 rounded">
                  {product.breed}
                </span>
                <span className={`text-[9px] font-bold px-1 rounded ${
                  product.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                }`}>
                  {product.gender === 'male' ? '♂' : '♀'}
                </span>
                <span className="text-[8px] text-gray-500">{product.age}</span>
              </div>

              {/* Lineage Info - Father/Mother */}
              {product.lineage && (
                <div className="flex items-center gap-1 mb-0.5 text-[8px]">
                  <span className="text-amber-600 font-medium">🏆</span>
                  <span className="text-gray-600 truncate">
                    {product.lineage.father?.name && `♂${product.lineage.father.name}`}
                    {product.lineage.father?.name && product.lineage.mother?.name && ' × '}
                    {product.lineage.mother?.name && `♀${product.lineage.mother.name}`}
                  </span>
                </div>
              )}
            </>
          ) : (
            /* For NON-ANIMAL products: Type & Weight Row */
            <div className="flex items-center gap-1 mb-0.5">
              <span className="text-[9px] font-medium text-green-700 bg-green-100 px-1 rounded flex items-center gap-0.5">
                {categoryIcon} {product.breed}
              </span>
              <span className="text-[8px] font-medium text-gray-600 bg-gray-100 px-1 rounded">
                📦 {product.weight}
              </span>
            </div>
          )}

          {/* Price Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-0.5">
              <span className="text-[13px] font-black text-red-600">
                {formatPrice(product.price)}
              </span>
              <span className="text-[8px] text-gray-400">с</span>
              {product.originalPrice && (
                <span className="text-[8px] text-gray-400 line-through ml-0.5">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-0.5 text-[8px] text-gray-400">
              <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              </svg>
              <span className="truncate max-w-[40px]">{product.location.split(' ')[0]}</span>
            </div>
          </div>

          {/* Bottom Icons Row */}
          <div className="flex items-center justify-between mt-1 pt-1 border-t border-gray-100">
            <div className="flex items-center gap-0.5 text-[8px] text-gray-400">
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{product.views > 1000 ? `${(product.views/1000).toFixed(1)}K` : product.views}</span>
            </div>
            <div className="flex items-center gap-0.5">
              {product.hasDocuments && (
                <span className="text-[9px]" title="Документ бар">📄</span>
              )}
              {product.hasDelivery && (
                <span className="text-[9px]" title="Жеткирүү бар">🚚</span>
              )}
              {product.isVerified && (
                <span className="text-[9px]" title="Текшерилген">✅</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}