'use client';

import { useState, useRef } from 'react';

export default function AdminShop() {
  const [shopData, setShopData] = useState({
    name: 'Менин дүкөнүм',
    description: 'Сапаттуу товарлар адилет баада',
    phone: '+996 555 123456',
    email: 'shop@example.com',
    address: 'Бишкек, Чүй проспекти 123',
    workingHours: '09:00 - 21:00',
    logo: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200&h=200&fit=crop',
  });

  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLogoUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'logos');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setShopData(prev => ({ ...prev, logo: data.url }));
      }
    } catch (error) {
      console.error('Logo upload error:', error);
    } finally {
      setIsLogoUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Here you would save to database
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Дүкөн жөндөөлөрү</h1>
        <p className="text-gray-500 mt-1">Дүкөнүңүздүн маалыматтарын өзгөртүңүз</p>
      </div>

      <div className="space-y-6">
        {/* Logo Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">🏪 Дүкөн логотиби</h2>

          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="hidden"
          />

          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100">
                <img
                  src={shopData.logo}
                  alt="Shop logo"
                  className="w-full h-full object-cover"
                />
              </div>
              {isLogoUploading && (
                <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div>
              <button
                onClick={() => logoInputRef.current?.click()}
                disabled={isLogoUploading}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Логотип өзгөртүү
              </button>
              <p className="text-xs text-gray-500 mt-2">PNG, JPG. Максимум 2MB</p>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">📝 Негизги маалымат</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дүкөн аты
              </label>
              <input
                type="text"
                value={shopData.name}
                onChange={(e) => setShopData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Сүрөттөмө
              </label>
              <textarea
                value={shopData.description}
                onChange={(e) => setShopData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">📞 Байланыш</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Телефон
              </label>
              <input
                type="tel"
                value={shopData.phone}
                onChange={(e) => setShopData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={shopData.email}
                onChange={(e) => setShopData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дарек
              </label>
              <input
                type="text"
                value={shopData.address}
                onChange={(e) => setShopData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Иш убактысы
              </label>
              <input
                type="text"
                value={shopData.workingHours}
                onChange={(e) => setShopData(prev => ({ ...prev, workingHours: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">💳 Төлөм ыкмалары</h2>

          <div className="space-y-3">
            {[
              { name: 'Накталай акча', icon: '💵', enabled: true },
              { name: 'Банк картасы', icon: '💳', enabled: true },
              { name: 'Элсом', icon: '📱', enabled: false },
              { name: 'Мбанк', icon: '🏦', enabled: false },
              { name: 'О! Деньги', icon: '📲', enabled: true },
            ].map((method, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{method.icon}</span>
                  <span className="font-medium text-gray-800">{method.name}</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={method.enabled} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">🚚 Жеткирүү</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-gray-800">Акысыз жеткирүү</p>
                <p className="text-sm text-gray-500">3000 сомдон ашканда</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Жеткирүү баасы
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  defaultValue={150}
                  className="w-32 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <span className="text-gray-500">сом</span>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between">
          {saved && (
            <div className="flex items-center gap-2 text-green-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">Сакталды!</span>
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`ml-auto px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl transition-all ${
              isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-orange-200'
            }`}
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Сакталууда...
              </span>
            ) : (
              '💾 Сактоо'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}