'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function UploadVideoPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [products, setProducts] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    product_id: '',
    video_url: '',
    thumbnail_url: '',
  });

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoLoadProgress, setVideoLoadProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState<string>('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/seller/products?limit=100');
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('video/')) {
      setError('Видео файл тандаңыз');
      return;
    }

    // Check file size (max 50MB - Supabase free tier limit)
    if (file.size > 50 * 1024 * 1024) {
      setError('Видео өлчөмү 50MB ашпаш керек (Supabase Free план чеги)');
      return;
    }

    setVideoFile(file);
    setVideoLoading(true);
    setVideoLoadProgress(0);
    setVideoDuration('');
    setVideoPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleVideoLoaded = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    const duration = video.duration;
    if (duration && isFinite(duration)) {
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      setVideoDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }
    setVideoLoadProgress(100);
    setVideoLoading(false);
  };

  const handleVideoProgress = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.buffered.length > 0 && video.duration) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      const progress = Math.round((bufferedEnd / video.duration) * 100);
      setVideoLoadProgress(progress);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const uploadVideo = async (): Promise<string> => {
    if (!videoFile) throw new Error('Видео файл жок');

    const supabase = createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Кирүү керек');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = videoFile.name.split('.').pop();
    const fileName = `${user.id}/${timestamp}-${randomString}.${extension}`;

    // Simulate progress based on file size (estimate ~1MB/sec upload speed)
    const fileSizeMB = videoFile.size / (1024 * 1024);
    const estimatedSeconds = Math.max(fileSizeMB / 1, 3); // At least 3 seconds
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          return prev; // Stop at 90%, wait for actual completion
        }
        return prev + Math.round(90 / estimatedSeconds);
      });
    }, 1000);

    try {
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('videos')
        .upload(fileName, videoFile, {
          contentType: videoFile.type,
          upsert: false,
        });

      clearInterval(progressInterval);

      if (error) {
        throw new Error(error.message || 'Видео жүктөөдө ката кетти');
      }

      setUploadProgress(100);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (err) {
      clearInterval(progressInterval);
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!videoFile && !formData.video_url) {
      setError('Видео файл тандаңыз');
      return;
    }

    setLoading(true);
    setUploadProgress(1);

    try {
      // Upload video
      let videoUrl = formData.video_url;
      if (videoFile) {
        videoUrl = await uploadVideo();
        setUploadProgress(100);
      }

      if (!videoUrl) {
        throw new Error('Видео жүктөлгөн жок');
      }

      // Create video record
      const videoData: any = {
        title: formData.title || 'Видео',
        description: formData.description,
        video_url: videoUrl,
      };

      if (formData.product_id) {
        videoData.product_id = formData.product_id;
      }

      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(videoData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Видео сактоодо ката кетти');
      }

      setUploadProgress(100);
      router.push('/seller/videos');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Видео жүктөө</h1>
        <p className="text-gray-500 mt-1">Товарыңыз үчүн видео кошуңуз</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Video Upload */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Видео файл</h2>

          {!videoPreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center cursor-pointer hover:border-red-300 hover:bg-red-50/50 transition-colors"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium mb-1">Видео файлды тандоо үчүн чыкылдаңыз</p>
              <p className="text-sm text-gray-400">MP4, MOV, AVI (максимум 50MB)</p>
            </div>
          ) : (
            <div className="relative">
              {/* Loading overlay */}
              {videoLoading && (
                <div className="absolute inset-0 bg-black/80 rounded-xl flex flex-col items-center justify-center z-10">
                  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-white font-medium">Видео жүктөлүүдө...</p>
                </div>
              )}

              <video
                src={videoPreview}
                controls
                onLoadedMetadata={handleVideoLoaded}
                onCanPlay={() => setVideoLoading(false)}
                className="w-full max-h-96 rounded-xl bg-black"
              />

              {/* Video info */}
              {!videoLoading && videoFile && (
                <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>{videoFile.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                    <span>{formatFileSize(videoFile.size)}</span>
                  </div>
                  {videoDuration && (
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{videoDuration}</span>
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setVideoFile(null);
                  setVideoPreview(null);
                  setVideoLoading(false);
                  setVideoDuration('');
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Upload Progress */}
          {loading && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 font-medium">
                  {uploadProgress < 100 ? 'Серверге жүктөлүүдө...' : 'Видео сакталууда...'}
                </span>
                <span className="text-red-500 font-bold">{uploadProgress}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-150"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              {videoFile && (
                <p className="text-xs text-gray-400 mt-2">
                  {formatFileSize(Math.round(videoFile.size * uploadProgress / 100))} / {formatFileSize(videoFile.size)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Видео маалыматы</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Аталышы
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Мисалы: Товар жөнүндө видео"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Сүрөттөмө
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Видео жөнүндө кыскача маалымат..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Байланыштуу товар (милдеттүү эмес)
              </label>
              <select
                value={formData.product_id}
                onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              >
                <option value="">Товар тандаңыз</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.title} - {product.price?.toLocaleString()} c
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Товар тандасаңыз, видео ошол товар менен байланышат
              </p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Жокко чыгаруу
          </button>
          <button
            type="submit"
            disabled={loading || (!videoFile && !formData.video_url)}
            className="px-8 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium rounded-xl hover:from-red-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Жүктөлүүдө...
              </>
            ) : (
              <>
                Видео жүктөө
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
