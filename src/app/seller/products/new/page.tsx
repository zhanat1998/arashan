'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Каталарды кыргызчага которуу
const translateError = (error: string): string => {
  if (!error) return 'Белгисиз ката';

  const errorLower = error.toLowerCase();

  // Маалымат базасы каталары
  if (errorLower.includes('could not find') && errorLower.includes('column')) {
    // Колонка атын табуу
    const match = error.match(/'([^']+)'/);
    const columnName = match ? match[1] : 'белгисиз';
    return `Маалымат базасында "${columnName}" колонкасы табылган жок. Администраторго кайрылыңыз.`;
  }

  if (errorLower.includes('row-level security') || errorLower.includes('rls')) {
    return 'Уруксат жок. RLS policy текшериңиз же администраторго кайрылыңыз.';
  }

  if (errorLower.includes('violates foreign key')) {
    return 'Байланыш катасы. Категория же башка талаа туура эмес.';
  }

  if (errorLower.includes('duplicate key') || errorLower.includes('already exists')) {
    return 'Бул маалымат мурунтан эле бар.';
  }

  if (errorLower.includes('not null') || errorLower.includes('cannot be null')) {
    return 'Милдеттүү талааларды толтуруңуз.';
  }

  // Аутентификация каталары
  if (errorLower.includes('unauthorized') || errorLower.includes('not authenticated')) {
    return 'Кирүү керек. Кайра кириңиз.';
  }

  if (errorLower.includes('forbidden') || errorLower.includes('permission denied')) {
    return 'Бул аракетке уруксатыңыз жок.';
  }

  // Файл каталары
  if (errorLower.includes('payload too large') || errorLower.includes('file too large')) {
    return 'Файл өтө чоң (максимум 50MB).';
  }

  if (errorLower.includes('invalid file type')) {
    return 'Файл түрү колдоого алынбайт.';
  }

  // Тармак каталары
  if (errorLower.includes('network') || errorLower.includes('fetch failed')) {
    return 'Тармак катасы. Интернет байланышын текшериңиз.';
  }

  if (errorLower.includes('timeout')) {
    return 'Өтө көп убакыт кетти. Кайра аракет кылыңыз.';
  }

  // Валидация каталары
  if (errorLower.includes('invalid') || errorLower.includes('validation')) {
    return 'Маалымат туура эмес форматта.';
  }

  if (errorLower.includes('required')) {
    return 'Милдеттүү талааларды толтуруңуз.';
  }

  // Жалпы катаар - оригиналды көрсөтүү
  if (error.includes('Error') || error.includes('error')) {
    return `Ката кетти: ${error}`;
  }

  return error;
};

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    original_price: '',
    stock: '',
    category_id: '',
    images: [] as string[],
    is_group_buy: false,
    group_buy_price: '',
    group_buy_min: '',
    is_flash_sale: false,
    flash_sale_price: '',
    flash_sale_ends_at: '',
    colors: [] as string[],
    sizes: [] as string[],
  });

  const [newColor, setNewColor] = useState('');
  const [newSize, setNewSize] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (res.ok) {
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        return data.url;
      });

      const urls = await Promise.all(uploadPromises);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...urls.filter(Boolean)],
      }));
    } catch (error: any) {
      console.error('Error uploading images:', error);
      setError(translateError(error?.message || 'Сүрөт жүктөөдө ката кетти'));
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const addColor = () => {
    if (newColor && !formData.colors.includes(newColor)) {
      setFormData((prev) => ({
        ...prev,
        colors: [...prev.colors, newColor],
      }));
      setNewColor('');
    }
  };

  const removeColor = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((c) => c !== color),
    }));
  };

  const addSize = () => {
    if (newSize && !formData.sizes.includes(newSize)) {
      setFormData((prev) => ({
        ...prev,
        sizes: [...prev.sizes, newSize],
      }));
      setNewSize('');
    }
  };

  const removeSize = (size: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((s) => s !== size),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title) {
      setError('Товар атын киргизиңиз');
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Туура баа киргизиңиз');
      return;
    }

    if (formData.images.length === 0) {
      setError('Жок дегенде 1 сүрөт кошуңуз');
      return;
    }

    setLoading(true);

    try {
      const productData: any = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
        images: formData.images,
        is_active: true,
      };

      if (formData.original_price) {
        productData.original_price = parseFloat(formData.original_price);
      }

      if (formData.category_id) {
        productData.category_id = formData.category_id;
      }

      if (formData.colors.length > 0) {
        productData.colors = formData.colors;
      }

      if (formData.sizes.length > 0) {
        productData.sizes = formData.sizes;
      }

      if (formData.is_group_buy) {
        productData.is_group_buy = true;
        productData.group_buy_price = parseFloat(formData.group_buy_price) || productData.price;
        productData.group_buy_min = parseInt(formData.group_buy_min) || 2;
      }

      if (formData.is_flash_sale) {
        productData.is_flash_sale = true;
        productData.flash_sale_price = parseFloat(formData.flash_sale_price) || productData.price;
        if (formData.flash_sale_ends_at) {
          productData.flash_sale_ends_at = new Date(formData.flash_sale_ends_at).toISOString();
        }
      }

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Товар кошууда ката кетти');
      }

      router.push('/seller/products');
    } catch (err: any) {
      setError(translateError(err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Жаңы товар кошуу</h1>
        <p className="text-gray-500 mt-1">Товарыңыздын маалыматын толтуруңуз</p>
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
        {/* Images */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Сүрөттөр</h2>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {formData.images.map((url, index) => (
              <div key={index} className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden group">
                <Image src={url} alt={`Image ${index + 1}`} fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}

            <label className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-red-300 hover:bg-red-50/50 transition-colors">
              {uploadingImages ? (
                <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-xs text-gray-400 mt-1">Кошуу</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Негизги маалымат</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Товар аты *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Мисалы: Кыргыз жибек шарф"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Сүрөттөмө
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="Товар жөнүндө толук маалымат..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Категория
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              >
                <option value="">Тандаңыз</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Саны (шт)
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="100"
                min="0"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Баа</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Сатуу баасы *
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="1500"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">сом</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Мурунку баа (Арзандатуу)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.original_price}
                  onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                  placeholder="2000"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">сом</span>
              </div>
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Варианттар</h2>

          <div className="space-y-4">
            {/* Colors */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Түстөр
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.colors.map((color) => (
                  <span
                    key={color}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg text-sm"
                  >
                    {color}
                    <button type="button" onClick={() => removeColor(color)}>
                      <svg className="w-4 h-4 text-gray-400 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  placeholder="Мисалы: Кызыл"
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                />
                <button
                  type="button"
                  onClick={addColor}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
                >
                  Кошуу
                </button>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Өлчөмдөр
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.sizes.map((size) => (
                  <span
                    key={size}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg text-sm"
                  >
                    {size}
                    <button type="button" onClick={() => removeSize(size)}>
                      <svg className="w-4 h-4 text-gray-400 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  placeholder="Мисалы: XL"
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
                />
                <button
                  type="button"
                  onClick={addSize}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
                >
                  Кошуу
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Special Offers */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Атайын сунуштар</h2>

          <div className="space-y-6">
            {/* Group Buy */}
            <div className="p-4 border border-gray-200 rounded-xl">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_group_buy}
                  onChange={(e) => setFormData({ ...formData, is_group_buy: e.target.checked })}
                  className="w-5 h-5 text-red-500 rounded focus:ring-red-500"
                />
                <div>
                  <span className="font-medium text-gray-800">Группалык сатып алуу</span>
                  <p className="text-sm text-gray-500">Көп адам сатып алса арзаныраак баа</p>
                </div>
              </label>

              {formData.is_group_buy && (
                <div className="grid gap-4 md:grid-cols-2 mt-4 pt-4 border-t">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Группалык баа
                    </label>
                    <input
                      type="number"
                      value={formData.group_buy_price}
                      onChange={(e) => setFormData({ ...formData, group_buy_price: e.target.value })}
                      placeholder="1200"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Минималдык адам саны
                    </label>
                    <input
                      type="number"
                      value={formData.group_buy_min}
                      onChange={(e) => setFormData({ ...formData, group_buy_min: e.target.value })}
                      placeholder="2"
                      min="2"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Flash Sale */}
            <div className="p-4 border border-gray-200 rounded-xl">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_flash_sale}
                  onChange={(e) => setFormData({ ...formData, is_flash_sale: e.target.checked })}
                  className="w-5 h-5 text-red-500 rounded focus:ring-red-500"
                />
                <div>
                  <span className="font-medium text-gray-800">Flash Sale</span>
                  <p className="text-sm text-gray-500">Убактылуу чоң арзандатуу</p>
                </div>
              </label>

              {formData.is_flash_sale && (
                <div className="grid gap-4 md:grid-cols-2 mt-4 pt-4 border-t">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Flash Sale баасы
                    </label>
                    <input
                      type="number"
                      value={formData.flash_sale_price}
                      onChange={(e) => setFormData({ ...formData, flash_sale_price: e.target.value })}
                      placeholder="999"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Бүтө турган убакыт
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.flash_sale_ends_at}
                      onChange={(e) => setFormData({ ...formData, flash_sale_ends_at: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              )}
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
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium rounded-xl hover:from-red-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Сакталууда...
              </>
            ) : (
              <>
                Товар кошуу
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
