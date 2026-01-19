'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

interface FormData {
  name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  apartment: string;
  comment: string;
  deliveryMethod: 'courier' | 'pickup' | 'post';
  paymentMethod: 'card' | 'cash' | 'installment';
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, totalDiscount, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    city: 'Бишкек',
    address: '',
    apartment: '',
    comment: '',
    deliveryMethod: 'courier',
    paymentMethod: 'card',
  });

  const formatPrice = (price: number) => price.toLocaleString('ru-RU');

  const deliveryPrice = formData.deliveryMethod === 'courier' && totalPrice < 5000 ? 500 : 0;
  const finalTotal = totalPrice + deliveryPrice;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Clear cart and redirect to success page
    clearCart();
    router.push('/checkout/success');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Корзина бош</h1>
          <p className="text-gray-500 mb-6">Буйрутма берүү үчүн товар кошуңуз</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-[var(--pdd-red)] text-white font-medium rounded-full hover:bg-[var(--pdd-red-dark)] transition-colors"
          >
            Соода кылуу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32 lg:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-gray-800">Буйрутманы тариздөө</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-[var(--pdd-red)] text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                Байланыш маалыматы
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Атыңыз *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Атыңызды жазыңыз"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--pdd-red)] focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Телефон *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="+996 XXX XXX XXX"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--pdd-red)] focus:border-transparent transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@example.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--pdd-red)] focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-[var(--pdd-red)] text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                Жеткирүү дареги
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Шаар *
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--pdd-red)] focus:border-transparent transition-all bg-white"
                  >
                    <option value="Бишкек">Бишкек</option>
                    <option value="Ош">Ош</option>
                    <option value="Жалал-Абад">Жалал-Абад</option>
                    <option value="Каракол">Каракол</option>
                    <option value="Токмок">Токмок</option>
                    <option value="Нарын">Нарын</option>
                    <option value="Талас">Талас</option>
                    <option value="Баткен">Баткен</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Батир/Офис
                  </label>
                  <input
                    type="text"
                    name="apartment"
                    value={formData.apartment}
                    onChange={handleInputChange}
                    placeholder="Батир, кабат, подъезд"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--pdd-red)] focus:border-transparent transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Дарек *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    placeholder="Көчө, үй номери"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--pdd-red)] focus:border-transparent transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Комментарий
                  </label>
                  <textarea
                    name="comment"
                    value={formData.comment}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Курьерге кошумча маалымат..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--pdd-red)] focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Method */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-[var(--pdd-red)] text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                Жеткирүү ыкмасы
              </h2>
              <div className="space-y-3">
                <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.deliveryMethod === 'courier' ? 'border-[var(--pdd-red)] bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="courier"
                    checked={formData.deliveryMethod === 'courier'}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-[var(--pdd-red)]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">Курьер менен</span>
                      <span className={`font-bold ${totalPrice >= 5000 ? 'text-green-600' : 'text-gray-800'}`}>
                        {totalPrice >= 5000 ? 'Бекер' : '₽500'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">2-5 күн ичинде жеткирилет</p>
                  </div>
                </label>

                <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.deliveryMethod === 'pickup' ? 'border-[var(--pdd-red)] bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="pickup"
                    checked={formData.deliveryMethod === 'pickup'}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-[var(--pdd-red)]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">Өзүм алып кетем</span>
                      <span className="font-bold text-green-600">Бекер</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Бишкек, Чүй пр. 123 (10:00-20:00)</p>
                  </div>
                </label>

                <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.deliveryMethod === 'post' ? 'border-[var(--pdd-red)] bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="post"
                    checked={formData.deliveryMethod === 'post'}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-[var(--pdd-red)]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">Почта менен</span>
                      <span className="font-bold text-gray-800">₽300</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">7-14 күн, Кыргызстан боюнча</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-[var(--pdd-red)] text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                Төлөм ыкмасы
              </h2>
              <div className="space-y-3">
                <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.paymentMethod === 'card' ? 'border-[var(--pdd-red)] bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-[var(--pdd-red)]"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-gray-800">Банк картасы</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-10 h-6 bg-blue-600 rounded text-white text-[8px] font-bold flex items-center justify-center">VISA</div>
                      <div className="w-10 h-6 bg-red-500 rounded text-white text-[8px] font-bold flex items-center justify-center">MC</div>
                      <div className="w-10 h-6 bg-green-600 rounded text-white text-[8px] font-bold flex items-center justify-center">ЭЛКАРТ</div>
                    </div>
                  </div>
                </label>

                <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.paymentMethod === 'cash' ? 'border-[var(--pdd-red)] bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={formData.paymentMethod === 'cash'}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-[var(--pdd-red)]"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-gray-800">Накталай</span>
                    <p className="text-sm text-gray-500 mt-1">Курьерге же алып кетүүдө</p>
                  </div>
                </label>

                <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.paymentMethod === 'installment' ? 'border-[var(--pdd-red)] bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="installment"
                    checked={formData.paymentMethod === 'installment'}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-[var(--pdd-red)]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">Бөлүп төлөө</span>
                      <span className="px-2 py-0.5 bg-yellow-400 text-yellow-800 text-xs font-bold rounded">0%</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">3-12 ай, пайызсыз</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Буйрутма</h2>

              {/* Items */}
              <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.selectedColor}`} className="flex gap-3">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.title}
                        fill
                        className="object-cover"
                      />
                      <span className="absolute bottom-0 right-0 w-5 h-5 bg-[var(--pdd-red)] text-white text-xs font-bold rounded-tl-lg flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 line-clamp-2">{item.product.title}</p>
                      {item.selectedColor && (
                        <p className="text-xs text-gray-500">{item.selectedColor}</p>
                      )}
                      <p className="text-sm font-bold text-[var(--pdd-red)] mt-1">
                        ₽{formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Товарлар ({items.reduce((sum, item) => sum + item.quantity, 0)})</span>
                  <span className="text-gray-800">₽{formatPrice(totalPrice + totalDiscount)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Скидка</span>
                    <span className="text-green-600">-₽{formatPrice(totalDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Жеткирүү</span>
                  <span className={deliveryPrice === 0 ? 'text-green-600' : 'text-gray-800'}>
                    {deliveryPrice === 0 ? 'Бекер' : `₽${formatPrice(deliveryPrice)}`}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <span className="text-lg font-bold text-gray-800">Жалпы</span>
                  <span className="text-2xl font-bold text-[var(--pdd-red)]">₽{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Submit Button - Desktop */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="hidden lg:flex w-full mt-6 py-4 bg-gradient-to-r from-[var(--pdd-red)] to-[var(--pdd-orange)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Жүктөлүүдө...
                  </>
                ) : (
                  <>
                    Буйрутма берүү
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </>
                )}
              </button>

              {/* Security badges */}
              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  SSL коопсуз
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Кепилдик
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Button - Mobile */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden z-40">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-600">Жалпы:</span>
            <span className="text-2xl font-bold text-[var(--pdd-red)]">₽{formatPrice(finalTotal)}</span>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-[var(--pdd-red)] to-[var(--pdd-orange)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Жүктөлүүдө...
              </>
            ) : (
              'Буйрутма берүү'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}