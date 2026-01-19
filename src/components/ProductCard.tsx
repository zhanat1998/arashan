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

  const formatPrice = (price: number) => {
    return price.toLocaleString('ru-RU');
  };

  const discountPercent = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const formatSold = (count: number) => {
    if (count >= 10000) {
      return `${(count / 10000).toFixed(1)}万`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <Link href={`/product/${product.id}`} className="block">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={imageError ? 'https://via.placeholder.com/300x300?text=Сүрөт+жок' : product.images[0]}
            alt={product.title}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />

          {/* Discount Banner */}
          {discountPercent > 0 && (
            <div className="absolute top-0 left-0 right-0">
              <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white py-1.5 px-2 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-black animate-pulse">🔥</span>
                  <span className="text-[10px] font-black tracking-tight">АРЗАН</span>
                </div>
                <div className="bg-white text-red-600 px-1.5 py-0.5 rounded text-[10px] font-black shadow-sm">
                  -{discountPercent}%
                </div>
              </div>
            </div>
          )}

          {/* Group Buy Banner */}
          {product.isGroupBuy && !discountPercent && (
            <div className="absolute top-0 left-0 right-0">
              <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white py-1.5 px-2 flex items-center justify-center gap-1">
                <span className="text-[10px]">👥</span>
                <span className="text-[10px] font-bold">БИРГЕ АЛУУ -{Math.round((1 - (product.groupBuyPrice || product.price) / product.price) * 100)}%</span>
              </div>
            </div>
          )}

          {/* Flash Sale Banner */}
          {product.isFlashSale && !discountPercent && !product.isGroupBuy && (
            <div className="absolute top-0 left-0 right-0">
              <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white py-1.5 px-2 flex items-center justify-center gap-1 animate-pulse">
                <span className="text-[10px]">⚡</span>
                <span className="text-[10px] font-black">FLASH SALE!</span>
              </div>
            </div>
          )}

          {/* Badges */}
          {product.badges.length > 0 && (
            <div className={`absolute left-1.5 flex flex-col gap-0.5 ${discountPercent > 0 || product.isGroupBuy || product.isFlashSale ? 'top-9' : 'top-1.5'}`}>
              {product.badges.slice(0, 2).map((badge, idx) => (
                <span key={idx} className={`px-1.5 py-0.5 text-[9px] font-bold rounded shadow-sm ${
                  badge.type === 'hot' ? 'bg-red-500 text-white' :
                  badge.type === 'new' ? 'bg-green-500 text-white' :
                  badge.type === 'sale' ? 'bg-orange-500 text-white' :
                  badge.type === 'groupbuy' ? 'bg-pink-500 text-white' :
                  badge.type === 'freeship' ? 'bg-teal-500 text-white' :
                  badge.type === 'flash' ? 'bg-yellow-500 text-white' :
                  badge.type === 'top' ? 'bg-purple-500 text-white' :
                  'bg-gray-500 text-white'
                }`}>
                  {badge.text}
                </span>
              ))}
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

          {/* Official Store badge */}
          {product.shop.isOfficialStore && (
            <div className="absolute bottom-1.5 left-1.5 bg-orange-500 rounded px-1 py-0.5 flex items-center gap-0.5">
              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              <span className="text-[8px] text-white font-bold">Официалдуу</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-1.5">
          {/* Title */}
          <h3 className="text-[11px] font-semibold text-gray-900 line-clamp-2 mb-0.5 min-h-[28px]">
            {product.title}
          </h3>

          {/* Brand & Shop Row */}
          <div className="flex items-center gap-1 mb-1">
            {product.brand && (
              <span className="text-[9px] font-medium text-blue-700 bg-blue-50 px-1 rounded">
                {product.brand}
              </span>
            )}
            <span className="text-[8px] text-gray-500 truncate">
              {product.shop.name}
            </span>
          </div>

          {/* Price Row */}
          <div className="flex items-end justify-between mb-1">
            <div className="flex items-baseline gap-0.5">
              <span className="text-[9px] text-red-600">¥</span>
              <span className="text-[15px] font-black text-red-600">
                {formatPrice(product.isGroupBuy && product.groupBuyPrice ? product.groupBuyPrice : product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-[9px] text-gray-400 line-through ml-0.5">
                  ¥{formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            {product.isGroupBuy && (
              <span className="text-[8px] text-orange-600 font-medium bg-orange-50 px-1 rounded">
                {product.groupBuyMinPeople}+ адам
              </span>
            )}
          </div>

          {/* Features Row */}
          <div className="flex items-center gap-1 flex-wrap mb-1">
            {product.hasFreeship && (
              <span className="text-[8px] text-teal-600 font-medium bg-teal-50 px-1 rounded">
                🚚 Акысыз
              </span>
            )}
            {product.colors && product.colors.length > 1 && (
              <span className="text-[8px] text-purple-600 bg-purple-50 px-1 rounded">
                {product.colors.length} түс
              </span>
            )}
            {product.sizes && product.sizes.length > 1 && (
              <span className="text-[8px] text-blue-600 bg-blue-50 px-1 rounded">
                {product.sizes.length} размер
              </span>
            )}
          </div>

          {/* Bottom Stats Row */}
          <div className="flex items-center justify-between pt-1 border-t border-gray-100">
            <div className="flex items-center gap-0.5 text-[8px] text-gray-500">
              <span>⭐ {product.rating}</span>
              <span className="text-gray-300">|</span>
              <span>Сатылды {formatSold(product.soldCount)}</span>
            </div>
            <div className="flex items-center gap-0.5 text-[8px] text-gray-400">
              <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              </svg>
              <span>{product.shop.location}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}