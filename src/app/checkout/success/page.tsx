'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Confetti from '@/components/Confetti';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order') || Math.floor(100000 + Math.random() * 900000).toString();
  const paymentStatus = searchParams.get('status') || 'success';
  const paymentMethod = searchParams.get('method');

  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const isCashPayment = paymentMethod === 'cash';

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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {isCashPayment ? 'Буйрутма кабыл алынды!' : 'Төлөм ийгиликтүү!'}
        </h1>
        <p className="text-gray-600 mb-6">
          {isCashPayment
            ? 'Курьерге накталай төлөйсүз'
            : 'Рахмат сатып алганыңыз үчүн'}
        </p>

        {/* Order Number */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <p className="text-sm text-gray-500 mb-1">Буйрутма номери</p>
          <p className="text-3xl font-bold text-[var(--pdd-red)]">#{orderNumber}</p>

          {/* Payment Method Badge */}
          {paymentMethod && (
            <div className="mt-4 flex justify-center">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                paymentMethod === 'cash'
                  ? 'bg-yellow-100 text-yellow-800'
                  : paymentMethod === 'balance'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-green-100 text-green-800'
              }`}>
                {paymentMethod === 'cash' && '💵 Накталай төлөм'}
                {paymentMethod === 'balance' && '🪙 Баланстан төлөндү'}
                {paymentMethod === 'mbank' && '✓ Mbank менен төлөндү'}
                {paymentMethod === 'elsom' && '✓ Elsom менен төлөндү'}
                {paymentMethod === 'odengi' && '✓ O!Dengi менен төлөндү'}
                {!['cash', 'balance', 'mbank', 'elsom', 'odengi'].includes(paymentMethod) && '✓ Төлөндү'}
              </span>
            </div>
          )}

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
            {/* Step 1: Order Confirmed */}
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

            {/* Step 2: Payment */}
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 ${!isCashPayment ? 'bg-green-500' : 'bg-yellow-500'} rounded-full flex items-center justify-center flex-shrink-0`}>
                {!isCashPayment ? (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-white text-sm font-bold">₸</span>
                )}
              </div>
              <div className="flex-1 text-left">
                <p className={`font-medium ${!isCashPayment ? 'text-gray-800' : 'text-yellow-700'}`}>
                  {!isCashPayment ? 'Төлөм алынды' : 'Накталай төлөнөт'}
                </p>
                <p className="text-xs text-gray-500">
                  {!isCashPayment ? 'Ийгиликтүү' : 'Жеткирүүдө'}
                </p>
              </div>
            </div>

            {/* Step 3: Preparing */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-gray-500 text-sm font-bold">3</span>
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-400">Даярдалууда</p>
                <p className="text-xs text-gray-400">Күтүлүүдө</p>
              </div>
            </div>

            {/* Step 4: Shipping */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-gray-500 text-sm font-bold">4</span>
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-400">Жолдо</p>
                <p className="text-xs text-gray-400">Күтүлүүдө</p>
              </div>
            </div>

            {/* Step 5: Delivered */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-gray-500 text-sm font-bold">5</span>
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
          <Link
            href="/orders"
            className="block w-full py-4 border-2 border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Буйрутмаларды көрүү
          </Link>
        </div>

        {/* Support Info */}
        <div className="mt-8 text-sm text-gray-500">
          <p>Суроолор болсо:</p>
          <p className="font-medium text-gray-700">+996 555 123 456</p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
