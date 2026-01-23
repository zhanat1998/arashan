'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/data/types';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  onVideoClick?: (e?: React.MouseEvent) => void;
}

export default function ProductCard({ product, onVideoClick }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  const formatPrice = (price: number) => price.toLocaleString('ru-RU');

  const discountPercent = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const formatSold = (count: number) => {
    if (count >= 10000) return `${(count / 10000).toFixed(1)}万`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <Link href={`/product/${product.id}`} className="block">
      <div className="bg-white rounded-lg overflow-hidden border border-gray-100 hover:shadow-lg hover:border-orange-200 transition-all duration-200 md:rounded-xl">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100 md:aspect-[4/5]">
          <Image
            src={imageError ? 'https://via.placeholder.com/300x300?text=Сүрөт+жок' : product.images[0]}
            alt={product.title}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />

          {/* Discount Banner */}
          {discountPercent > 0 && (
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-red-600 to-orange-500 text-white py-0.5 px-1.5 md:py-1 md:px-2 flex items-center justify-between">
              <span className="text-[8px] md:text-xs font-bold">🔥 АРЗАН</span>
              <span className="bg-white text-red-600 px-1 md:px-1.5 text-[8px] md:text-xs font-bold rounded">-{discountPercent}%</span>
            </div>
          )}

          {/* Group Buy Banner */}
          {product.isGroupBuy && !discountPercent && (
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-orange-500 to-pink-500 text-white py-0.5 px-1.5 md:py-1 md:px-2 text-center">
              <span className="text-[8px] md:text-xs font-bold">👥 БИРГЕ -{Math.round((1 - (product.groupBuyPrice || product.price) / product.price) * 100)}%</span>
            </div>
          )}

          {/* Flash Sale */}
          {product.isFlashSale && !discountPercent && !product.isGroupBuy && (
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-yellow-500 to-red-500 text-white py-0.5 px-1.5 md:py-1 md:px-2 text-center animate-pulse">
              <span className="text-[8px] md:text-xs font-bold">⚡ FLASH SALE</span>
            </div>
          )}

          {/* Badges */}
          {product.badges.length > 0 && (
            <div className={`absolute left-0.5 md:left-1 flex flex-col gap-0.5 ${discountPercent > 0 || product.isGroupBuy || product.isFlashSale ? 'top-6 md:top-8' : 'top-0.5 md:top-1'}`}>
              {product.badges.slice(0, 2).map((badge, idx) => (
                <span key={idx} className={`px-1 py-0.5 md:px-1.5 md:py-0.5 text-[7px] md:text-[10px] font-bold rounded ${
                  badge.type === 'hot' ? 'bg-red-500 text-white' :
                  badge.type === 'new' ? 'bg-green-500 text-white' :
                  badge.type === 'freeship' ? 'bg-teal-500 text-white' :
                  'bg-gray-500 text-white'
                }`}>
                  {badge.text}
                </span>
              ))}
            </div>
          )}

          {/* Video */}
          {product.videoUrl && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onVideoClick?.(e); }}
              className="absolute bottom-0.5 right-0.5 md:bottom-2 md:right-2 w-6 h-6 md:w-8 md:h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-colors"
            >
              <svg className="w-3 h-3 md:w-4 md:h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </button>
          )}

          {/* Official */}
          {product.shop.isOfficialStore && (
            <div className="absolute bottom-0.5 left-0.5 md:bottom-2 md:left-2 bg-orange-500 rounded px-1 py-0.5 md:px-1.5 md:py-1 flex items-center gap-0.5">
              <svg className="w-2 h-2 md:w-3 md:h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
              <span className="text-[7px] md:text-[10px] text-white font-bold">Official</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-2 md:p-3">
          <h3 className="text-xs md:text-sm font-medium text-gray-900 line-clamp-2 min-h-[32px] md:min-h-[40px] leading-snug">{product.title}</h3>

          {/* Brand & Shop */}
          <div className="flex items-center gap-1 mt-1">
            {product.brand && (
              <span className="text-[10px] md:text-xs font-medium text-blue-700 bg-blue-50 px-1 md:px-1.5 rounded">{product.brand}</span>
            )}
            <span className="text-[9px] md:text-xs text-gray-400 truncate">{product.shop.name}</span>
          </div>

          {/* Price */}
          <div className="flex items-end justify-between mt-1 md:mt-2">
            <div className="flex items-baseline gap-0.5">
              <span className="text-[10px] md:text-sm text-red-600">¥</span>
              <span className="text-base md:text-lg font-bold text-red-600">
                {formatPrice(product.isGroupBuy && product.groupBuyPrice ? product.groupBuyPrice : product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-[10px] md:text-xs text-gray-400 line-through ml-0.5">¥{formatPrice(product.originalPrice)}</span>
              )}
            </div>
            {product.isGroupBuy && (
              <span className="text-[9px] md:text-xs text-orange-600 font-medium bg-orange-50 px-1 md:px-1.5 rounded">{product.groupBuyMinPeople}+</span>
            )}
          </div>

          {/* Features */}
          <div className="flex items-center gap-1 flex-wrap mt-1">
            {product.hasFreeship && (
              <span className="text-[9px] md:text-xs text-teal-600 font-medium bg-teal-50 px-1 md:px-1.5 rounded">🚚 Акысыз</span>
            )}
            {product.colors && product.colors.length > 1 && (
              <span className="text-[9px] md:text-xs text-purple-600 bg-purple-50 px-1 md:px-1.5 rounded">{product.colors.length} түс</span>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-1 md:gap-2 text-[9px] md:text-xs text-gray-500 mt-1">
            <span>⭐{product.rating}</span>
            <span className="text-gray-300">|</span>
            <span>{formatSold(product.soldCount)} сатылды</span>
          </div>
        </div>
      </div>
    </Link>
  );
}