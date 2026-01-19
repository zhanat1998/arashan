'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ProductGallery from '@/components/ProductGallery';
import ProductCard from '@/components/ProductCard';
import VideoFeed from '@/components/VideoFeed';
import ChatBot from '@/components/ChatBot';
import { products, videos } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { generateCommentsForProduct, getRatingDistribution, getAverageRating } from '@/data/comments';
import { Comment } from '@/data/types';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [showVideoFeed, setShowVideoFeed] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showMiniVideo, setShowMiniVideo] = useState(true);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const miniVideoRef = useRef<HTMLVideoElement>(null);

  // Draggable mini video
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
          <div className="text-5xl mb-3">🛒</div>
          <h1 className="text-xl font-bold text-gray-800 mb-3">Товар табылган жок</h1>
          <Link href="/" className="text-orange-600 hover:underline text-sm">
            Башкы бетке кайтуу
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => price.toLocaleString('ru-RU');
  const discountPercent = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const relatedProducts = products
    .filter(p => p.id !== product.id && p.categoryId === product.categoryId)
    .slice(0, 6);

  const productVideo = videos.find(v => v.productId === product.id);
  const videoIndex = productVideo ? videos.findIndex(v => v.id === productVideo.id) : 0;

  const handleAddToCart = () => addToCart(product as any, quantity);
  const handleBuyNow = () => {
    addToCart(product as any, quantity);
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-14">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="flex items-center justify-between px-2 py-2">
          <button onClick={() => router.back()} className="p-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm text-gray-600">
            {product.soldCount > 100 ? `${product.soldCount.toLocaleString()} сатылды` : ''}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setIsLiked(!isLiked)} className="p-2">
              <svg className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-current' : ''}`} fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button className="p-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Gallery */}
      <div className="bg-white">
        <ProductGallery images={product.images} videoUrl={product.videoUrl} title={product.title} />
      </div>

      {/* Price Section */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 px-3 py-2">
        <div className="flex items-end gap-2">
          <span className="text-white text-sm">¥</span>
          <span className="text-white text-3xl font-bold">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <>
              <span className="text-white/70 text-sm line-through">¥{formatPrice(product.originalPrice)}</span>
              <span className="bg-yellow-400 text-red-600 text-xs font-bold px-1.5 py-0.5 rounded">-{discountPercent}%</span>
            </>
          )}
          <span className="ml-auto text-white/90 text-xs">{product.soldCount.toLocaleString()} сатылды</span>
        </div>
        {/* Promo badges */}
        <div className="flex gap-1.5 mt-2 overflow-x-auto">
          {product.isGroupBuy && (
            <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap">👥 Бирге алуу</span>
          )}
          {product.hasFreeship && (
            <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap">🚚 Акысыз жеткирүү</span>
          )}
          <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap">2 алсаң 5% арзан</span>
          <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap">¥5000+ ¥200 арзан</span>
        </div>
      </div>

      {/* Guarantee Banner */}
      <div className="bg-orange-50 border-y border-orange-200 px-3 py-1.5">
        <p className="text-orange-600 text-xs">
          ✅ Кайтаруу акысыз | Канааттанбасаңыз акчаңыз кайтарылат | 7 күн кайтаруу
        </p>
      </div>

      {/* Product Title */}
      <div className="bg-white px-3 py-2">
        <div className="flex items-start gap-2">
          {product.shop.isOfficialStore && (
            <span className="bg-red-500 text-white text-[10px] px-1 py-0.5 rounded shrink-0 mt-0.5">Official</span>
          )}
          <h1 className="text-sm font-medium text-gray-800 line-clamp-2">{product.title}</h1>
        </div>
        <div className="flex gap-1.5 mt-1.5 flex-wrap">
          <span className="bg-red-50 text-red-500 text-[10px] px-1.5 py-0.5 rounded">{product.reviewCount}+ жакшы пикир</span>
          <span className="bg-orange-50 text-orange-500 text-[10px] px-1.5 py-0.5 rounded">{product.likes}+ сактаган</span>
          {product.brand && (
            <span className="bg-blue-50 text-blue-500 text-[10px] px-1.5 py-0.5 rounded">{product.brand}</span>
          )}
        </div>
      </div>

      {/* Group Buy Section */}
      {product.isGroupBuy && product.groupBuyPrice && (
        <div className="bg-white mt-1.5 px-3 py-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Бирге алуу баасы ({product.groupBuyMinPeople}+ адам)</p>
              <p className="text-red-500 font-bold">¥{formatPrice(product.groupBuyPrice)}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full bg-gray-200 border border-white overflow-hidden">
                    <Image src={`https://i.pravatar.cc/40?img=${i+10}`} alt="" width={24} height={24} />
                  </div>
                ))}
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400">Аяктоого</p>
                <p className="text-xs text-red-500 font-mono">23:59:59</p>
              </div>
              <button className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                Катышуу
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shop Card - Compact */}
      <div className="bg-white mt-1.5 px-3 py-2">
        <div className="flex items-center gap-2">
          <Link href={`/shop/${product.shop.id}`} className="flex items-center gap-2 flex-1">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200">
              <Image src={product.shop.logo} alt={product.shop.name} fill className="object-cover" />
              {product.shop.isVerified && (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border border-white">
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{product.shop.name}</p>
              <p className="text-[10px] text-gray-400">{product.shop.salesCount.toLocaleString()} сатылды · ⭐{product.shop.rating}</p>
            </div>
          </Link>
          <button
            onClick={() => setIsFollowing(!isFollowing)}
            className={`text-xs px-3 py-1 rounded-full border ${isFollowing ? 'border-gray-300 text-gray-500' : 'border-red-500 text-red-500'}`}
          >
            {isFollowing ? '✓ Жазылдыңыз' : '+ Жазылуу'}
          </button>
          <button onClick={() => setShowChat(true)} className="text-xs px-3 py-1 rounded-full border border-gray-300 text-gray-600">
            💬 Чат
          </button>
        </div>
      </div>

      {/* Options: Color & Size */}
      <div className="bg-white mt-1.5 px-3 py-2">
        <div className="flex items-center justify-between" onClick={() => {}}>
          <span className="text-xs text-gray-500">Тандоо</span>
          <div className="flex items-center gap-1 text-xs text-gray-800">
            {selectedColor && <span className="bg-gray-100 px-2 py-0.5 rounded">{selectedColor}</span>}
            {selectedSize && <span className="bg-gray-100 px-2 py-0.5 rounded">{selectedSize}</span>}
            <span className="bg-gray-100 px-2 py-0.5 rounded">x{quantity}</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
        {/* Inline Options */}
        {product.colors && product.colors.length > 0 && (
          <div className="mt-2">
            <div className="flex gap-1.5 flex-wrap">
              {product.colors.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`text-xs px-2.5 py-1 rounded border ${selectedColor === color ? 'border-red-500 text-red-500 bg-red-50' : 'border-gray-200 text-gray-600'}`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}
        {product.sizes && product.sizes.length > 0 && (
          <div className="mt-1.5">
            <div className="flex gap-1.5 flex-wrap">
              {product.sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`text-xs px-2.5 py-1 rounded border ${selectedSize === size ? 'border-red-500 text-red-500 bg-red-50' : 'border-gray-200 text-gray-600'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}
        {/* Quantity */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-gray-500">Саны:</span>
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-6 h-6 border rounded text-sm">-</button>
          <span className="text-sm font-medium w-8 text-center">{quantity}</span>
          <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="w-6 h-6 border rounded text-sm">+</button>
          <span className="text-[10px] text-gray-400">({product.stock} калды)</span>
        </div>
      </div>

      {/* Guarantees */}
      <div className="bg-white mt-1.5 px-3 py-2">
        <div className="flex items-center gap-3 text-[10px] text-gray-500">
          <span className="text-green-600">✓ 7-күн кайтаруу</span>
          <span className="text-green-600">✓ Акысыз жеткирүү</span>
          <span className="text-green-600">✓ Кечиксе компенсация</span>
        </div>
      </div>

      {/* Reviews Section - Compact */}
      <ReviewsSection productId={productId} />

      {/* Specifications - Compact */}
      {product.specifications && product.specifications.length > 0 && (
        <div className="bg-white mt-1.5 px-3 py-2">
          <h3 className="text-sm font-medium text-gray-800 mb-1.5">Мүнөздөмөлөр</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {product.specifications.slice(0, 6).map((spec, idx) => (
              <div key={idx} className="flex text-xs">
                <span className="text-gray-400 w-16 shrink-0">{spec.key}</span>
                <span className="text-gray-700">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Products - Compact */}
      {relatedProducts.length > 0 && (
        <div className="bg-white mt-1.5 px-3 py-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-800">Окшош товарлар</h3>
            <Link href="/categories" className="text-xs text-gray-400">Баарын көрүү &gt;</Link>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {relatedProducts.slice(0, 6).map(p => (
              <Link key={p.id} href={`/product/${p.id}`} className="bg-gray-50 rounded overflow-hidden">
                <div className="relative aspect-square">
                  <Image src={p.images[0]} alt={p.title} fill className="object-cover" />
                </div>
                <div className="p-1.5">
                  <p className="text-[10px] text-gray-600 line-clamp-1">{p.title}</p>
                  <p className="text-xs text-red-500 font-medium">¥{formatPrice(p.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Fixed Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-40 px-2 py-1.5 flex items-center gap-2">
        <Link href={`/shop/${product.shop.id}`} className="flex flex-col items-center px-2">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-[10px] text-gray-500">Дүкөн</span>
        </Link>
        <button onClick={() => setIsLiked(!isLiked)} className="flex flex-col items-center px-2">
          <svg className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-500'}`} fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="text-[10px] text-gray-500">Сактоо</span>
        </button>
        <button onClick={() => setShowChat(true)} className="flex flex-col items-center px-2">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-[10px] text-gray-500">Чат</span>
        </button>
        {product.originalPrice && (
          <button onClick={handleAddToCart} className="flex-1 bg-orange-500 text-white py-2.5 rounded-l-full text-sm font-medium">
            <span className="line-through text-white/70 text-xs">¥{formatPrice(product.originalPrice)}</span>
            <br />
            <span>Себетке</span>
          </button>
        )}
        <button onClick={handleBuyNow} className={`flex-1 bg-red-500 text-white py-2.5 text-sm font-medium ${product.originalPrice ? 'rounded-r-full' : 'rounded-full'}`}>
          <span className="text-white font-bold">¥{formatPrice(product.price)}</span>
          <br />
          <span>Сатып алуу</span>
        </button>
      </div>

      {/* Mini Video */}
      {showMiniVideo && !showVideoFeed && (
        <div
          className="fixed z-50 select-none"
          style={{ left: `${videoPosition.x}px`, top: `${videoPosition.y}px`, cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <div
            className={`relative w-20 h-28 rounded-lg overflow-hidden shadow-lg border-2 border-white ${isDragging ? 'scale-105' : ''} transition-transform`}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onClick={() => !isDragging && setShowVideoFeed(true)}
          >
            <video ref={miniVideoRef} src={randomVideoUrl} className="w-full h-full object-cover" loop muted playsInline autoPlay />
            <button
              onClick={(e) => { e.stopPropagation(); setShowMiniVideo(false); }}
              className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/50 rounded-full flex items-center justify-center text-white"
            >
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="absolute bottom-0.5 left-0.5 bg-black/50 text-white text-[8px] px-1 rounded">▶ Видео</div>
          </div>
        </div>
      )}

      {/* Video Feed Modal */}
      {showVideoFeed && (
        <VideoFeed videos={videos} onClose={() => setShowVideoFeed(false)} initialIndex={videoIndex} />
      )}

      {/* ChatBot */}
      <ChatBot isOpen={showChat} onClose={() => setShowChat(false)} shopName={product.shop.name} />
    </div>
  );
}

// Compact Reviews Section
function ReviewsSection({ productId }: { productId: string }) {
  const [comments] = useState(() => generateCommentsForProduct(productId, 15));
  const [showAll, setShowAll] = useState(false);

  const avgRating = getAverageRating(comments);
  const distribution = getRatingDistribution(comments);
  const displayComments = showAll ? comments : comments.slice(0, 3);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Бүгүн';
    if (diffDays === 1) return 'Кечээ';
    if (diffDays < 7) return `${diffDays} күн мурун`;
    return `${Math.floor(diffDays / 7)} жума мурун`;
  };

  return (
    <div className="bg-white mt-1.5">
      {/* Header */}
      <div className="px-3 py-2 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-800">Пикирлер</span>
          <span className="text-xs text-gray-400">({comments.length})</span>
        </div>
        <button onClick={() => setShowAll(!showAll)} className="text-xs text-gray-400 flex items-center gap-0.5">
          Баарын көрүү
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Rating Summary - Compact */}
      <div className="px-3 py-2 flex items-center gap-4 border-b border-gray-100">
        <div className="flex items-center gap-1">
          <span className="text-2xl font-bold text-orange-500">{avgRating}</span>
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(s => (
              <svg key={s} className={`w-3 h-3 ${s <= Math.round(avgRating) ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
            ))}
          </div>
        </div>
        <div className="flex-1 flex gap-2 overflow-x-auto">
          {distribution.slice(0, 3).map(d => (
            <span key={d.rating} className="text-[10px] text-gray-500 whitespace-nowrap bg-gray-50 px-1.5 py-0.5 rounded">
              {d.rating}⭐ ({d.count})
            </span>
          ))}
        </div>
      </div>

      {/* Comments List - Compact */}
      <div className="divide-y divide-gray-50">
        {displayComments.map(comment => (
          <div key={comment.id} className="px-3 py-2">
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-200 shrink-0">
                <Image src={comment.userAvatar} alt="" width={28} height={28} className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium text-gray-800 truncate">{comment.userName}</span>
                  {comment.isVerifiedPurchase && (
                    <span className="text-[8px] bg-green-100 text-green-600 px-1 rounded">✓ Алган</span>
                  )}
                  <span className="text-[10px] text-gray-400 ml-auto">{formatDate(comment.createdAt)}</span>
                </div>
                <div className="flex gap-0.5 mt-0.5">
                  {[1,2,3,4,5].map(s => (
                    <svg key={s} className={`w-2.5 h-2.5 ${s <= comment.rating ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                  ))}
                  {(comment.selectedColor || comment.selectedSize) && (
                    <span className="text-[10px] text-gray-400 ml-1">
                      {comment.selectedColor} {comment.selectedSize}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{comment.content}</p>
                {comment.images && comment.images.length > 0 && (
                  <div className="flex gap-1 mt-1.5">
                    {comment.images.map((img, idx) => (
                      <div key={idx} className="w-12 h-12 rounded overflow-hidden bg-gray-100">
                        <Image src={img} alt="" width={48} height={48} className="object-cover w-full h-full" />
                      </div>
                    ))}
                  </div>
                )}
                {/* Shop Reply */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-1.5 bg-orange-50 rounded p-1.5">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-medium text-orange-600">{comment.replies[0].userName}</span>
                      <span className="text-[8px] bg-orange-200 text-orange-700 px-1 rounded">Дүкөн</span>
                    </div>
                    <p className="text-[10px] text-gray-600 mt-0.5">{comment.replies[0].content}</p>
                  </div>
                )}
                {/* Actions */}
                <div className="flex items-center gap-3 mt-1.5">
                  <button className="text-[10px] text-gray-400 flex items-center gap-0.5">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    {comment.likes}
                  </button>
                  <button className="text-[10px] text-gray-400">Жооп</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show More */}
      {comments.length > 3 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full py-2 text-xs text-orange-500 border-t border-gray-100"
        >
          Дагы {comments.length - 3} пикир көрүү
        </button>
      )}
    </div>
  );
}