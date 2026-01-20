'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

interface ReviewFormProps {
  productId?: string;
  videoId?: string;
  orderId?: string;
  orderItemId?: string;
  selectedOptions?: Record<string, string>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ReviewForm({
  productId,
  videoId,
  orderId,
  orderItemId,
  selectedOptions,
  onSuccess,
  onCancel
}: ReviewFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ratingLabels = ['Өтө жаман', 'Жаман', 'Орто', 'Жакшы', 'Өтө жакшы'];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || images.length >= 5) return;

    const remainingSlots = 5 - images.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    for (const file of filesToUpload) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Сүрөт өлчөмү 5MB ашпашы керек');
        continue;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Сүрөт гана жүктөй аласыз');
        continue;
      }

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'reviews');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Жүктөө ишке ашкан жок');

        const data = await response.json();
        setImages(prev => [...prev, data.url]);
      } catch {
        setError('Сүрөт жүктөөдө ката болду');
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('Кирүү керек');
      return;
    }

    if (rating < 1 || rating > 5) {
      setError('Рейтинг тандаңыз');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          video_id: videoId,
          order_id: orderId,
          order_item_id: orderItemId,
          rating,
          content: content.trim() || null,
          images,
          selected_options: selectedOptions || {},
          is_anonymous: isAnonymous
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ката болду');
      }

      // Reset form
      setRating(5);
      setContent('');
      setImages([]);
      setIsAnonymous(false);

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ката болду');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-gray-500 text-sm">Пикир жазуу үчүн кирүү керек</p>
        <a href="/auth/login" className="text-orange-500 text-sm font-medium">Кирүү</a>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4">
      <h3 className="font-medium text-gray-800 mb-4">Пикир жазуу</h3>

      {/* Rating Stars */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-0.5"
              >
                <svg
                  className={`w-8 h-8 ${
                    star <= (hoverRating || rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
          </div>
          <span className="text-sm text-gray-600">{ratingLabels[(hoverRating || rating) - 1]}</span>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Пикириңизди жазыңыз (милдеттүү эмес)..."
          className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
          rows={4}
          maxLength={1000}
        />
        <div className="text-right text-xs text-gray-400 mt-1">
          {content.length}/1000
        </div>
      </div>

      {/* Image Upload */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {images.map((url, index) => (
            <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden group">
              <Image src={url} alt={`Review image ${index + 1}`} fill className="object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          {images.length < 5 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-orange-500 hover:text-orange-500 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-[10px] mt-1">{images.length}/5</span>
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />
        <p className="text-xs text-gray-400 mt-2">Максимум 5 сүрөт, ар бири 5MB чейин</p>
      </div>

      {/* Anonymous Option */}
      <div className="mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
          />
          <span className="text-sm text-gray-600">Аноним катары жазуу</span>
        </label>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium"
          >
            Жокко чыгаруу
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {isLoading ? 'Жүктөлүүдө...' : 'Жөнөтүү'}
        </button>
      </div>
    </div>
  );
}
