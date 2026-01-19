'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { shops, products } from '@/data/products';

export default function ShopPage() {
  const params = useParams();
  const router = useRouter();
  const shopId = params.id as string;

  const shop = shops.find(s => s.id === shopId);
  const shopProducts = products.filter(p => p.shop.id === shopId);

  const [activeTab, setActiveTab] = useState<'products' | 'new' | 'hot'>('products');
  const [isFollowing, setIsFollowing] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'sales'>('default');

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl">🏪</span>
          <p className="text-gray-500 mt-4">Дүкөн табылган жок</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-full"
          >
            Артка кайтуу
          </button>
        </div>
      </div>
    );
  }

  let displayProducts = [...shopProducts];
  if (activeTab === 'new') {
    displayProducts = displayProducts.slice(0, 20);
  } else if (activeTab === 'hot') {
    displayProducts = displayProducts.sort((a, b) => b.soldCount - a.soldCount).slice(0, 20);
  }

  // Sort
  if (sortBy === 'price-asc') {
    displayProducts = displayProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    displayProducts = displayProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'sales') {
    displayProducts = displayProducts.sort((a, b) => b.soldCount - a.soldCount);
  }

  const formatNumber = (num: number) => {
    if (num >= 10000) return `${(num / 1000).toFixed(0)}k`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white">
        {/* Navigation */}
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <button className="p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Shop Info */}
        <div className="px-4 pb-6">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/30">
                <Image
                  src={shop.logo}
                  alt={shop.name}
                  width={80}
                  height={80}
                  className="object-cover"
                />
              </div>
              {shop.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{shop.name}</h1>
                {shop.isOfficialStore && (
                  <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded">
                    OFFICIAL
                  </span>
                )}
              </div>
              <p className="text-white/80 text-sm mt-1">📍 {shop.location}</p>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span>⭐ {shop.rating}</span>
                <span>{formatNumber(shop.followersCount)} жазылуучу</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 mt-4 bg-white/10 rounded-xl p-3">
            <div className="text-center">
              <p className="text-lg font-bold">{shop.productsCount}</p>
              <p className="text-xs text-white/70">Продукт</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{formatNumber(shop.salesCount)}</p>
              <p className="text-xs text-white/70">Сатылды</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{shop.responseRate}%</p>
              <p className="text-xs text-white/70">Жооп</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{shop.responseTime}</p>
              <p className="text-xs text-white/70">Убакыт</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                isFollowing
                  ? 'bg-white/20 text-white'
                  : 'bg-white text-orange-500'
              }`}
            >
              {isFollowing ? '✓ Жазылдыңыз' : '+ Жазылуу'}
            </button>
            <button className="flex-1 py-3 rounded-xl font-bold bg-white/20 text-white">
              💬 Байланыш
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex">
          {[
            { key: 'products', label: 'Баары', count: shopProducts.length },
            { key: 'new', label: 'Жаңылары', count: null },
            { key: 'hot', label: 'Популярдуу', count: null },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 py-4 text-sm font-medium relative ${
                activeTab === tab.key ? 'text-orange-500' : 'text-gray-600'
              }`}
            >
              {tab.label}
              {tab.count && <span className="text-xs text-gray-400 ml-1">({tab.count})</span>}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-orange-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Bar */}
      <div className="bg-white px-4 py-2 flex items-center gap-2 border-b">
        <span className="text-sm text-gray-500">Сорттоо:</span>
        {[
          { key: 'default', label: 'Демейки' },
          { key: 'sales', label: 'Көп сатылган' },
          { key: 'price-asc', label: 'Арзан' },
          { key: 'price-desc', label: 'Кымбат' },
        ].map((sort) => (
          <button
            key={sort.key}
            onClick={() => setSortBy(sort.key as typeof sortBy)}
            className={`px-3 py-1 text-sm rounded-full ${
              sortBy === sort.key
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {sort.label}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="p-2">
        <div className="grid grid-cols-2 gap-2">
          {displayProducts.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="bg-white rounded-xl overflow-hidden shadow-sm"
            >
              <div className="relative aspect-square">
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
                {product.isGroupBuy && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded">
                    👥 ГРУППА
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium text-gray-800 line-clamp-2 min-h-[40px]">
                  {product.title}
                </h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-lg font-bold text-red-500">
                    {product.price.toLocaleString()}
                    <span className="text-xs"> с</span>
                  </span>
                  {product.originalPrice && (
                    <span className="text-xs text-gray-400 line-through">
                      {product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {product.soldCount.toLocaleString()} сатылды
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {displayProducts.length === 0 && (
        <div className="text-center py-12">
          <span className="text-6xl">📦</span>
          <p className="text-gray-500 mt-4">Продукт жок</p>
        </div>
      )}
    </div>
  );
}