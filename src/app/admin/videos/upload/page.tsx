'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { products } from '@/data/products';

export default function UploadVideo() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 10);

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 500MB)
    if (file.size > 500 * 1024 * 1024) {
      setError('Видео 500MB ашпашы керек');
      return;
    }

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!videoFile) {
      setError('Видео тандаңыз');
      return;
    }

    if (!selectedProduct) {
      setError('Продукт тандаңыз');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 5, 90));
      }, 300);

      // Upload video
      const videoFormData = new FormData();
      videoFormData.append('file', videoFile);
      videoFormData.append('folder', 'videos');

      const videoResponse = await fetch('/api/upload', {
        method: 'POST',
        body: videoFormData,
      });

      if (!videoResponse.ok) {
        throw new Error('Видео жүктөө ишке ашкан жок');
      }

      const videoData = await videoResponse.json();

      // Upload thumbnail if provided
      let thumbnailUrl = '';
      if (thumbnailFile) {
        const thumbFormData = new FormData();
        thumbFormData.append('file', thumbnailFile);
        thumbFormData.append('folder', 'thumbnails');

        const thumbResponse = await fetch('/api/upload', {
          method: 'POST',
          body: thumbFormData,
        });

        if (thumbResponse.ok) {
          const thumbData = await thumbResponse.json();
          thumbnailUrl = thumbData.url;
        }
      }

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadedUrl(videoData.url);

      // Here you would save to database
      console.log('Video uploaded:', {
        videoUrl: videoData.url,
        thumbnailUrl,
        productId: selectedProduct,
        title,
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Жүктөө катасы');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setVideoFile(null);
    setVideoPreview(null);
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setSelectedProduct('');
    setTitle('');
    setUploadedUrl(null);
    setUploadProgress(0);
    if (videoInputRef.current) videoInputRef.current.value = '';
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/videos"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Видео жүктөө</h1>
          <p className="text-gray-500 mt-1">Жаңы видео жүктөп, продуктка байлаңыз</p>
        </div>
      </div>

      {uploadedUrl ? (
        /* Success State */
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Видео ийгиликтүү жүктөлдү!</h2>
          <p className="text-gray-500 mb-6">Сиздин видео эми көрүнүп турат</p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-600 break-all">{uploadedUrl}</p>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={resetForm}
              className="px-6 py-3 bg-purple-500 text-white font-medium rounded-xl hover:bg-purple-600 transition-colors"
            >
              Дагы жүктөө
            </button>
            <Link
              href="/admin/videos"
              className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
            >
              Видеолорго
            </Link>
          </div>
        </div>
      ) : (
        /* Upload Form */
        <div className="space-y-6">
          {/* Video Upload */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4">📹 Видео файл</h2>

            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoSelect}
              className="hidden"
            />

            {videoPreview ? (
              <div className="relative">
                <video
                  src={videoPreview}
                  controls
                  className="w-full max-h-96 rounded-xl bg-black"
                />
                <button
                  onClick={() => {
                    setVideoFile(null);
                    setVideoPreview(null);
                    if (videoInputRef.current) videoInputRef.current.value = '';
                  }}
                  className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => videoInputRef.current?.click()}
                className="w-full h-64 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-purple-400 hover:bg-purple-50 transition-colors"
              >
                <span className="text-5xl mb-3">🎬</span>
                <p className="text-gray-600 font-medium">Видео тандоо үчүн басыңыз</p>
                <p className="text-gray-400 text-sm mt-1">MP4, MOV, AVI (макс. 500MB)</p>
              </button>
            )}
          </div>

          {/* Thumbnail Upload */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4">🖼️ Миниатюра (милдеттүү эмес)</h2>

            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailSelect}
              className="hidden"
            />

            <div className="flex gap-4">
              {thumbnailPreview ? (
                <div className="relative w-32 h-48 rounded-xl overflow-hidden">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => {
                      setThumbnailFile(null);
                      setThumbnailPreview(null);
                      if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
                    }}
                    className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => thumbnailInputRef.current?.click()}
                  className="w-32 h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-purple-400 hover:bg-purple-50 transition-colors"
                >
                  <span className="text-2xl mb-2">📷</span>
                  <p className="text-xs text-gray-500 text-center px-2">Миниатюра кошуу</p>
                </button>
              )}
              <div className="flex-1 flex items-center">
                <p className="text-sm text-gray-500">
                  Миниатюра кошпосоңуз, видеонун биринчи кадры колдонулат
                </p>
              </div>
            </div>
          </div>

          {/* Product Selection */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4">📦 Продукт тандоо</h2>

            <input
              type="text"
              placeholder="Продукт издөө..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    setSelectedProduct(product.id);
                    setTitle(product.title);
                  }}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    selectedProduct === product.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-gray-800 truncate">{product.title}</p>
                    <p className="text-xs text-gray-500">{product.price.toLocaleString()} с</p>
                  </div>
                  {selectedProduct === product.id && (
                    <span className="text-purple-500">✓</span>
                  )}
                </button>
              ))}
            </div>

            {selectedProduct && (
              <div className="mt-4 p-3 bg-purple-50 rounded-xl">
                <p className="text-sm text-purple-700">
                  <strong>Тандалды:</strong> {products.find(p => p.id === selectedProduct)?.title}
                </p>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4">✏️ Видео аталышы</h2>
            <input
              type="text"
              placeholder="Видео аталышын жазыңыз..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Progress */}
          {isUploading && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-3">
                <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full" />
                <p className="font-medium text-gray-800">Жүктөлүүдө...</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2 text-center">{uploadProgress}%</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleUpload}
            disabled={isUploading || !videoFile}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              isUploading || !videoFile
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-200'
            }`}
          >
            {isUploading ? 'Жүктөлүүдө...' : '🚀 Видео жүктөө'}
          </button>
        </div>
      )}
    </div>
  );
}