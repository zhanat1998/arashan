'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { categories } from '@/data/products';

export default function NewProduct() {
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [product, setProduct] = useState({
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    categoryId: '',
    brand: '',
    stock: '',
    colors: '',
    sizes: '',
    hasFreeship: false,
    isGroupBuy: false,
    groupBuyPrice: '',
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'products');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          setImages(prev => [...prev, data.url]);
        }
      } catch (error) {
        console.error('Upload error:', error);
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!product.title || !product.price || images.length === 0) {
      alert('Аталыш, баа жана сүрөт милдеттүү');
      return;
    }

    setIsSaving(true);
    // Here you would save to database
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    setSaved(true);
  };

  if (saved) {
    return (
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Продукт кошулду!</h2>
          <p className="text-gray-500 mb-6">Жаңы продукт ийгиликтүү сакталды</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setSaved(false);
                setProduct({
                  title: '', description: '', price: '', originalPrice: '',
                  categoryId: '', brand: '', stock: '', colors: '', sizes: '',
                  hasFreeship: false, isGroupBuy: false, groupBuyPrice: '',
                });
                setImages([]);
              }}
              className="px-6 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors"
            >
              Дагы кошуу
            </button>
            <Link
              href="/admin/products"
              className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
            >
              Продукттарга
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/products"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Жаңы продукт</h1>
          <p className="text-gray-500 mt-1">Продуктту толтуруп, сактаңыз</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Images */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">📷 Сүрөттөр</h2>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {images.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                <img src={url} alt={`Product ${index}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                {index === 0 && (
                  <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded">
                    Башкы
                  </span>
                )}
              </div>
            ))}

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              {isUploading ? (
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="text-2xl mb-1">➕</span>
                  <span className="text-xs text-gray-500">Кошуу</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">📝 Негизги маалымат</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Аталышы *
              </label>
              <input
                type="text"
                value={product.title}
                onChange={(e) => setProduct(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Мисалы: iPhone 15 Pro Max 256GB"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Сүрөттөмө
              </label>
              <textarea
                value={product.description}
                onChange={(e) => setProduct(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                placeholder="Продукт жөнүндө толук маалымат..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Категория *
                </label>
                <select
                  value={product.categoryId}
                  onChange={(e) => setProduct(prev => ({ ...prev, categoryId: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Тандаңыз</option>
                  {categories.slice(1).map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Бренд
                </label>
                <input
                  type="text"
                  value={product.brand}
                  onChange={(e) => setProduct(prev => ({ ...prev, brand: e.target.value }))}
                  placeholder="Apple, Samsung..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">💰 Баа</h2>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Баасы (сом) *
              </label>
              <input
                type="number"
                value={product.price}
                onChange={(e) => setProduct(prev => ({ ...prev, price: e.target.value }))}
                placeholder="15000"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Эски баасы (сом)
              </label>
              <input
                type="number"
                value={product.originalPrice}
                onChange={(e) => setProduct(prev => ({ ...prev, originalPrice: e.target.value }))}
                placeholder="20000"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Калдык саны
              </label>
              <input
                type="number"
                value={product.stock}
                onChange={(e) => setProduct(prev => ({ ...prev, stock: e.target.value }))}
                placeholder="100"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">🎨 Варианттар</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Түстөр (үтүр менен бөлүңүз)
              </label>
              <input
                type="text"
                value={product.colors}
                onChange={(e) => setProduct(prev => ({ ...prev, colors: e.target.value }))}
                placeholder="Кара, Ак, Көк"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Өлчөмдөр (үтүр менен бөлүңүз)
              </label>
              <input
                type="text"
                value={product.sizes}
                onChange={(e) => setProduct(prev => ({ ...prev, sizes: e.target.value }))}
                placeholder="S, M, L, XL же 128GB, 256GB"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">⚡ Өзгөчөлүктөр</h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100">
              <input
                type="checkbox"
                checked={product.hasFreeship}
                onChange={(e) => setProduct(prev => ({ ...prev, hasFreeship: e.target.checked }))}
                className="w-5 h-5 text-green-500 rounded focus:ring-green-500"
              />
              <div>
                <span className="font-medium text-gray-800">🚚 Акысыз жеткирүү</span>
                <p className="text-sm text-gray-500">Бул продукт акысыз жеткирилет</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100">
              <input
                type="checkbox"
                checked={product.isGroupBuy}
                onChange={(e) => setProduct(prev => ({ ...prev, isGroupBuy: e.target.checked }))}
                className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
              />
              <div className="flex-1">
                <span className="font-medium text-gray-800">👥 Групповой сатып алуу</span>
                <p className="text-sm text-gray-500">Бирге алганда арзан</p>
              </div>
              {product.isGroupBuy && (
                <input
                  type="number"
                  value={product.groupBuyPrice}
                  onChange={(e) => setProduct(prev => ({ ...prev, groupBuyPrice: e.target.value }))}
                  placeholder="Группа баасы"
                  className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              )}
            </label>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
            isSaving
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-200'
          }`}
        >
          {isSaving ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Сакталууда...
            </span>
          ) : (
            '💾 Продукт сактоо'
          )}
        </button>
      </div>
    </div>
  );
}