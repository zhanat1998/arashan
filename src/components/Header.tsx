'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { totalItems, setIsCartOpen } = useCart();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md">
              <span className="text-2xl">🛒</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold">PinShop</h1>
              <p className="text-xs text-white/80">Арзан баада!</p>
            </div>
          </Link>

          {/* Search */}
          <Link href="/search" className="flex-1 max-w-2xl">
            <div className="relative">
              <div className="w-full py-2.5 pl-4 pr-12 rounded-full bg-white text-gray-400 cursor-pointer hover:bg-gray-50 transition-colors">
                Издөө...
              </div>
              <div className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Seller */}
            {user && (
              <Link
                href="/seller"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Сатуу
              </Link>
            )}

            {/* Notifications */}
            <Link href="/notifications" className="relative w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full"></span>
            </Link>

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 text-[var(--pdd-red)] text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>

            {/* Profile / Login */}
            {user ? (
              <Link href="/profile" className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-red-500 hover:bg-gray-100 rounded-full transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Кирүү
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}