'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ProductGallery from '@/components/ProductGallery';
import ProductCard from '@/components/ProductCard';
import VideoFeed from '@/components/VideoFeed';
import { products, videos } from '@/data/products';
import { useCart } from '@/context/CartContext';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [showVideoFeed, setShowVideoFeed] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'shop'>('description');
  const [isLiked, setIsLiked] = useState(false);
  const [showMiniVideo, setShowMiniVideo] = useState(true);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const miniVideoRef = useRef<HTMLVideoElement>(null);

  // Draggable mini video position
  const [videoPosition, setVideoPosition] = useState({ x: 16, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const positionStartRef = useRef({ x: 0, y: 0 });

  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStartRef.current = { x: clientX, y: clientY };
    positionStartRef.current = { ...videoPosition };
  }, [videoPosition]);

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging) return;
    const deltaX = clientX - dragStartRef.current.x;
    const deltaY = clientY - dragStartRef.current.y;
    const newX = Math.max(8, Math.min(window.innerWidth - 108, positionStartRef.current.x + deltaX));
    const newY = Math.max(60, Math.min(window.innerHeight - 180, positionStartRef.current.y + deltaY));
    setVideoPosition({ x: newX, y: newY });
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleDragMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
    const handleEnd = () => handleDragEnd();

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  const productId = params.id as string;
  const product = products.find(p => p.id === productId);

  const testVideos = [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  ];
  const randomVideoUrl = testVideos[parseInt(productId) % testVideos.length];

  // Set default selections
  useEffect(() => {
    if (product) {
      if (product.colors && product.colors.length > 0 && !selectedColor) {
        setSelectedColor(product.colors[0]);
      }
      if (product.sizes && product.sizes.length > 0 && !selectedSize) {
        setSelectedSize(product.sizes[0]);
      }
    }
  }, [product, selectedColor, selectedSize]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Товар табылган жок</h1>
          <Link href="/" className="text-orange-600 hover:underline">
            Башкы бетке кайтуу
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('ru-RU');
  };

  const discountPercent = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const relatedProducts = products
    .filter(p => p.id !== product.id && p.categoryId === product.categoryId)
    .slice(0, 4);

  const productVideo = videos.find(v => v.productId === product.id);
  const videoIndex = productVideo ? videos.findIndex(v => v.id === productVideo.id) : 0;

  const handleAddToCart = () => {
    addToCart(product as any, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product as any, quantity);
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32 md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white shadow-lg">
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
            onClick={() => setIsLiked(!isLiked)}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
          >
            <svg
              className={`w-6 h-6 ${isLiked ? 'text-red-300 fill-current' : ''}`}
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
          <div className="relative">
            <ProductGallery
              images={product.images}
              videoUrl={product.videoUrl}
              title={product.title}
            />

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
              {product.isGroupBuy && (
                <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-bold rounded-full flex items-center gap-1">
                  <span>👥</span> БИРГЕ АЛУУ
                </span>
              )}
              {product.isFlashSale && (
                <span className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-red-500 text-white text-sm font-bold rounded-full flex items-center gap-1 animate-pulse">
                  <span>⚡</span> FLASH SALE
                </span>
              )}
              {product.hasFreeship && (
                <span className="px-3 py-1 bg-teal-100 text-teal-600 text-sm font-medium rounded-full flex items-center gap-1">
                  🚚 Акысыз жеткирүү
                </span>
              )}
              {product.shop.isOfficialStore && (
                <span className="px-3 py-1 bg-orange-100 text-orange-600 text-sm font-medium rounded-full flex items-center gap-1">
                  ✓ Официалдуу дүкөн
                </span>
              )}
            </div>

            {/* Title & Brand */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                {product.brand && (
                  <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                    {product.brand}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-800">{product.title}</h1>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4 border border-orange-200">
              {product.isGroupBuy && product.groupBuyPrice ? (
                <div>
                  <div className="text-sm text-orange-600 mb-1">👥 Бирге алуу баасы ({product.groupBuyMinPeople}+ адам)</div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-sm text-red-600">¥</span>
                    <span className="text-3xl font-bold text-red-600">
                      {formatPrice(product.groupBuyPrice)}
                    </span>
                    <span className="text-lg text-gray-400 line-through">
                      ¥{formatPrice(product.price)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-baseline gap-3">
                  <span className="text-sm text-red-600">¥</span>
                  <span className="text-3xl font-bold text-red-600">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <>
                      <span className="text-lg text-gray-400 line-through">
                        ¥{formatPrice(product.originalPrice)}
                      </span>
                      <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                        -{discountPercent}%
                      </span>
                    </>
                  )}
                </div>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span>Сатылды: {product.soldCount.toLocaleString()}</span>
                <span>Калды: {product.stock} даана</span>
              </div>
            </div>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-3">Түсү</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedColor === color
                          ? 'border-orange-500 bg-orange-50 text-orange-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-3">Размер</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 rounded-lg border-2 font-medium transition-all ${
                        selectedSize === size
                          ? 'border-orange-500 bg-orange-50 text-orange-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-3">Саны</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border-2 border-gray-200 flex items-center justify-center hover:border-gray-300"
                >
                  -
                </button>
                <span className="text-xl font-bold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 rounded-lg border-2 border-gray-200 flex items-center justify-center hover:border-gray-300"
                >
                  +
                </button>
              </div>
            </div>

            {/* Specifications */}
            {product.specifications && product.specifications.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-xl">📋</span> Мүнөздөмөлөр
                </h3>
                <div className="space-y-2">
                  {product.specifications.map((spec, idx) => (
                    <div key={idx} className="flex items-center py-2 border-b border-gray-100 last:border-0">
                      <span className="text-gray-500 w-1/3">{spec.key}</span>
                      <span className="font-medium text-gray-800">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-xl">✨</span> Өзгөчөлүктөрү
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.features.map((feature, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-orange-50 text-orange-700 text-sm rounded-full border border-orange-200">
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
            </div>

            {/* Shop Card */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-orange-100">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-orange-200">
                  <Image
                    src={product.shop.logo}
                    alt={product.shop.name}
                    fill
                    className="object-cover"
                  />
                  {product.shop.isVerified && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center border-2 border-white">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800">{product.shop.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1 text-amber-500">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                      </svg>
                      <span className="font-medium">{product.shop.rating}</span>
                    </div>
                    <span>•</span>
                    <span>{product.shop.followersCount.toLocaleString()} жолдоочу</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    📍 {product.shop.location} • Жооп берүү: {product.shop.responseTime}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button className="py-2 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors">
                  Дүкөнгө кирүү
                </button>
                <button className="py-2 bg-white border-2 border-orange-500 text-orange-600 rounded-xl font-medium hover:bg-orange-50 transition-colors">
                  + Жолдоо
                </button>
              </div>
            </div>

            {/* Delivery Info */}
            {product.hasFreeship && (
              <div className="bg-teal-50 rounded-2xl p-4 border border-teal-200">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🚚</span>
                  <div>
                    <h4 className="font-bold text-teal-800">Акысыз жеткирүү</h4>
                    <p className="text-sm text-teal-600">Кыргызстан боюнча акысыз жеткирүү</p>
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
                activeTab === 'description' ? 'text-orange-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Сүрөттөмө
              {activeTab === 'description' && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-0.5 bg-orange-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('shop')}
              className={`flex-1 py-4 text-center font-medium transition-colors relative ${
                activeTab === 'shop' ? 'text-orange-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Дүкөн жөнүндө
              {activeTab === 'shop' && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-0.5 bg-orange-500" />
              )}
            </button>
          </div>

          <div className="mt-6">
            {activeTab === 'description' ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Товар жөнүндө маалымат</h2>
                {product.description ? (
                  <div className="prose prose-sm text-gray-600 whitespace-pre-line">
                    {product.description}
                  </div>
                ) : (
                  <div className="text-gray-600 space-y-4">
                    <p>
                      <strong>{product.title}</strong> - {product.brand} брендинин сапаттуу товары.
                    </p>
                    {product.hasFreeship && (
                      <p className="text-teal-600">✓ Кыргызстан боюнча акысыз жеткирүү</p>
                    )}
                  </div>
                )}

                <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                    <span>⚠️</span> Сатып алуу эскертүүсү
                  </h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Товардын түсү экрандагыдан айырмаланышы мүмкүн</li>
                    <li>• Размерлерди туура тандаңыз</li>
                    <li>• Кайтаруу 14 күн ичинде</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-orange-200">
                    <Image
                      src={product.shop.logo}
                      alt={product.shop.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{product.shop.name}</h3>
                    <p className="text-gray-500">{product.shop.location}</p>
                    <p className="text-sm text-gray-400">Катталган: {product.shop.createdAt}</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-orange-600">{product.shop.productsCount}</div>
                    <div className="text-sm text-gray-500">Товар</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-orange-600">{product.shop.salesCount.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">Сатуу</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-amber-500">{product.shop.rating}</div>
                    <div className="text-sm text-gray-500">Рейтинг</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-teal-500">{product.shop.responseRate}%</div>
                    <div className="text-sm text-gray-500">Жооп</div>
                  </div>
                </div>

                <button className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:opacity-90 transition-opacity">
                  Дүкөнгө кирүү
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
                <span className="text-xl">🛍️</span> Окшош товарлар
              </h2>
              <Link href="/categories" className="text-orange-600 text-sm font-medium hover:underline">
                Баарын көрүү →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Bar - Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden z-40">
        <div className="flex items-center gap-3">
          <button className="flex flex-col items-center justify-center w-14">
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-[10px] text-gray-500">Чат</span>
          </button>
          <button
            onClick={handleAddToCart}
            className="flex-1 py-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            Себетке
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            Сатып алуу
          </button>
        </div>
      </div>

      {/* Draggable Mini Video */}
      {showMiniVideo && !showVideoFeed && (
        <div
          className="fixed z-50 select-none"
          style={{
            left: `${videoPosition.x}px`,
            top: `${videoPosition.y}px`,
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
        >
          <div
            className={`relative w-24 h-32 rounded-xl overflow-hidden shadow-2xl border-2 border-white ${isDragging ? 'scale-105' : ''} transition-transform`}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onClick={(e) => {
              if (!isDragging) {
                setShowVideoFeed(true);
              }
            }}
          >
            <video
              ref={miniVideoRef}
              src={randomVideoUrl}
              className="w-full h-full object-cover"
              loop
              muted
              playsInline
              autoPlay
            />

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMiniVideo(false);
              }}
              className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Video Feed Modal */}
      {showVideoFeed && (
        <VideoFeed
          videos={videos}
          onClose={() => setShowVideoFeed(false)}
          initialIndex={videoIndex}
        />
      )}
    </div>
  );
}