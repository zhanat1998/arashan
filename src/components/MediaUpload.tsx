'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface MediaUploadProps {
  onUpload: (url: string) => void;
  accept?: 'image' | 'video' | 'both';
  folder?: string;
  maxSize?: number; // in MB
  className?: string;
}

export default function MediaUpload({
  onUpload,
  accept = 'both',
  folder = 'uploads',
  maxSize = 50,
  className = '',
}: MediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAcceptTypes = () => {
    switch (accept) {
      case 'image':
        return 'image/*';
      case 'video':
        return 'video/*';
      default:
        return 'image/*,video/*';
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      setError(`Файл өтө чоң. Максимум ${maxSize}MB`);
      return;
    }

    setError(null);
    setIsUploading(true);
    setProgress(0);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setProgress(100);
      onUpload(data.url);
    } catch (err) {
      setError('Жүктөө катасы. Кайра аракет кылыңыз.');
      setPreview(null);
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const isVideo = preview?.startsWith('data:video');

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptTypes()}
        onChange={handleFileSelect}
        className="hidden"
        id="media-upload"
      />

      {!preview && !isUploading && (
        <label
          htmlFor="media-upload"
          className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className="w-10 h-10 mb-3 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Басып жүктөңүз</span>
            </p>
            <p className="text-xs text-gray-400">
              {accept === 'image' && 'PNG, JPG, GIF'}
              {accept === 'video' && 'MP4, MOV, AVI'}
              {accept === 'both' && 'Сүрөт же видео'}
              {' '}(макс. {maxSize}MB)
            </p>
          </div>
        </label>
      )}

      {isUploading && (
        <div className="flex flex-col items-center justify-center w-full h-40 border-2 border-orange-300 rounded-xl bg-orange-50">
          <div className="w-3/4 bg-gray-200 rounded-full h-2 mb-3">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600">Жүктөлүүдө... {progress}%</p>
        </div>
      )}

      {preview && !isUploading && (
        <div className="relative w-full h-40 rounded-xl overflow-hidden">
          {isVideo ? (
            <video
              src={preview}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
            />
          ) : (
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
            />
          )}
          <button
            onClick={() => {
              setPreview(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="absolute bottom-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            ✓ Жүктөлдү
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}