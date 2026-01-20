'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
  created_at: string;
  shop: {
    id: string;
    name: string;
    logo?: string;
  };
  items: OrderItem[];
}

const STATUS_MAP: Record<string, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Күтүүдө', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  paid: { label: 'Төлөндү', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  shipped: { label: 'Жөнөтүлдү', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  delivered: { label: 'Жеткирилди', color: 'text-green-600', bgColor: 'bg-green-50' },
  cancelled: { label: 'Жокко чыгарылды', color: 'text-red-600', bgColor: 'bg-red-50' },
  refunded: { label: 'Кайтарылды', color: 'text-gray-600', bgColor: 'bg-gray-50' },
};

const TABS = [
  { id: 'all', label: 'Баары' },
  { id: 'pending', label: 'Күтүүдө' },
  { id: 'paid', label: 'Төлөндү' },
  { id: 'shipped', label: 'Жөнөтүлдү' },
  { id: 'delivered', label: 'Жеткирилди' },
];

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, activeTab]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const url = activeTab === 'all'
        ? '/api/orders'
        : `/api/orders?status=${activeTab}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />

      {/* Page Header */}
      <div className="bg-white border-b sticky top-[60px] z-30">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 -ml-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold">Менин буйрутмаларым</h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : orders.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Буйрутмалар жок</h2>
            <p className="text-gray-500 mb-6">
              Сиз азырынча эч нерсе буйрутма кылган жоксуз
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-medium"
            >
              Сатып алууга
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
                {/* Order Header */}
                <div className="px-4 py-3 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {order.shop?.logo ? (
                      <Image
                        src={order.shop.logo}
                        alt={order.shop.name}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm">{order.shop?.name || 'Дүкөн'}</p>
                      <p className="text-xs text-gray-500">#{order.order_number}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_MAP[order.status]?.bgColor} ${STATUS_MAP[order.status]?.color}`}>
                    {STATUS_MAP[order.status]?.label || order.status}
                  </span>
                </div>

                {/* Order Items */}
                <Link href={`/orders/${order.id}`} className="block">
                  <div className="p-4 space-y-3">
                    {order.items?.slice(0, 2).map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative w-20 h-20 flex-shrink-0">
                          <Image
                            src={item.product?.images?.[0] || '/placeholder.png'}
                            alt={item.product?.title || 'Product'}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-800 line-clamp-2">
                            {item.product?.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            {item.selected_color && <span>Түсү: {item.selected_color}</span>}
                            {item.selected_size && <span>Өлчөмү: {item.selected_size}</span>}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-red-500 font-medium">{item.price.toLocaleString()} ⃀</span>
                            <span className="text-gray-500 text-sm">x{item.quantity}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {order.items?.length > 2 && (
                      <p className="text-sm text-gray-500 text-center">
                        +{order.items.length - 2} дагы товар
                      </p>
                    )}
                  </div>
                </Link>

                {/* Order Footer */}
                <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    {formatDate(order.created_at)}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Жалпы сумма:</p>
                    <p className="text-lg font-bold text-red-500">
                      {order.total_amount?.toLocaleString()} ⃀
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-4 py-3 border-t flex gap-2">
                  <Link
                    href={`/orders/${order.id}`}
                    className="flex-1 py-2 text-center text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Деталдар
                  </Link>
                  {order.status === 'delivered' && (
                    <button className="flex-1 py-2 text-center text-sm font-medium text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-lg hover:from-red-600 hover:to-orange-600 transition-colors">
                      Пикир жазуу
                    </button>
                  )}
                  {order.status === 'pending' && (
                    <button className="flex-1 py-2 text-center text-sm font-medium text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-lg hover:from-red-600 hover:to-orange-600 transition-colors">
                      Төлөө
                    </button>
                  )}
                  {order.status === 'shipped' && (
                    <button className="flex-1 py-2 text-center text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors">
                      Алдым
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
