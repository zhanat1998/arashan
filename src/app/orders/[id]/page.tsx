'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

// Mock order data with tracking
const mockOrders: Record<string, any> = {
  '123455': {
    id: '123455',
    status: 'shipping',
    statusText: 'Жолдо',
    total: 12800,
    items: [
      { id: '1', title: 'Wireless Bluetooth Наушник Pro Max', price: 4500, quantity: 1, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200' },
      { id: '2', title: 'Smart Watch M7 Ultra', price: 5800, quantity: 1, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200' },
      { id: '3', title: 'USB-C Кабель 2м', price: 2500, quantity: 1, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200' },
    ],
    address: 'Бишкек, Чүй проспекти 155, кв 42',
    courier: {
      name: 'Азамат',
      phone: '+996 555 987 654',
      avatar: 'https://i.pravatar.cc/100?img=12',
      rating: 4.9,
      deliveries: 1250,
    },
    tracking: {
      currentLocation: { lat: 42.8746, lng: 74.5698 }, // Near Bishkek center
      destination: { lat: 42.8821, lng: 74.5821 }, // Destination
      estimatedTime: '15-20 мүнөт',
      distance: '2.3 км',
    },
    timeline: [
      { status: 'ordered', time: '10 Янв, 14:30', text: 'Заказ кабыл алынды', completed: true },
      { status: 'confirmed', time: '10 Янв, 14:35', text: 'Дүкөн ырастады', completed: true },
      { status: 'preparing', time: '10 Янв, 15:00', text: 'Товар даярдалууда', completed: true },
      { status: 'shipped', time: '10 Янв, 16:30', text: 'Курьерге берилди', completed: true },
      { status: 'delivering', time: '10 Янв, 17:45', text: 'Жеткирилүүдө', completed: true, active: true },
      { status: 'delivered', time: '', text: 'Жеткирилди', completed: false },
    ],
  },
  '123456': {
    id: '123456',
    status: 'delivered',
    statusText: 'Жеткирилди',
    total: 4500,
    items: [
      { id: '1', title: 'Wireless Bluetooth Наушник', price: 4500, quantity: 1, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200' },
    ],
    address: 'Бишкек, Ахунбаев 116, кв 15',
    courier: {
      name: 'Бакыт',
      phone: '+996 777 123 456',
      avatar: 'https://i.pravatar.cc/100?img=15',
      rating: 4.8,
      deliveries: 890,
    },
    tracking: null,
    timeline: [
      { status: 'ordered', time: '15 Янв, 10:00', text: 'Заказ кабыл алынды', completed: true },
      { status: 'confirmed', time: '15 Янв, 10:05', text: 'Дүкөн ырастады', completed: true },
      { status: 'preparing', time: '15 Янв, 10:30', text: 'Товар даярдалууда', completed: true },
      { status: 'shipped', time: '15 Янв, 12:00', text: 'Курьерге берилди', completed: true },
      { status: 'delivering', time: '15 Янв, 13:30', text: 'Жеткирилүүдө', completed: true },
      { status: 'delivered', time: '15 Янв, 14:15', text: 'Жеткирилди', completed: true },
    ],
  },
};

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const order = mockOrders[orderId];

  const [courierPosition, setCourierPosition] = useState({ progress: 65 }); // 0-100%

  // Simulate courier movement
  useEffect(() => {
    if (order?.status === 'shipping') {
      const interval = setInterval(() => {
        setCourierPosition(prev => ({
          progress: Math.min(95, prev.progress + Math.random() * 2)
        }));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [order?.status]);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <span className="text-5xl">📦</span>
          <p className="text-gray-500 mt-3 text-sm">Заказ табылган жок</p>
          <button onClick={() => router.back()} className="mt-3 px-4 py-1.5 bg-orange-500 text-white rounded-full text-sm">
            Артка
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b">
        <div className="flex items-center justify-between px-3 py-2">
          <button onClick={() => router.back()} className="p-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-sm font-bold">Заказ #{order.id}</h1>
          <button className="p-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Map Section */}
      {order.status === 'shipping' && order.tracking && (
        <div className="bg-white">
          {/* Simulated Map */}
          <div className="relative h-48 bg-gradient-to-br from-green-100 to-blue-100 overflow-hidden">
            {/* Map background pattern */}
            <div className="absolute inset-0 opacity-30">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Roads */}
                <path d="M0,50 L100,50" stroke="#666" strokeWidth="0.5" fill="none" />
                <path d="M50,0 L50,100" stroke="#666" strokeWidth="0.5" fill="none" />
                <path d="M20,0 L20,100" stroke="#999" strokeWidth="0.3" fill="none" />
                <path d="M80,0 L80,100" stroke="#999" strokeWidth="0.3" fill="none" />
                <path d="M0,20 L100,20" stroke="#999" strokeWidth="0.3" fill="none" />
                <path d="M0,80 L100,80" stroke="#999" strokeWidth="0.3" fill="none" />
                {/* Diagonal */}
                <path d="M10,90 L90,10" stroke="#888" strokeWidth="0.4" fill="none" />
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
            <div className="absolute top-[20%] right-[20%] transform -translate-x-1/2">
              <div className="relative">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white px-1.5 py-0.5 rounded text-[8px] font-medium shadow whitespace-nowrap">
                  Сиздин дарек
                </div>
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
              <div className="relative">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                  <span className="text-lg">🛵</span>
                </div>
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-green-500 text-white px-1.5 py-0.5 rounded text-[8px] font-medium shadow whitespace-nowrap">
                  Курьер
                </div>
              </div>
            </div>

            {/* Shop marker */}
            <div className="absolute bottom-[15%] left-[10%]">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow">
                <span className="text-xs">🏪</span>
              </div>
            </div>
          </div>

          {/* Tracking Info */}
          <div className="px-3 py-2 bg-green-50 border-t border-green-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-green-700">Курьер жолдо</span>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Болжолдуу убакыт</p>
                <p className="text-sm font-bold text-green-600">{order.tracking.estimatedTime}</p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-4 text-[10px] text-gray-500">
              <span>📍 {order.tracking.distance} калды</span>
              <span>•</span>
              <span>🚀 Тез жеткирүү</span>
            </div>
          </div>
        </div>
      )}

      {/* Courier Card */}
      {order.courier && order.status === 'shipping' && (
        <div className="bg-white mt-1.5 px-3 py-2">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden">
              <Image src={order.courier.avatar} alt={order.courier.name} fill className="object-cover" />
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{order.courier.name}</p>
              <div className="flex items-center gap-2 text-[10px] text-gray-500">
                <span>⭐ {order.courier.rating}</span>
                <span>•</span>
                <span>{order.courier.deliveries} жеткирүү</span>
              </div>
            </div>
            <a href={`tel:${order.courier.phone}`} className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </a>
            <button className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Delivery Address */}
      <div className="bg-white mt-1.5 px-3 py-2">
        <div className="flex items-start gap-2">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-gray-400">Жеткирүү дареги</p>
            <p className="text-xs font-medium text-gray-800">{order.address}</p>
          </div>
        </div>
      </div>

      {/* Order Timeline */}
      <div className="bg-white mt-1.5 px-3 py-2">
        <h3 className="text-xs font-bold text-gray-800 mb-2">Заказ статусу</h3>
        <div className="space-y-0">
          {order.timeline.map((step: any, idx: number) => (
            <div key={idx} className="flex gap-3">
              {/* Timeline line */}
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full ${step.completed ? (step.active ? 'bg-green-500 ring-4 ring-green-100' : 'bg-green-500') : 'bg-gray-200'}`}>
                  {step.completed && !step.active && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  )}
                </div>
                {idx < order.timeline.length - 1 && (
                  <div className={`w-0.5 h-8 ${step.completed ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                )}
              </div>
              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-center justify-between">
                  <p className={`text-xs font-medium ${step.active ? 'text-green-600' : step.completed ? 'text-gray-800' : 'text-gray-400'}`}>
                    {step.text}
                  </p>
                  <span className="text-[10px] text-gray-400">{step.time}</span>
                </div>
                {step.active && (
                  <p className="text-[10px] text-green-600 mt-0.5">Азыр ушул жерде</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white mt-1.5 px-3 py-2">
        <h3 className="text-xs font-bold text-gray-800 mb-2">Товарлар ({order.items.length})</h3>
        <div className="space-y-2">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex gap-2">
              <div className="relative w-14 h-14 rounded overflow-hidden bg-gray-100 shrink-0">
                <Image src={item.image} alt={item.title} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-800 line-clamp-2">{item.title}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-bold text-red-500">¥{item.price.toLocaleString()}</span>
                  <span className="text-[10px] text-gray-400">x{item.quantity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500">Жалпы</span>
          <span className="text-sm font-bold text-red-500">¥{order.total.toLocaleString()}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-3 py-2 flex gap-2">
        {order.status === 'shipping' ? (
          <>
            <button className="flex-1 py-2 border border-gray-300 rounded-full text-xs font-medium">
              Жардам
            </button>
            <a href={`tel:${order.courier?.phone}`} className="flex-1 py-2 bg-green-500 text-white rounded-full text-xs font-medium text-center">
              Курьерге чалуу
            </a>
          </>
        ) : (
          <>
            <button className="flex-1 py-2 border border-gray-300 rounded-full text-xs font-medium">
              Жардам
            </button>
            <Link href="/" className="flex-1 py-2 bg-red-500 text-white rounded-full text-xs font-medium text-center">
              Дагы сатып алуу
            </Link>
          </>
        )}
      </div>
    </div>
  );
}