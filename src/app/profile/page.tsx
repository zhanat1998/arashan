'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface UserProfile {
  id: string;
  email: string;
  phone: string | null;
  fullName: string;
  avatarUrl: string | null;
  coins: number;
  couponsCount: number;
  level: string;
  balance: number;
}

interface ProfileStats {
  ordersCount: number;
  favoritesCount: number;
  totalSpent: number;
  statusCounts: {
    pending: number;
    paid: number;
    shipped: number;
    delivered: number;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  items: any[];
  itemsCount: number;
  firstImage: string | null;
  createdAt: string;
}

interface FavoriteItem {
  id: string;
  product: {
    id: string;
    title: string;
    price: number;
    original_price?: number;
    images: string[];
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'favorites' | 'settings'>('orders');

  // Data states
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  // Fetch profile data
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, authLoading, router]);

  // Fetch orders when tab changes to orders
  useEffect(() => {
    if (activeTab === 'orders' && user && orders.length === 0) {
      fetchOrders();
    }
  }, [activeTab, user]);

  // Fetch favorites when tab changes to favorites
  useEffect(() => {
    if (activeTab === 'favorites' && user && favorites.length === 0) {
      fetchFavorites();
    }
  }, [activeTab, user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await fetch('/api/orders?limit=10');
      if (response.ok) {
        const data = await response.json();
        // Transform orders data
        const transformedOrders = (data.orders || []).map((order: any) => ({
          id: order.id,
          orderNumber: order.order_number,
          status: order.status,
          totalAmount: order.total_amount,
          items: order.items || [],
          itemsCount: order.items?.length || 0,
          firstImage: order.items?.[0]?.product?.images?.[0] || null,
          createdAt: order.created_at,
        }));
        setOrders(transformedOrders);
      }
    } catch (error) {
      console.error('Orders fetch error:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      setFavoritesLoading(true);
      const response = await fetch('/api/wishlist');
      if (response.ok) {
        const data = await response.json();
        setFavorites(data.wishlist || []);
      }
    } catch (error) {
      console.error('Favorites fetch error:', error);
    } finally {
      setFavoritesLoading(false);
    }
  };

  const removeFromFavorites = async (productId: string) => {
    try {
      const response = await fetch(`/api/wishlist?product_id=${productId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setFavorites(prev => prev.filter(item => item.product.id !== productId));
        if (stats) {
          setStats({ ...stats, favoritesCount: stats.favoritesCount - 1 });
        }
      }
    } catch (error) {
      console.error('Remove favorite error:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const formatPrice = (price: number) => price.toLocaleString('ru-RU');
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU');
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return 'Жеткирилди';
      case 'shipped': return 'Жолдо';
      case 'paid': return 'Төлөндү';
      case 'pending': return 'Күтүүдө';
      case 'cancelled': return 'Жокко чыгарылды';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'shipped': return 'text-blue-600 bg-blue-50';
      case 'paid': return 'text-purple-600 bg-purple-50';
      case 'pending': return 'text-orange-600 bg-orange-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Жүктөлүүдө...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--pdd-gray)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--pdd-red)] to-[var(--pdd-orange)] text-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Артка</span>
            </Link>
            <h1 className="text-lg font-bold">Менин профилим</h1>
            <button
              onClick={() => setActiveTab('settings')}
              className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* User Info Card */}
        <div className="max-w-7xl mx-auto px-4 pb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/30 bg-white/20">
                {profile?.avatarUrl ? (
                  <Image
                    src={profile.avatarUrl}
                    alt={profile.fullName}
                    width={80}
                    height={80}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">
                    {profile?.fullName?.[0] || '👤'}
                  </div>
                )}
              </div>
              {profile?.level && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-yellow-400 text-red-600 text-xs font-bold rounded-full">
                  {profile.level}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{profile?.fullName || 'Колдонуучу'}</h2>
              <p className="text-white/80 text-sm">{profile?.phone || profile?.email || ''}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
                  {profile?.coins || 0} упай
                </span>
              </div>
            </div>
            <Link href="/profile/edit" className="px-4 py-2 bg-white/20 rounded-full text-sm font-medium hover:bg-white/30 transition-colors">
              Өзгөртүү
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 -mt-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-[var(--pdd-red)]">{stats?.ordersCount || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Буйрутмалар</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-[var(--pdd-orange)]">{stats?.favoritesCount || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Сүйүктүүлөр</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-green-600">₽{formatPrice(stats?.totalSpent || 0)}</p>
            <p className="text-xs text-gray-500 mt-1">Жалпы сатып алуу</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3">Буйрутма статусу</h3>
          <div className="grid grid-cols-4 gap-2">
            <button className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-xl transition-colors relative">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              {(stats?.statusCounts?.pending || 0) > 0 && (
                <span className="absolute top-2 right-4 w-5 h-5 bg-[var(--pdd-red)] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {stats?.statusCounts?.pending}
                </span>
              )}
              <span className="text-xs text-gray-600">Төлөө</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-xl transition-colors relative">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              {(stats?.statusCounts?.paid || 0) > 0 && (
                <span className="absolute top-2 right-4 w-5 h-5 bg-[var(--pdd-red)] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {stats?.statusCounts?.paid}
                </span>
              )}
              <span className="text-xs text-gray-600">Жөнөтүү</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-xl transition-colors relative">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
              </div>
              {(stats?.statusCounts?.shipped || 0) > 0 && (
                <span className="absolute top-2 right-4 w-5 h-5 bg-[var(--pdd-red)] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {stats?.statusCounts?.shipped}
                </span>
              )}
              <span className="text-xs text-gray-600">Жолдо</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-xl transition-colors">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs text-gray-600">Алынды</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'orders'
                ? 'bg-gradient-to-r from-[var(--pdd-red)] to-[var(--pdd-orange)] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Буйрутмалар
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'favorites'
                ? 'bg-gradient-to-r from-[var(--pdd-red)] to-[var(--pdd-orange)] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Сүйүктүүлөр
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-[var(--pdd-red)] to-[var(--pdd-orange)] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Жөндөөлөр
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-4 pb-24 md:pb-8">
        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-3">
            {ordersLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-500 text-sm">Жүктөлүүдө...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                <span className="text-5xl">📦</span>
                <p className="text-gray-500 mt-4">Буйрутмалар жок</p>
                <Link href="/" className="inline-block mt-4 px-6 py-2 bg-gradient-to-r from-[var(--pdd-red)] to-[var(--pdd-orange)] text-white rounded-full font-medium">
                  Сатып алууга
                </Link>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">Буйрутма #{order.orderNumber}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      {order.firstImage ? (
                        <>
                          <Image
                            src={order.firstImage}
                            alt="Order"
                            fill
                            className="object-cover"
                          />
                          {order.itemsCount > 1 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="text-white text-sm font-bold">+{order.itemsCount - 1}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">{order.itemsCount} товар</p>
                      <p className="text-sm text-gray-400">{formatDate(order.createdAt)}</p>
                      <p className="text-lg font-bold text-[var(--pdd-red)] mt-1">₽{formatPrice(order.totalAmount)}</p>
                    </div>
                    <Link href={`/orders/${order.id}`} className="self-center px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                      Көрүү
                    </Link>
                  </div>
                </div>
              ))
            )}
            {orders.length > 0 && (
              <Link href="/orders" className="block w-full py-3 text-[var(--pdd-red)] font-medium text-center hover:bg-white rounded-xl transition-colors">
                Баарын көрүү →
              </Link>
            )}
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div>
            {favoritesLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-500 text-sm">Жүктөлүүдө...</p>
              </div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                <span className="text-5xl">❤️</span>
                <p className="text-gray-500 mt-4">Сүйүктүү товарлар жок</p>
                <Link href="/" className="inline-block mt-4 px-6 py-2 bg-gradient-to-r from-[var(--pdd-red)] to-[var(--pdd-orange)] text-white rounded-full font-medium">
                  Товарларды көрүү
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {favorites.map((item) => (
                  <Link
                    key={item.id}
                    href={`/product/${item.product.id}`}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="relative aspect-square">
                      <Image
                        src={item.product.images?.[0] || '/placeholder.png'}
                        alt={item.product.title}
                        fill
                        className="object-cover"
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          removeFromFavorites(item.product.id);
                        }}
                        className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md"
                      >
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                    <div className="p-3">
                      <p className="text-sm text-gray-800 line-clamp-2">{item.product.title}</p>
                      <p className="text-lg font-bold text-[var(--pdd-red)] mt-1">₽{formatPrice(item.product.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-3">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <Link href="/profile/edit" className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-800">Жеке маалымат</span>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <div className="border-t border-gray-100" />
              <Link href="/addresses" className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-800">Даректер</span>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <div className="border-t border-gray-100" />
              <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-800">Төлөм ыкмалары</span>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <div className="border-t border-gray-100" />
              <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-800">Билдирүүлөр</span>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <Link href="/help" className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-800">Жардам</span>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <div className="border-t border-gray-100" />
              <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-800">Колдонмо жөнүндө</span>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full py-4 bg-white rounded-xl shadow-sm text-red-500 font-medium hover:bg-red-50 transition-colors"
            >
              Чыгуу
            </button>
          </div>
        )}
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 md:hidden">
        <div className="flex items-center justify-around py-2">
          <Link href="/" className="flex flex-col items-center gap-0.5 text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs">Башкы</span>
          </Link>
          <Link href="/categories" className="flex flex-col items-center gap-0.5 text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            <span className="text-xs">Категория</span>
          </Link>
          <Link href="/reels" className="flex flex-col items-center gap-0.5 text-gray-500 relative">
            <div className="w-12 h-12 -mt-6 bg-gradient-to-r from-[var(--pdd-red)] to-[var(--pdd-orange)] rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <span className="text-xs mt-1">Видео</span>
          </Link>
          <Link href="/cart" className="flex flex-col items-center gap-0.5 text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="text-xs">Корзина</span>
          </Link>
          <button className="flex flex-col items-center gap-0.5 text-[var(--pdd-red)]">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <span className="text-xs font-medium">Профиль</span>
          </button>
        </div>
      </nav>
    </div>
  );
}