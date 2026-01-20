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
      <div className="bg-white rounded-lg overflow-hidden border border-gray-100">
        {/* Image */}
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
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-red-600 to-orange-500 text-white py-0.5 px-1.5 flex items-center justify-between">
              <span className="text-[8px] font-bold">🔥 АРЗАН</span>
              <span className="bg-white text-red-600 px-1 text-[8px] font-bold rounded">-{discountPercent}%</span>
            </div>
          )}

          {/* Group Buy Banner */}
          {product.isGroupBuy && !discountPercent && (
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-orange-500 to-pink-500 text-white py-0.5 px-1.5 text-center">
              <span className="text-[8px] font-bold">👥 БИРГЕ -{Math.round((1 - (product.groupBuyPrice || product.price) / product.price) * 100)}%</span>
            </div>
          )}

          {/* Flash Sale */}
          {product.isFlashSale && !discountPercent && !product.isGroupBuy && (
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-yellow-500 to-red-500 text-white py-0.5 px-1.5 text-center animate-pulse">
              <span className="text-[8px] font-bold">⚡ FLASH SALE</span>
            </div>
          )}

          {/* Badges */}
          {product.badges.length > 0 && (
            <div className={`absolute left-0.5 flex flex-col gap-0.5 ${discountPercent > 0 || product.isGroupBuy || product.isFlashSale ? 'top-6' : 'top-0.5'}`}>
              {product.badges.slice(0, 2).map((badge, idx) => (
                <span key={idx} className={`px-1 py-0.5 text-[7px] font-bold rounded ${
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
              className="absolute bottom-0.5 right-0.5 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center"
            >
              <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </button>
          )}

          {/* Official */}
          {product.shop.isOfficialStore && (
            <div className="absolute bottom-0.5 left-0.5 bg-orange-500 rounded px-1 py-0.5 flex items-center gap-0.5">
              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
              <span className="text-[7px] text-white font-bold">Official</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-1.5">
          <h3 className="text-[10px] font-medium text-gray-900 line-clamp-2 min-h-[26px] leading-tight">{product.title}</h3>

          {/* Brand & Shop */}
          <div className="flex items-center gap-1 mt-0.5">
            {product.brand && (
              <span className="text-[8px] font-medium text-blue-700 bg-blue-50 px-1 rounded">{product.brand}</span>
            )}
            <span className="text-[7px] text-gray-400 truncate">{product.shop.name}</span>
          </div>

          {/* Price */}
          <div className="flex items-end justify-between mt-1">
            <div className="flex items-baseline gap-0.5">
              <span className="text-[8px] text-red-600">¥</span>
              <span className="text-sm font-bold text-red-600">
                {formatPrice(product.isGroupBuy && product.groupBuyPrice ? product.groupBuyPrice : product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-[8px] text-gray-400 line-through ml-0.5">¥{formatPrice(product.originalPrice)}</span>
              )}
            </div>
            {product.isGroupBuy && (
              <span className="text-[7px] text-orange-600 font-medium bg-orange-50 px-1 rounded">{product.groupBuyMinPeople}+</span>
            )}
          </div>

          {/* Features */}
          <div className="flex items-center gap-1 flex-wrap mt-0.5">
            {product.hasFreeship && (
              <span className="text-[7px] text-teal-600 font-medium bg-teal-50 px-1 rounded">🚚 Акысыз</span>
            )}
            {product.colors && product.colors.length > 1 && (
              <span className="text-[7px] text-purple-600 bg-purple-50 px-1 rounded">{product.colors.length} түс</span>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between mt-1 pt-1 border-t border-gray-50">
            <div className="flex items-center gap-0.5 text-[7px] text-gray-500">
              <span>⭐{product.rating}</span>
              <span className="text-gray-300">|</span>
              <span>{formatSold(product.soldCount)} сатылды</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}