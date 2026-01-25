'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'Күтүүдө', color: 'bg-yellow-100 text-yellow-700' },
  awaiting_payment: { label: 'Төлөм күтүүдө', color: 'bg-orange-100 text-orange-700' },
  paid: { label: 'Төлөндү', color: 'bg-blue-100 text-blue-700' },
  shipped: { label: 'Жөнөтүлдү', color: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Жеткирилди', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Жокко чыгарылды', color: 'bg-red-100 text-red-700' },
  refunded: { label: 'Кайтарылды', color: 'bg-gray-100 text-gray-700' },
};

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }

      const res = await fetch(`/api/seller/orders?${params}`);
      const data = await res.json();

      if (res.ok) {
        setOrders(data.orders);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrder(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        // Update local state with new status and timestamps
        setOrders(orders.map(o => {
          if (o.id === orderId) {
            const updated = { ...o, status: newStatus };
            if (newStatus === 'shipped') updated.shipped_at = new Date().toISOString();
            if (newStatus === 'delivered') updated.delivered_at = new Date().toISOString();
            return updated;
          }
          return o;
        }));
      } else {
        const data = await res.json();
        alert(data.error || 'Ката кетти');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Статусту өзгөртүүдө ката');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getNextStatus = (currentStatus: string): string | null => {
    const flow: Record<string, string> = {
      pending: 'paid',
      awaiting_payment: 'paid',
      paid: 'shipped',
      shipped: 'delivered',
    };
    return flow[currentStatus] || null;
  };

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Буйрутмалар</h1>
        <p className="text-gray-500 mt-1">Жалпы: {pagination.total} буйрутма</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'Баары' },
            { value: 'pending', label: 'Күтүүдө' },
            { value: 'paid', label: 'Төлөндү' },
            { value: 'shipped', label: 'Жөнөтүлдү' },
            { value: 'delivered', label: 'Жеткирилди' },
            { value: 'cancelled', label: 'Жокко чыгарылды' },
          ].map((s) => (
            <button
              key={s.value}
              onClick={() => {
                setStatusFilter(s.value);
                setPagination({ ...pagination, page: 1 });
              }}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                statusFilter === s.value
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Буйрутмалар жок</h3>
          <p className="text-gray-500">Азырынча буйрутма түшкөн жок</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Order Header */}
              <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-800">#{order.id.slice(0, 8)}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusLabels[order.status]?.color || 'bg-gray-100 text-gray-600'}`}>
                      {statusLabels[order.status]?.label || order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(order.created_at).toLocaleString('ky-KG')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-500">
                    {order.total_amount?.toLocaleString()} с
                  </p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    {order.user?.avatar_url ? (
                      <Image
                        src={order.user.avatar_url}
                        alt="Avatar"
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{order.user?.full_name || 'Белгисиз'}</p>
                    <p className="text-sm text-gray-500">{order.user?.phone || order.shipping_phone || 'Телефон жок'}</p>
                  </div>
                </div>
                {order.shipping_address && (
                  <p className="text-sm text-gray-600 mt-2 flex items-start gap-2">
                    <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {typeof order.shipping_address === 'string'
                      ? order.shipping_address
                      : `${order.shipping_address.city || ''}, ${order.shipping_address.address || ''} ${order.shipping_address.apartment || ''}`.trim()}
                  </p>
                )}
              </div>

              {/* Order Items */}
              <div className="p-4">
                <div className="space-y-3">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.product?.images?.[0] ? (
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{item.product?.title || 'Товар'}</p>
                        <p className="text-sm text-gray-500">
                          {item.quantity} x {item.price?.toLocaleString()} с
                          {item.color && ` • ${item.color}`}
                          {item.size && ` • ${item.size}`}
                        </p>
                      </div>
                      <p className="font-medium text-gray-800">
                        {(item.quantity * item.price)?.toLocaleString()} с
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                <div className="p-4 border-t border-gray-100 flex flex-wrap gap-2">
                  {getNextStatus(order.status) && (
                    <button
                      onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!)}
                      disabled={updatingOrder === order.id}
                      className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium rounded-lg hover:from-red-600 hover:to-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {updatingOrder === order.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          {order.status === 'pending' && 'Төлөндү деп белгилөө'}
                          {order.status === 'awaiting_payment' && 'Төлөндү деп белгилөө'}
                          {order.status === 'paid' && 'Жөнөтүү'}
                          {order.status === 'shipped' && 'Жеткирилди'}
                        </>
                      )}
                    </button>
                  )}
                  {(order.status === 'pending' || order.status === 'awaiting_payment') && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                      disabled={updatingOrder === order.id}
                      className="px-4 py-2 border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      Жокко чыгаруу
                    </button>
                  )}
                </div>
              )}

              {/* Tracking Number Input (for shipped orders) */}
              {order.status === 'shipped' && order.tracking_number && (
                <div className="px-4 pb-4">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-600">
                      <span className="font-medium">Track номери:</span> {order.tracking_number}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <p className="text-sm text-gray-500">
                {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} / {pagination.total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Артка
                </button>
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Кийинки
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
