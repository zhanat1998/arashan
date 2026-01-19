'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ProductGallery from '@/components/ProductGallery';
import ProductCard from '@/components/ProductCard';
import VideoFeed from '@/components/VideoFeed';
import { livestock, videos } from '@/data/products';
import { useCart } from '@/context/CartContext';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [showVideoFeed, setShowVideoFeed] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'seller'>('description');
  const [isLiked, setIsLiked] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  const productId = params.id as string;
  const product = livestock.find(p => p.id === productId);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🐾</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Мал табылган жок</h1>
          <Link href="/" className="text-emerald-600 hover:underline">
            Башкы бетке кайтуу
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} млн`;
    }
    return price.toLocaleString('ru-RU');
  };

  // Get related products (same category)
  const relatedProducts = livestock
    .filter(p => p.id !== product.id && p.categoryId === product.categoryId)
    .slice(0, 4);

  // Find video for this product
  const productVideo = videos.find(v => v.livestockId === product.id);
  const videoIndex = productVideo ? videos.findIndex(v => v.id === productVideo.id) : 0;

  const handleAddToFavorites = () => {
    setIsLiked(!isLiked);
  };

  const handleContact = () => {
    setShowPhone(true);
  };

  const handleCall = () => {
    window.location.href = `tel:${product.seller.phone}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32 md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="flex-1 text-lg font-medium truncate">
            {product.title}
          </h1>
          <button
            onClick={handleAddToFavorites}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
          >
            <svg
              className={`w-6 h-6 ${isLiked ? 'text-red-400 fill-current' : ''}`}
              fill={isLiked ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <button className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left - Gallery */}
          <div>
            <ProductGallery
              images={product.images}
              videoUrl={product.videoUrl}
              title={product.title}
            />

            {/* Watch Video Button */}
            {product.videoUrl && (
              <button
                onClick={() => setShowVideoFeed(true)}
                className="w-full mt-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Видео көрүү
              </button>
            )}
          </div>

          {/* Right - Info */}
          <div className="space-y-4">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {product.isPremium && (
                <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-white text-sm font-bold rounded-full flex items-center gap-1">
                  <span>👑</span> ПРЕМИУМ
                </span>
              )}
              {product.isVerified && (
                <span className="px-3 py-1 bg-blue-100 text-blue-600 text-sm font-medium rounded-full flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  Текшерилген
                </span>
              )}
              {product.hasDocuments && (
                <span className="px-3 py-1 bg-purple-100 text-purple-600 text-sm font-medium rounded-full">
                  📋 Документтери бар
                </span>
              )}
              {product.isUrgent && (
                <span className="px-3 py-1 bg-red-100 text-red-600 text-sm font-medium rounded-full animate-pulse">
                  🔥 Тез сатылат
                </span>
              )}
            </div>

            {/* Title & Breed */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                  {product.breed}
                </span>
                <span className={`text-sm px-2 py-0.5 rounded-full ${
                  product.gender === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
                }`}>
                  {product.gender === 'male' ? '♂ Эркек' : '♀ Ургаачы'}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">{product.title}</h1>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-200">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-emerald-600">
                  {formatPrice(product.price)}
                </span>
                <span className="text-lg text-gray-500">сом</span>
                {product.isNegotiable && (
                  <span className="text-sm text-amber-600 font-medium">• Сүйлөшүү бар</span>
                )}
              </div>
              {product.originalPrice && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(product.originalPrice)} сом
                  </span>
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                    -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* Animal Details */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-xl">📊</span> Мал жөнүндө
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className="text-2xl">🎂</span>
                  <div>
                    <div className="text-xs text-gray-500">Жашы</div>
                    <div className="font-semibold text-gray-800">{product.age}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className="text-2xl">⚖️</span>
                  <div>
                    <div className="text-xs text-gray-500">Салмагы</div>
                    <div className="font-semibold text-gray-800">{product.weight}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className="text-2xl">🎨</span>
                  <div>
                    <div className="text-xs text-gray-500">Түсү</div>
                    <div className="font-semibold text-gray-800">{product.color}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className="text-2xl">📍</span>
                  <div>
                    <div className="text-xs text-gray-500">Жайгашкан жер</div>
                    <div className="font-semibold text-gray-800">{product.location}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-xl">✨</span> Өзгөчөлүктөрү
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.features.map((feature, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm rounded-full border border-emerald-200">
                      ✓ {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Rating & Views */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-amber-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
                <span className="font-bold">{product.rating}</span>
                <span className="text-gray-400">({product.reviewCount} пикир)</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{product.views} көрүү</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{product.likes}</span>
              </div>
            </div>

            {/* Seller Card */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-emerald-100">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-200">
                  <Image
                    src={product.seller.avatar}
                    alt={product.seller.name}
                    fill
                    className="object-cover"
                  />
                  {product.seller.isVerified && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800">{product.seller.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1 text-amber-500">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                      </svg>
                      <span className="font-medium">{product.seller.rating}</span>
                    </div>
                    <span>•</span>
                    <span>{product.seller.salesCount} сатуу</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    📍 {product.seller.location} • {product.seller.memberSince}
                  </div>
                </div>
              </div>

              {/* Contact Buttons */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                {showPhone ? (
                  <button
                    onClick={handleCall}
                    className="col-span-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {product.seller.phone}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleContact}
                      className="py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Чалуу
                    </button>
                    <button className="py-3 bg-white border-2 border-emerald-500 text-emerald-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Жазуу
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Delivery Info */}
            {product.hasDelivery && (
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🚚</span>
                  <div>
                    <h4 className="font-bold text-blue-800">Жеткирүү бар</h4>
                    <p className="text-sm text-blue-600">Кыргызстан боюнча жеткирүү мүмкүн</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('description')}
              className={`flex-1 py-4 text-center font-medium transition-colors relative ${
                activeTab === 'description'
                  ? 'text-emerald-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Сүрөттөмө
              {activeTab === 'description' && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-0.5 bg-emerald-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('seller')}
              className={`flex-1 py-4 text-center font-medium transition-colors relative ${
                activeTab === 'seller'
                  ? 'text-emerald-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Сатуучу жөнүндө
              {activeTab === 'seller' && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-0.5 bg-emerald-500" />
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'description' ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Мал жөнүндө маалымат</h2>
                {product.description ? (
                  <div className="prose prose-sm text-gray-600 whitespace-pre-line">
                    {product.description}
                  </div>
                ) : (
                  <div className="text-gray-600 space-y-4">
                    <p>
                      <strong>{product.title}</strong> - {product.breed} породасынын {product.gender === 'male' ? 'эркек' : 'ургаачы'} малы.
                    </p>
                    <p>
                      Жашы: {product.age}, салмагы {product.weight}. Түсү - {product.color.toLowerCase()}.
                    </p>
                    <p>
                      Жайгашкан жери: {product.location}, {product.region}.
                    </p>
                    {product.hasDocuments && (
                      <p className="text-purple-600">✓ Бардык документтери бар (паспорт, ветеринардык справка)</p>
                    )}
                    {product.hasDelivery && (
                      <p className="text-blue-600">✓ Кыргызстан боюнча жеткирүү мүмкүн</p>
                    )}
                  </div>
                )}

                {/* Safety Tips */}
                <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                    <span>⚠️</span> Коопсуздук эскертүүсү
                  </h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Малды көзүңүз менен көргөндөн кийин гана сатып алыңыз</li>
                    <li>• Документтерин текшериңиз</li>
                    <li>• Алдын ала төлөм жасабаңыз</li>
                    <li>• Шектүү жарнамалар жөнүндө кабарлаңыз</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-200">
                    <Image
                      src={product.seller.avatar}
                      alt={product.seller.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{product.seller.name}</h3>
                    <p className="text-gray-500">{product.seller.location}</p>
                    <p className="text-sm text-gray-400">Катталган: {product.seller.memberSince}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-emerald-600">{product.seller.salesCount}</div>
                    <div className="text-sm text-gray-500">Сатуу</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-amber-500">{product.seller.rating}</div>
                    <div className="text-sm text-gray-500">Рейтинг</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-blue-500">
                      {product.seller.isVerified ? '✓' : '—'}
                    </div>
                    <div className="text-sm text-gray-500">Текшерилген</div>
                  </div>
                </div>

                <button
                  onClick={handleContact}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
                >
                  Сатуучуга байланышуу
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="text-xl">🐾</span> Окшош жарнамалар
              </h2>
              <Link href="/categories" className="text-emerald-600 text-sm font-medium hover:underline">
                Баарын көрүү →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {relatedProducts.map((relatedProduct) => (
                <Link key={relatedProduct.id} href={`/product/${relatedProduct.id}`}>
                  <ProductCard product={relatedProduct} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Bar - Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden z-40">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="text-xs text-gray-500">Баасы</div>
            <div className="text-xl font-bold text-emerald-600">{formatPrice(product.price)} сом</div>
          </div>
          <button
            onClick={handleContact}
            className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Байланышуу
          </button>
        </div>
      </div>

      {/* Video Feed Modal */}
      {showVideoFeed && productVideo && (
        <VideoFeed
          videos={videos}
          onClose={() => setShowVideoFeed(false)}
          initialIndex={videoIndex}
        />
      )}
    </div>
  );
}