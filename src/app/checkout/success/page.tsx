'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Confetti from '@/components/Confetti';

export default function CheckoutSuccessPage() {
  const [orderNumber] = useState(() => Math.floor(100000 + Math.random() * 900000));
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      {showConfetti && <Confetti />}

      <div className="max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
          <div className="relative w-full h-full bg-green-500 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Буйрутма кабыл алынды!</h1>
        <p className="text-gray-600 mb-6">Рахмат сатып алганыңыз үчүн</p>

        {/* Order Number */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <p className="text-sm text-gray-500 mb-1">Буйрутма номери</p>
          <p className="text-3xl font-bold text-[var(--pdd-red)]">#{orderNumber}</p>
          <div className="mt-4 p-3 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600">
              Буйрутмаңыздын статусу жөнүндө SMS жана email аркылуу кабарлайбыз
            </p>
          </div>
        </div>

        {/* Order Status Steps */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <h3 className="font-bold text-gray-800 mb-4 text-left">Буйрутма статусу</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-800">Буйрутма кабыл алынды</p>
                <p className="text-xs text-gray-500">Азыр</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-gray-500 text-sm font-bold">2</span>
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-400">Даярдалууда</p>
                <p className="text-xs text-gray-400">Күтүлүүдө</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-gray-500 text-sm font-bold">3</span>
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-400">Жолдо</p>
                <p className="text-xs text-gray-400">Күтүлүүдө</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-gray-500 text-sm font-bold">4</span>
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-400">Жеткирилди</p>
                <p className="text-xs text-gray-400">Күтүлүүдө</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full py-4 bg-gradient-to-r from-[var(--pdd-red)] to-[var(--pdd-orange)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            Соода улантуу
          </Link>
          <button className="w-full py-4 border-2 border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors">
            Буйрутманы көрүү
          </button>
        </div>

        {/* Support Info */}
        <div className="mt-8 text-sm text-gray-500">
          <p>Суроолор болсо:</p>
          <p className="font-medium text-gray-700">+996 XXX XXX XXX</p>
        </div>
      </div>
    </div>
  );
}