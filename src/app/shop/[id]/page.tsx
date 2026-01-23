'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { shops, products } from '@/data/products';
import ContactSellerButton from '@/components/ContactSellerButton';

export default function ShopPage() {
  const params = useParams();
  const router = useRouter();
  const shopId = params.id as string;

  const shop = shops.find(s => s.id === shopId);
  const shopProducts = products.filter(p => p.shop.id === shopId);

  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'hot' | 'reviews'>('all');
  const [isFollowing, setIsFollowing] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'sales' | 'price-asc' | 'price-desc' | 'new'>('default');

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="text-5xl">🏪</span>
          <p className="text-gray-500 mt-3 text-sm">Дүкөн табылган жок</p>
          <button onClick={() => router.back()} className="mt-3 px-4 py-1.5 bg-orange-500 text-white rounded-full text-sm">
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
  if (sortBy === 'price-asc') displayProducts = displayProducts.sort((a, b) => a.price - b.price);
  else if (sortBy === 'price-desc') displayProducts = displayProducts.sort((a, b) => b.price - a.price);
  else if (sortBy === 'sales') displayProducts = displayProducts.sort((a, b) => b.soldCount - a.soldCount);
  else if (sortBy === 'new') displayProducts = displayProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const formatNumber = (num: number) => {
    if (num >= 10000) return `${(num / 10000).toFixed(1)}万`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-14">
      {/* Header */}
      <div className="bg-white">
        {/* Navigation */}
        <div className="flex items-center justify-between px-2 py-2">
          <button onClick={() => router.back()} className="p-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <button className="p-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="p-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Shop Info - Compact */}
        <div className="px-3 pb-2">
          <div className="flex items-center gap-2">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
              <Image src={shop.logo} alt={shop.name} fill className="object-cover" />
              {shop.isVerified && (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border border-white">
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-bold text-gray-800 truncate">{shop.name}</h1>
                {shop.isOfficialStore && (
                  <span className="bg-red-500 text-white text-[8px] px-1 py-0.5 rounded shrink-0">Official</span>
                )}
              </div>
              <p className="text-[10px] text-gray-500">Акыркы айда {formatNumber(shop.salesCount)} сатылды</p>
            </div>
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`text-xs px-3 py-1 rounded-full border ${isFollowing ? 'border-gray-300 text-gray-500' : 'border-red-500 text-red-500'}`}
            >
              {isFollowing ? '✓ Жазылдыңыз' : '+ Жазылуу'}
            </button>
            <ContactSellerButton shopId={shop.id} shopName={shop.name} shopLogo={shop.logo} variant="button" className="text-xs" />
          </div>

          {/* Guarantee badge */}
          <div className="mt-2 flex items-center gap-2 bg-green-50 rounded px-2 py-1">
            <span className="text-green-600 text-[10px]">✓ Дүкөн кепилдиги</span>
            <span className="text-gray-400 text-[10px]">|</span>
            <span className="text-[10px] text-gray-500">Кайтаруу акысыз · 7-күн кайтаруу · Акысыз жеткирүү</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white mt-1 sticky top-0 z-10">
        <div className="flex border-b border-gray-100">
          {[
            { key: 'all', label: 'Баары', count: shopProducts.length },
            { key: 'hot', label: 'Популярдуу' },
            { key: 'new', label: 'Жаңы' },
            { key: 'reviews', label: 'Пикирлер' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 py-2 text-xs font-medium relative ${activeTab === tab.key ? 'text-red-500' : 'text-gray-600'}`}
            >
              {tab.label}
              {tab.count && <span className="text-[10px] text-gray-400 ml-0.5">({tab.count})</span>}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-red-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Sort Bar */}
        <div className="px-2 py-1.5 flex items-center gap-1 overflow-x-auto">
          {[
            { key: 'default', label: 'Демейки' },
            { key: 'sales', label: 'Сатылган' },
            { key: 'new', label: 'Жаңы' },
            { key: 'price-asc', label: 'Арзан' },
            { key: 'price-desc', label: 'Кымбат' },
          ].map((sort) => (
            <button
              key={sort.key}
              onClick={() => setSortBy(sort.key as typeof sortBy)}
              className={`px-2.5 py-1 text-[10px] rounded-full whitespace-nowrap ${
                sortBy === sort.key ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {sort.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid - Compact */}
      <div className="p-1.5">
        <div className="grid grid-cols-2 gap-1.5">
          {displayProducts.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`} className="bg-white rounded-lg overflow-hidden">
              <div className="relative aspect-square">
                <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
                {product.isGroupBuy && (
                  <div className="absolute top-1 left-1 bg-orange-500 text-white text-[8px] px-1 py-0.5 rounded">
                    👥 ГРУППА
                  </div>
                )}
                {product.hasFreeship && (
                  <div className="absolute top-1 right-1 bg-teal-500 text-white text-[8px] px-1 py-0.5 rounded">
                    🚚
                  </div>
                )}
                {product.stock < 20 && (
                  <div className="absolute bottom-1 left-1 bg-red-500/80 text-white text-[8px] px-1 py-0.5 rounded">
                    ⏰ {product.stock} калды
                  </div>
                )}
              </div>
              <div className="p-2">
                <h3 className="text-xs text-gray-800 line-clamp-2 min-h-[32px] leading-tight">{product.title}</h3>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-gray-400">
                  {product.reviewCount > 0 && <span>{product.reviewCount} пикир</span>}
                  <span>·</span>
                  <span>{product.soldCount} сатылды</span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <div>
                    <span className="text-red-500 text-xs font-bold">¥{product.price.toLocaleString()}</span>
                    {product.originalPrice && (
                      <span className="text-[10px] text-gray-400 line-through ml-1">¥{product.originalPrice.toLocaleString()}</span>
                    )}
                  </div>
                  <button
                    onClick={(e) => { e.preventDefault(); }}
                    className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {displayProducts.length === 0 && (
        <div className="text-center py-8 bg-white mt-1.5 mx-1.5 rounded-lg">
          <span className="text-4xl">📦</span>
          <p className="text-gray-500 mt-2 text-sm">Продукт жок</p>
        </div>
      )}

      {/* Promo Banner */}
      {shopProducts.length > 10 && (
        <div className="mx-1.5 mt-1.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-2 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold">🔥 Дүкөн акциясы</p>
              <p className="text-[10px] opacity-90">¥3000+ сатып алганда ¥30 арзандатуу</p>
            </div>
            <button className="bg-white text-red-500 text-[10px] px-2 py-1 rounded-full font-medium">
              Алуу &gt;
            </button>
          </div>
        </div>
      )}

      {/* Bottom Fixed Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-40 px-2 py-1.5 flex items-center gap-2">
        <button onClick={() => router.push('/')} className="flex flex-col items-center px-3">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-[10px] text-gray-500">Башкы</span>
        </button>
        <button
          onClick={() => setIsFollowing(!isFollowing)}
          className="flex flex-col items-center px-3"
        >
          <svg className={`w-5 h-5 ${isFollowing ? 'text-red-500 fill-current' : 'text-gray-500'}`} fill={isFollowing ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="text-[10px] text-gray-500">{isFollowing ? 'Сакталды' : 'Сактоо'}</span>
        </button>
        <ContactSellerButton shopId={shop.id} shopName={shop.name} shopLogo={shop.logo} variant="icon" />
        <button
          onClick={() => setIsFollowing(!isFollowing)}
          className={`flex-1 py-2.5 rounded-full text-sm font-medium ${isFollowing ? 'bg-gray-200 text-gray-600' : 'bg-red-500 text-white'}`}
        >
          {isFollowing ? '✓ Жазылдыңыз' : '+ Дүкөнгө жазылуу'}
        </button>
      </div>

    </div>
  );
}