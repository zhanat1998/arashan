'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLogin = pathname === '/auth/login';

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">🛒</span>
          </div>
          <span className="text-white font-bold text-xl">PinShop</span>
        </Link>
        <Link
          href="/"
          className="text-white/80 hover:text-white text-sm flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Артка
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              <Link
                href="/auth/login"
                className={`flex-1 py-4 text-center font-medium transition-colors ${
                  isLogin
                    ? 'text-red-500 border-b-2 border-red-500'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Кирүү
              </Link>
              <Link
                href="/auth/register"
                className={`flex-1 py-4 text-center font-medium transition-colors ${
                  !isLogin
                    ? 'text-red-500 border-b-2 border-red-500'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Катталуу
              </Link>
            </div>

            {/* Form Content */}
            <div className="p-6">
              {children}
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              Улантуу менен сиз биздин{' '}
              <Link href="/terms" className="text-white underline">
                Колдонуу шарттарын
              </Link>{' '}
              кабыл аласыз
            </p>
          </div>
        </div>
      </main>

      {/* Decorative Elements */}
      <div className="fixed top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl" />
      <div className="fixed bottom-20 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
      <div className="fixed top-1/2 left-5 w-16 h-16 bg-yellow-400/20 rounded-full blur-lg" />
    </div>
  );
}
