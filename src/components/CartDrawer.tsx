'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    totalItems,
    totalPrice,
    totalDiscount,
    clearCart,
  } = useCart();

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  const formatPrice = (price: number) => price.toLocaleString('ru-RU');

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-slideIn">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-800">Корзина</h2>
            <span className="px-2 py-0.5 bg-[var(--pdd-red)] text-white text-sm font-bold rounded-full">
              {totalItems}
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Корзина бош</h3>
              <p className="text-gray-500 mb-6">Товарларды кошуңуз</p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="px-6 py-2 bg-[var(--pdd-red)] text-white font-medium rounded-full hover:bg-[var(--pdd-red-dark)] transition-colors"
              >
                Соода кылуу
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={`${item.product.id}-${item.selectedColor || 'default'}-${index}`}
                  className="flex gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  {/* Product Image */}
                  <Link
                    href={`/product/${item.product.id}`}
                    onClick={() => setIsCartOpen(false)}
                    className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0"
                  >
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.title}
                      fill
                      className="object-cover"
                    />
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.product.id}`}
                      onClick={() => setIsCartOpen(false)}
                      className="text-sm font-medium text-gray-800 line-clamp-2 hover:text-[var(--pdd-red)] transition-colors"
                    >
                      {item.product.title}
                    </Link>
                    {item.selectedColor && (
                      <p className="text-xs text-gray-500 mt-1">Түсү: {item.selectedColor}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[var(--pdd-red)] font-bold">
                        ₽{formatPrice(item.product.price)}
                      </span>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedColor)}
                          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedColor)}
                          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.product.id, item.selectedColor)}
                    className="self-start p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}

              {/* Clear Cart */}
              <button
                onClick={clearCart}
                className="w-full py-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                Корзинаны тазалоо
              </button>
            </div>
          )}
        </div>

        {/* Footer - Summary & Checkout */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-4 bg-white">
            {/* Discount */}
            {totalDiscount > 0 && (
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="text-gray-600">Үнөмдөө:</span>
                <span className="text-green-600 font-medium">-₽{formatPrice(totalDiscount)}</span>
              </div>
            )}

            {/* Shipping */}
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="text-gray-600">Жеткирүү:</span>
              <span className="text-green-600 font-medium">
                {totalPrice >= 5000 ? 'Бекер' : '₽500'}
              </span>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between mb-4 pt-2 border-t border-gray-100">
              <span className="text-gray-800 font-medium">Жалпы:</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-[var(--pdd-red)]">
                  ₽{formatPrice(totalPrice + (totalPrice >= 5000 ? 0 : 500))}
                </span>
                {totalDiscount > 0 && (
                  <p className="text-xs text-gray-500">
                    ₽{formatPrice(totalDiscount)} үнөмдөдүңүз!
                  </p>
                )}
              </div>
            </div>

            {/* Free shipping progress */}
            {totalPrice < 5000 && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Бекер жеткирүүгө чейин</span>
                  <span>₽{formatPrice(5000 - totalPrice)} калды</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--pdd-red)] to-[var(--pdd-orange)] transition-all duration-300"
                    style={{ width: `${Math.min((totalPrice / 5000) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Checkout Button */}
            <Link
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="w-full py-4 bg-gradient-to-r from-[var(--pdd-red)] to-[var(--pdd-orange)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              Буйрутмага өтүү
            </Link>

            {/* Payment methods */}
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="text-xs text-gray-400">Төлөм:</span>
              <div className="flex items-center gap-1">
                <div className="w-8 h-5 bg-blue-600 rounded text-white text-[8px] font-bold flex items-center justify-center">VISA</div>
                <div className="w-8 h-5 bg-red-500 rounded text-white text-[8px] font-bold flex items-center justify-center">MC</div>
                <div className="w-8 h-5 bg-green-500 rounded text-white text-[8px] font-bold flex items-center justify-center">МИР</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}