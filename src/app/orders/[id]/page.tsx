'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  selected_color?: string;
  selected_size?: string;
  product: {
    id: string;
    title: string;
    images: string[];
    price: number;
  };
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  discount_amount: number;
  shipping_fee: number;
  payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  paid_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  shop: {
    id: string;
    name: string;
    logo?: string;
  };
  shipping_address?: {
    id: string;
    recipient_name: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    address: string;
  };
  items: OrderItem[];
}

const STATUS_MAP: Record<string, { label: string; color: string; bgColor: string; icon: string }> = {
  pending: {
    label: 'Төлөм күтүүдө',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    icon: '⏳'
  },
  paid: {
    label: 'Төлөндү',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    icon: '✓'
  },
  shipped: {
    label: 'Жөнөтүлдү',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    icon: '🚚'
  },
  delivered: {
    label: 'Жеткирилди',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    icon: '✓'
  },
  cancelled: {
    label: 'Жокко чыгарылды',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    icon: '✕'
  },
  refunded: {
    label: 'Кайтарылды',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    icon: '↩'
  },
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const { user, loading: authLoading } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Courier tracking simulation for shipped orders
  const [courierPosition, setCourierPosition] = useState({ progress: 65 });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && orderId) {
      fetchOrder();
    }
  }, [user, orderId]);

  // Simulate courier movement for shipped orders
  useEffect(() => {
    if (order?.status === 'shipped') {
      const interval = setInterval(() => {
        setCourierPosition(prev => ({
          progress: Math.min(95, prev.progress + Math.random() * 2)
        }));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [order?.status]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
      } else {
        router.push('/orders');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ky-KG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleConfirmReceived = async () => {
    if (!order) return;
    setActionLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'delivered' }),
      });
      if (response.ok) {
        await fetchOrder();
      }
    } catch (error) {
      console.error('Error updating order:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order || !confirm('Буйрутманы жокко чыгаргыңыз келеби?')) return;
    setActionLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      if (response.ok) {
        await fetchOrder();
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const copyOrderNumber = () => {
    if (order) {
      navigator.clipboard.writeText(order.order_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (!order) return;
    const shareData = {
      title: `Буйрутма #${order.order_number}`,
      text: `Менин буйрутмам ${STATUS_MAP[order.status]?.label || order.status} статусунда. Жалпы: ${order.total_amount.toLocaleString()} ⃀`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        setShowShareModal(true);
      }
    } else {
      setShowShareModal(true);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center py-20">
          <span className="text-5xl mb-4">📦</span>
          <p className="text-gray-500">Буйрутма табылган жок</p>
          <Link href="/orders" className="mt-4 px-6 py-2 bg-red-500 text-white rounded-full text-sm">
            Буйрутмаларга кайтуу
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending;

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-base font-bold">Буйрутма #{order.order_number}</h1>
          <button onClick={handleShare} className="p-2 -mr-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Status Card */}
      <div className={`${statusInfo.bgColor} px-4 py-6`}>
        <div className="flex items-center gap-4">
          <div className="text-4xl">{statusInfo.icon}</div>
          <div>
            <p className={`text-xl font-bold ${statusInfo.color}`}>{statusInfo.label}</p>
            <p className="text-sm text-gray-600 mt-1">
              {order.status === 'shipped' && 'Жеткирүүчү жолдо'}
              {order.status === 'pending' && 'Төлөмдү күтүүдөбүз'}
              {order.status === 'delivered' && 'Буйрутмаңыз ийгиликтүү жеткирилди'}
              {order.status === 'paid' && 'Сатуучу даярдоодо'}
              {order.status === 'cancelled' && 'Буйрутма жокко чыгарылды'}
            </p>
          </div>
        </div>
      </div>

      {/* Map Section for shipped orders */}
      {order.status === 'shipped' && (
        <div className="bg-white mt-2">
          <div className="relative h-40 bg-gradient-to-br from-green-100 to-blue-100 overflow-hidden">
            {/* Map background pattern */}
            <div className="absolute inset-0 opacity-30">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,50 L100,50" stroke="#666" strokeWidth="0.5" fill="none" />
                <path d="M50,0 L50,100" stroke="#666" strokeWidth="0.5" fill="none" />
                <path d="M20,0 L20,100" stroke="#999" strokeWidth="0.3" fill="none" />
                <path d="M80,0 L80,100" stroke="#999" strokeWidth="0.3" fill="none" />
                <path d="M0,20 L100,20" stroke="#999" strokeWidth="0.3" fill="none" />
                <path d="M0,80 L100,80" stroke="#999" strokeWidth="0.3" fill="none" />
              </svg>
            </div>

            {/* Route line */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path
                d="M15,75 Q30,60 45,55 T75,25"
                stroke="#3B82F6"
                strokeWidth="1"
                fill="none"
                strokeDasharray="2,1"
                className="opacity-50"
              />
              <path
                d="M15,75 Q30,60 45,55 T75,25"
                stroke="#3B82F6"
                strokeWidth="1.5"
                fill="none"
                strokeDasharray={`${courierPosition.progress},100`}
              />
            </svg>

            {/* Destination marker */}
            <div className="absolute top-[20%] right-[20%]">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
            </div>

            {/* Courier marker */}
            <div
              className="absolute transition-all duration-1000 ease-linear"
              style={{
                bottom: `${20 + courierPosition.progress * 0.5}%`,
                left: `${15 + courierPosition.progress * 0.6}%`
              }}
            >
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                <span className="text-lg">🛵</span>
              </div>
            </div>

            {/* Shop marker */}
            <div className="absolute bottom-[15%] left-[10%]">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow">
                <span className="text-xs">🏪</span>
              </div>
            </div>
          </div>

          <div className="px-4 py-3 bg-green-50 border-t border-green-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">Курьер жолдо</span>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Болжолдуу убакыт</p>
                <p className="text-sm font-bold text-green-600">15-30 мүнөт</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shipping Address */}
      {order.shipping_address && (
        <div className="bg-white mt-2 px-4 py-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400 mb-1">Жеткирүү дареги</p>
              <p className="font-medium text-sm">
                {order.shipping_address.recipient_name} • {order.shipping_address.phone}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {order.shipping_address.province}, {order.shipping_address.city}, {order.shipping_address.district}
              </p>
              <p className="text-sm text-gray-600">{order.shipping_address.address}</p>
            </div>
          </div>
        </div>
      )}

      {/* Shop & Items */}
      <div className="bg-white mt-2">
        <div className="px-4 py-3 border-b flex items-center gap-3">
          {order.shop?.logo ? (
            <Image
              src={order.shop.logo}
              alt={order.shop.name}
              width={36}
              height={36}
              className="rounded-full"
            />
          ) : (
            <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          )}
          <div className="flex-1">
            <p className="font-medium text-sm">{order.shop?.name || 'Дүкөн'}</p>
          </div>
          <Link
            href={`/shop/${order.shop?.id}`}
            className="text-red-500 text-sm font-medium"
          >
            Дүкөнгө
          </Link>
        </div>

        {/* Order Items */}
        <div className="px-4 py-3 space-y-3">
          {order.items?.map((item) => (
            <Link
              key={item.id}
              href={`/product/${item.product?.id}`}
              className="flex gap-3 group"
            >
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                <Image
                  src={item.product?.images?.[0] || '/placeholder.png'}
                  alt={item.product?.title || 'Product'}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 line-clamp-2 group-hover:text-red-500">
                  {item.product?.title}
                </p>
                {(item.selected_color || item.selected_size) && (
                  <div className="flex items-center gap-2 mt-1">
                    {item.selected_color && (
                      <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 rounded">
                        {item.selected_color}
                      </span>
                    )}
                    {item.selected_size && (
                      <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 rounded">
                        {item.selected_size}
                      </span>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-red-500 font-medium">{item.price.toLocaleString()} ⃀</span>
                  <span className="text-gray-400 text-sm">x{item.quantity}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white mt-2 px-4 py-4">
        <h3 className="font-medium text-sm mb-3">Буйрутма чечилиши</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Товарлардын суммасы</span>
            <span>{subtotal.toLocaleString()} ⃀</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Жеткирүү</span>
            <span className={order.shipping_fee === 0 ? 'text-green-500' : ''}>
              {order.shipping_fee === 0 ? 'Акысыз' : `${order.shipping_fee.toLocaleString()} ⃀`}
            </span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Арзандатуу</span>
              <span>-{order.discount_amount.toLocaleString()} ⃀</span>
            </div>
          )}
          <div className="border-t pt-2 flex justify-between font-medium">
            <span>Жалпы сумма</span>
            <span className="text-red-500 text-lg">{order.total_amount.toLocaleString()} ⃀</span>
          </div>
        </div>
      </div>

      {/* Order Timeline */}
      <div className="bg-white mt-2 px-4 py-4">
        <h3 className="font-medium text-sm mb-3">Буйрутма тарыхы</h3>
        <div className="space-y-0">
          {order.delivered_at && (
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="w-0.5 h-8 bg-green-500"></div>
              </div>
              <div className="flex-1 pb-4">
                <p className="text-sm font-medium text-green-600">Жеткирилди</p>
                <p className="text-xs text-gray-400">{formatDate(order.delivered_at)}</p>
              </div>
            </div>
          )}
          {order.shipped_at && (
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full ${order.status === 'shipped' ? 'bg-purple-500 ring-4 ring-purple-100' : 'bg-purple-500'}`}></div>
                <div className={`w-0.5 h-8 ${order.delivered_at ? 'bg-green-500' : 'bg-gray-200'}`}></div>
              </div>
              <div className="flex-1 pb-4">
                <p className={`text-sm font-medium ${order.status === 'shipped' ? 'text-purple-600' : 'text-gray-800'}`}>Жөнөтүлдү</p>
                <p className="text-xs text-gray-400">{formatDate(order.shipped_at)}</p>
                {order.status === 'shipped' && (
                  <p className="text-xs text-purple-500 mt-0.5">Азыр ушул статуста</p>
                )}
              </div>
            </div>
          )}
          {order.paid_at && (
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full ${order.status === 'paid' ? 'bg-blue-500 ring-4 ring-blue-100' : 'bg-blue-500'}`}></div>
                <div className={`w-0.5 h-8 ${order.shipped_at || order.delivered_at ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
              </div>
              <div className="flex-1 pb-4">
                <p className={`text-sm font-medium ${order.status === 'paid' ? 'text-blue-600' : 'text-gray-800'}`}>Төлөндү</p>
                <p className="text-xs text-gray-400">{formatDate(order.paid_at)}</p>
                {order.status === 'paid' && (
                  <p className="text-xs text-blue-500 mt-0.5">Сатуучу даярдоодо</p>
                )}
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full ${order.status === 'pending' ? 'bg-yellow-500 ring-4 ring-yellow-100' : 'bg-gray-400'}`}></div>
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${order.status === 'pending' ? 'text-yellow-600' : 'text-gray-800'}`}>Буйрутма түзүлдү</p>
              <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
              {order.status === 'pending' && (
                <p className="text-xs text-yellow-500 mt-0.5">Төлөм күтүлүүдө</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Info */}
      <div className="bg-white mt-2 px-4 py-4">
        <h3 className="font-medium text-sm mb-3">Кошумча маалымат</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Буйрутма номери</span>
            <button onClick={copyOrderNumber} className="flex items-center gap-1 text-red-500">
              {order.order_number}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Төлөм ыкмасы</span>
            <span>{order.payment_method || 'Белгиленген эмес'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Товарлар саны</span>
            <span>{order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} даана</span>
          </div>
          {order.notes && (
            <div className="pt-2 border-t mt-2">
              <p className="text-gray-500 mb-1">Эскертүү:</p>
              <p className="text-gray-700">{order.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 flex gap-3 z-30">
        {order.status === 'pending' && (
          <>
            <button
              onClick={handleCancelOrder}
              disabled={actionLoading}
              className="flex-1 py-3 text-center text-sm font-medium text-gray-700 bg-gray-100 rounded-xl disabled:opacity-50"
            >
              Жокко чыгаруу
            </button>
            <Link
              href={`/checkout/pay/${order.id}`}
              className="flex-1 py-3 text-center text-sm font-medium text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-xl"
            >
              Төлөө
            </Link>
          </>
        )}
        {order.status === 'shipped' && (
          <>
            <button
              onClick={() => setShowHelpModal(true)}
              className="flex-1 py-3 text-center text-sm font-medium text-gray-700 bg-gray-100 rounded-xl"
            >
              Жардам
            </button>
            <button
              onClick={handleConfirmReceived}
              disabled={actionLoading}
              className="flex-1 py-3 text-center text-sm font-medium text-white bg-green-500 rounded-xl disabled:opacity-50"
            >
              {actionLoading ? 'Жүктөлүүдө...' : 'Алдым'}
            </button>
          </>
        )}
        {order.status === 'delivered' && (
          <>
            <button
              onClick={() => setShowHelpModal(true)}
              className="flex-1 py-3 text-center text-sm font-medium text-gray-700 bg-gray-100 rounded-xl"
            >
              Жардам
            </button>
            <Link
              href={`/reviews/new?order=${order.id}`}
              className="flex-1 py-3 text-center text-sm font-medium text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-xl"
            >
              Пикир жазуу
            </Link>
          </>
        )}
        {order.status === 'paid' && (
          <>
            <button
              onClick={() => setShowHelpModal(true)}
              className="flex-1 py-3 text-center text-sm font-medium text-gray-700 bg-gray-100 rounded-xl"
            >
              Жардам
            </button>
            <div className="flex-1 py-3 text-center text-sm text-gray-500">
              Даярдалууда...
            </div>
          </>
        )}
        {(order.status === 'cancelled' || order.status === 'refunded') && (
          <>
            <button
              onClick={() => setShowHelpModal(true)}
              className="flex-1 py-3 text-center text-sm font-medium text-gray-700 bg-gray-100 rounded-xl"
            >
              Жардам
            </button>
            <Link
              href="/"
              className="flex-1 py-3 text-center text-sm font-medium text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-xl"
            >
              Дагы сатып алуу
            </Link>
          </>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowShareModal(false)} />
          <div className="relative bg-white w-full rounded-t-2xl p-4 pb-8 animate-slide-up">
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
            <h3 className="text-base font-bold text-center mb-4">Бөлүшүү</h3>
            <div className="grid grid-cols-4 gap-4">
              <a
                href={`https://wa.me/?text=Буйрутма%20%23${order.order_number}%20-%20${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1"
              >
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-xl text-white">📱</span>
                </div>
                <span className="text-xs text-gray-600">WhatsApp</span>
              </a>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=Буйрутма%20%23${order.order_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1"
              >
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-xl text-white">✈️</span>
                </div>
                <span className="text-xs text-gray-600">Telegram</span>
              </a>
              <button onClick={copyLink} className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center">
                  <span className="text-xl text-white">{copied ? '✓' : '🔗'}</span>
                </div>
                <span className="text-xs text-gray-600">{copied ? 'Көчүрүлдү!' : 'Шилтеме'}</span>
              </button>
              <a
                href={`sms:?body=Буйрутма%20%23${order.order_number}%20-%20${encodeURIComponent(window.location.href)}`}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-xl text-white">💬</span>
                </div>
                <span className="text-xs text-gray-600">SMS</span>
              </a>
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full mt-4 py-3 border border-gray-300 rounded-xl text-sm font-medium"
            >
              Жабуу
            </button>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowHelpModal(false)} />
          <div className="relative bg-white w-full rounded-t-2xl p-4 pb-8 animate-slide-up">
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
            <h3 className="text-base font-bold text-center mb-4">Жардам керекпи?</h3>
            <div className="space-y-2">
              <a href="tel:+996555123456" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl active:bg-gray-100">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-lg">📞</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Колдоо кызматына чалуу</p>
                  <p className="text-xs text-gray-500">+996 555 123 456</p>
                </div>
              </a>
              <Link href="/help" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl active:bg-gray-100">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-lg">❓</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Көп берилген суроолор</p>
                  <p className="text-xs text-gray-500">FAQ жооптору</p>
                </div>
              </Link>
              <button
                onClick={() => alert('Арыз жөнөтүлдү! Тез арада байланышабыз.')}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl active:bg-gray-100 w-full text-left"
              >
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-lg">⚠️</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Көйгөй билдирүү</p>
                  <p className="text-xs text-gray-500">Буйрутма боюнча маселе</p>
                </div>
              </button>
            </div>
            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full mt-4 py-3 border border-gray-300 rounded-xl text-sm font-medium"
            >
              Жабуу
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
