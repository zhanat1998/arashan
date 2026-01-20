'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';

interface PaymentData {
  id: string;
  amount: number;
  status: string;
  method: string;
  order_number: string;
  paymentUrl?: string;
  qrCode?: string;
  ussdCode?: string;
  instructions?: string[];
  mock?: boolean;
}

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes

  const paymentId = searchParams.get('payment');
  const provider = searchParams.get('provider');

  // Fetch payment details
  useEffect(() => {
    if (!paymentId) {
      setError('Төлөм табылган жок');
      setLoading(false);
      return;
    }

    const fetchPayment = async () => {
      try {
        const response = await fetch(`/api/payments?payment_id=${paymentId}`);
        const data = await response.json();

        if (data.payments && data.payments[0]) {
          const p = data.payments[0];
          setPayment({
            id: p.id,
            amount: p.amount,
            status: p.status,
            method: p.method,
            order_number: p.description?.replace('Буйрутма #', '') || '',
            qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${provider}:${p.provider_id || p.id}`,
            ussdCode: provider === 'odengi' ? `*880*${(p.provider_id || p.id).slice(-8)}#` : undefined,
            instructions: getInstructions(provider || p.method, p.amount),
            mock: !process.env.NEXT_PUBLIC_MBANK_MERCHANT_ID
          });
        }
      } catch (err) {
        setError('Маалымат алууда ката');
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [paymentId, provider]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Check payment status periodically
  useEffect(() => {
    if (!payment || payment.status === 'completed') return;

    const checkStatus = setInterval(async () => {
      try {
        const response = await fetch(`/api/payments?payment_id=${paymentId}`);
        const data = await response.json();

        if (data.payments && data.payments[0]) {
          const newStatus = data.payments[0].status;
          if (newStatus === 'completed') {
            clearCart();
            router.push(`/checkout/success?order=${payment.order_number}`);
          } else if (newStatus === 'failed') {
            setError('Төлөм ишке ашкан жок');
          }
        }
      } catch (err) {
        console.error('Status check error:', err);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(checkStatus);
  }, [payment, paymentId, router, clearCart]);

  const getInstructions = (method: string, amount: number): string[] => {
    const formattedAmount = amount.toLocaleString('ru-RU');

    switch (method) {
      case 'mbank':
        return [
          '1. Mbank колдонмосун ачыңыз',
          '2. "Төлөмдөр" бөлүмүнө өтүңүз',
          '3. QR кодду сканерлеңиз',
          `4. ${formattedAmount} сом төлөңүз`,
          '5. Төлөм ырасталганча күтүңүз'
        ];
      case 'elsom':
        return [
          '1. Elsom колдонмосун ачыңыз',
          '2. "Төлөө" баскычын басыңыз',
          '3. QR кодду сканерлеңиз',
          `4. ${formattedAmount} сом төлөңүз`,
          '5. Төлөм ырасталганча күтүңүз'
        ];
      case 'odengi':
        return [
          '1. O! телефонуңуздан USSD код терүүңүз',
          '2. Же O!Dengi колдонмосунан төлөңүз',
          '3. QR кодду сканерлеңиз',
          `4. ${formattedAmount} сом төлөңүз`,
          '5. Төлөм ырасталганча күтүңүз'
        ];
      default:
        return [];
    }
  };

  const getProviderName = (method: string): string => {
    switch (method) {
      case 'mbank': return 'Mbank';
      case 'elsom': return 'Elsom';
      case 'odengi': return 'O!Dengi';
      default: return method;
    }
  };

  const getProviderColor = (method: string): string => {
    switch (method) {
      case 'mbank': return 'from-green-500 to-green-600';
      case 'elsom': return 'from-blue-500 to-blue-600';
      case 'odengi': return 'from-red-500 to-orange-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Mock payment simulation
  const simulatePayment = async () => {
    setCheckingStatus(true);

    // Simulate payment completion after 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));

    // In mock mode, just redirect to success
    clearCart();
    router.push(`/checkout/success?order=${payment?.order_number}&status=success`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[var(--pdd-red)] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Жүктөлүүдө...</p>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Ката</h1>
          <p className="text-gray-500 mb-6">{error || 'Төлөм табылган жок'}</p>
          <Link
            href="/checkout"
            className="inline-block px-6 py-3 bg-[var(--pdd-red)] text-white font-medium rounded-full hover:bg-[var(--pdd-red-dark)] transition-colors"
          >
            Артка кайтуу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/checkout"
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-gray-800">Төлөм</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Payment Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Provider Header */}
          <div className={`bg-gradient-to-r ${getProviderColor(payment.method)} p-6 text-white text-center`}>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold">{getProviderName(payment.method).charAt(0)}</span>
            </div>
            <h2 className="text-xl font-bold mb-1">{getProviderName(payment.method)} менен төлөө</h2>
            <p className="text-white/80">Буйрутма #{payment.order_number}</p>
          </div>

          {/* Amount */}
          <div className="p-6 border-b border-gray-100 text-center">
            <p className="text-gray-500 text-sm mb-1">Төлөө суммасы</p>
            <p className="text-4xl font-bold text-gray-800">{payment.amount.toLocaleString('ru-RU')} сом</p>
          </div>

          {/* Timer */}
          <div className="px-6 py-4 bg-yellow-50 border-b border-yellow-100 text-center">
            <div className="flex items-center justify-center gap-2 text-yellow-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">
                Төлөм убактысы: <span className="font-bold">{formatTime(timeLeft)}</span>
              </span>
            </div>
          </div>

          {/* QR Code */}
          <div className="p-6 text-center">
            {payment.qrCode && (
              <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-xl mb-4">
                <Image
                  src={payment.qrCode}
                  alt="QR Code"
                  width={200}
                  height={200}
                  className="mx-auto"
                />
              </div>
            )}

            {/* USSD Code for O!Dengi */}
            {payment.ussdCode && (
              <div className="mb-4">
                <p className="text-gray-500 text-sm mb-2">USSD код:</p>
                <div className="inline-block px-6 py-3 bg-gray-100 rounded-xl">
                  <code className="text-xl font-mono font-bold text-gray-800">{payment.ussdCode}</code>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          {payment.instructions && (
            <div className="px-6 pb-6">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Нускама:</h3>
              <ol className="space-y-2">
                {payment.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-gray-600">
                    <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-gray-500">
                      {index + 1}
                    </span>
                    {instruction.replace(/^\d+\.\s*/, '')}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Mock Payment Button (for development) */}
          {payment.mock && (
            <div className="px-6 pb-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                <p className="text-yellow-800 text-sm text-center">
                  <span className="font-bold">Тест режими:</span> Чыныгы төлөм жүрбөйт
                </p>
              </div>
              <button
                onClick={simulatePayment}
                disabled={checkingStatus}
                className="w-full py-4 bg-gradient-to-r from-[var(--pdd-red)] to-[var(--pdd-orange)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {checkingStatus ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Текшерилүүдө...
                  </>
                ) : (
                  <>
                    Төлөмдү симуляциялоо (Тест)
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Status */}
          <div className="px-6 pb-6">
            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              Төлөм күтүлүүдө...
            </div>
          </div>
        </div>

        {/* Help */}
        <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3">Көйгөй барбы?</h3>
          <div className="space-y-3">
            <a
              href="tel:+996555123456"
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-800">Чалуу</p>
                <p className="text-sm text-gray-500">+996 555 123 456</p>
              </div>
            </a>
            <Link
              href="/chat"
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-800">Чат</p>
                <p className="text-sm text-gray-500">Онлайн колдоо</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-[var(--pdd-red)] border-t-transparent rounded-full"></div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
