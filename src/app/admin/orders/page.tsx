'use client';

import { useState } from 'react';

// Mock orders data
const mockOrders = [
  { id: 'ORD-001', customer: 'Айбек Асанов', phone: '+996 555 123456', total: 15500, status: 'pending', items: 2, date: '2024-01-20' },
  { id: 'ORD-002', customer: 'Гулнура Токтоева', phone: '+996 700 234567', total: 8900, status: 'processing', items: 1, date: '2024-01-20' },
  { id: 'ORD-003', customer: 'Нурлан Жумабеков', phone: '+996 559 345678', total: 45000, status: 'shipped', items: 3, date: '2024-01-19' },
  { id: 'ORD-004', customer: 'Айжан Сулейманова', phone: '+996 770 456789', total: 12300, status: 'delivered', items: 2, date: '2024-01-19' },
  { id: 'ORD-005', customer: 'Бакыт Эсенов', phone: '+996 502 567890', total: 6700, status: 'delivered', items: 1, date: '2024-01-18' },
  { id: 'ORD-006', customer: 'Мира Кадырова', phone: '+996 555 678901', total: 23400, status: 'cancelled', items: 4, date: '2024-01-18' },
  { id: 'ORD-007', customer: 'Талант Абдыкеримов', phone: '+996 700 789012', total: 9800, status: 'pending', items: 2, date: '2024-01-17' },
  { id: 'ORD-008', customer: 'Жибек Исмаилова', phone: '+996 559 890123', total: 34500, status: 'processing', items: 5, date: '2024-01-17' },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Күтүүдө', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  processing: { label: 'Иштетилүүдө', color: 'text-blue-700', bg: 'bg-blue-100' },
  shipped: { label: 'Жөнөтүлдү', color: 'text-purple-700', bg: 'bg-purple-100' },
  delivered: { label: 'Жеткирилди', color: 'text-green-700', bg: 'bg-green-100' },
  cancelled: { label: 'Жокко чыгарылды', color: 'text-red-700', bg: 'bg-red-100' },
};

export default function AdminOrders() {
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredOrders = filterStatus === 'all'
    ? mockOrders
    : mockOrders.filter(order => order.status === filterStatus);

  const stats = {
    total: mockOrders.length,
    pending: mockOrders.filter(o => o.status === 'pending').length,
    processing: mockOrders.filter(o => o.status === 'processing').length,
    delivered: mockOrders.filter(o => o.status === 'delivered').length,
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Заказдар</h1>
        <p className="text-gray-500 mt-1">Заказдарды башкаруу</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">Баары</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4">
          <p className="text-sm text-yellow-600">Күтүүдө</p>
          <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-sm text-blue-600">Иштетилүүдө</p>
          <p className="text-2xl font-bold text-blue-700">{stats.processing}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-sm text-green-600">Жеткирилди</p>
          <p className="text-2xl font-bold text-green-700">{stats.delivered}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'Баары' },
            { value: 'pending', label: 'Күтүүдө' },
            { value: 'processing', label: 'Иштетилүүдө' },
            { value: 'shipped', label: 'Жөнөтүлдү' },
            { value: 'delivered', label: 'Жеткирилди' },
            { value: 'cancelled', label: 'Жокко чыгарылды' },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setFilterStatus(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === filter.value
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const status = statusConfig[order.status];
          return (
            <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">📦</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-800">{order.id}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{order.customer}</p>
                    <p className="text-xs text-gray-400">{order.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-800">{order.total.toLocaleString()} с</p>
                    <p className="text-xs text-gray-500">{order.items} продукт • {order.date}</p>
                  </div>

                  <div className="flex gap-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <span className="text-6xl">🛒</span>
          <p className="text-gray-500 mt-4">Заказ табылган жок</p>
        </div>
      )}
    </div>
  );
}