'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

// Курьер маалыматы (MVP үчүн mock data)
const MOCK_DRIVERS = [
  {
    id: '1',
    name: 'Азамат Токтогулов',
    phone: '+996 555 123 456',
    photo: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 4.9,
    deliveries: 1250,
    vehicle: {
      type: 'Мотоцикл',
      model: 'Honda PCX 150',
      color: 'Кара',
      plate: '01 KG 777 ABC',
    },
  },
  {
    id: '2',
    name: 'Бакыт Исаков',
    phone: '+996 700 987 654',
    photo: 'https://randomuser.me/api/portraits/men/45.jpg',
    rating: 4.8,
    deliveries: 890,
    vehicle: {
      type: 'Машина',
      model: 'Hyundai Accent',
      color: 'Ак',
      plate: '01 KG 555 DEF',
    },
  },
];

// Дүкөндөр (mock)
const MOCK_STORES = [
  {
    id: '1',
    name: 'Fashion Store',
    address: 'Бишкек, Чүй пр. 155',
    coordinates: { lat: 42.8746, lng: 74.5698 },
  },
  {
    id: '2',
    name: 'Tech Shop',
    address: 'Бишкек, Манас пр. 40',
    coordinates: { lat: 42.8756, lng: 74.6058 },
  },
];

// Бишкек координаттары
const BISHKEK_CENTER = { lat: 42.8746, lng: 74.5698 };

interface TrackingPoint {
  lat: number;
  lng: number;
  timestamp: Date;
  status: string;
}

export default function DeliveryTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const { user } = useAuth();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [driver] = useState(MOCK_DRIVERS[Math.floor(Math.random() * MOCK_DRIVERS.length)]);
  const [store] = useState(MOCK_STORES[Math.floor(Math.random() * MOCK_STORES.length)]);

  // Курьердин азыркы жайгашуусу
  const [courierPosition, setCourierPosition] = useState({
    lat: BISHKEK_CENTER.lat - 0.02,
    lng: BISHKEK_CENTER.lng - 0.01,
    progress: 0,
  });

  // Жеткирүү дареги
  const [destination, setDestination] = useState({
    lat: BISHKEK_CENTER.lat + 0.015,
    lng: BISHKEK_CENTER.lng + 0.02,
    address: 'Бишкек, Токтогул көч. 125, батир 45',
  });

  // Маршрут чекиттери
  const [routePoints] = useState<TrackingPoint[]>([
    { lat: store.coordinates.lat, lng: store.coordinates.lng, timestamp: new Date(Date.now() - 20 * 60000), status: 'pickup' },
    { lat: BISHKEK_CENTER.lat - 0.01, lng: BISHKEK_CENTER.lng, timestamp: new Date(Date.now() - 15 * 60000), status: 'in_transit' },
    { lat: BISHKEK_CENTER.lat, lng: BISHKEK_CENTER.lng + 0.01, timestamp: new Date(Date.now() - 10 * 60000), status: 'in_transit' },
    { lat: BISHKEK_CENTER.lat + 0.008, lng: BISHKEK_CENTER.lng + 0.015, timestamp: new Date(Date.now() - 5 * 60000), status: 'in_transit' },
  ]);

  // Буйрутма маалыматын алуу
  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  // Курьердин кыймылын симуляциялоо
  useEffect(() => {
    const interval = setInterval(() => {
      setCourierPosition(prev => {
        const newProgress = Math.min(100, prev.progress + Math.random() * 3);
        const progressRatio = newProgress / 100;

        // Дүкөндөн жеткирүү дарегине карай кыймыл
        const newLat = store.coordinates.lat + (destination.lat - store.coordinates.lat) * progressRatio;
        const newLng = store.coordinates.lng + (destination.lng - store.coordinates.lng) * progressRatio;

        return {
          lat: newLat,
          lng: newLng,
          progress: newProgress,
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [store.coordinates, destination]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);

        // Чыныгы жеткирүү дарегин коюу
        if (data.order?.shipping_address) {
          const addr = data.order.shipping_address;
          const addressStr = typeof addr === 'string'
            ? addr
            : `${addr.city || ''}, ${addr.address || ''} ${addr.apartment || ''}`.trim();
          setDestination(prev => ({
            ...prev,
            address: addressStr || prev.address
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstimatedTime = () => {
    const remaining = 100 - courierPosition.progress;
    const minutes = Math.ceil(remaining * 0.3); // ~30 минут жалпы
    return minutes;
  };

  const handleCallDriver = () => {
    window.location.href = `tel:${driver.phone}`;
  };

  const handleMessageDriver = () => {
    window.location.href = `sms:${driver.phone}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Жүктөлүүдө...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      {/* Header */}
      <div className="bg-white sticky top-0 z-50 border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-base font-bold">Жеткирүү көзөмөлү</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Map Section */}
      <div className="relative h-72 bg-gradient-to-br from-green-50 to-blue-50 overflow-hidden">
        {/* Grid pattern background */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }} />

        {/* Streets simulation */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
          {/* Main streets */}
          <line x1="0" y1="100" x2="400" y2="100" stroke="#ccc" strokeWidth="8" />
          <line x1="0" y1="200" x2="400" y2="200" stroke="#ccc" strokeWidth="8" />
          <line x1="100" y1="0" x2="100" y2="300" stroke="#ccc" strokeWidth="8" />
          <line x1="250" y1="0" x2="250" y2="300" stroke="#ccc" strokeWidth="8" />

          {/* Secondary streets */}
          <line x1="0" y1="150" x2="400" y2="150" stroke="#ddd" strokeWidth="4" />
          <line x1="175" y1="0" x2="175" y2="300" stroke="#ddd" strokeWidth="4" />
          <line x1="325" y1="0" x2="325" y2="300" stroke="#ddd" strokeWidth="4" />

          {/* Route line (dashed - remaining) */}
          <path
            d={`M ${50 + courierPosition.progress * 2.8} ${220 - courierPosition.progress * 1.2}
                Q ${200} ${150}
                ${330} ${60}`}
            stroke="#3B82F6"
            strokeWidth="4"
            fill="none"
            strokeDasharray="8,8"
            opacity="0.4"
          />

          {/* Route line (solid - completed) */}
          <path
            d={`M 50 220
                Q ${50 + courierPosition.progress} ${220 - courierPosition.progress * 0.7}
                ${50 + courierPosition.progress * 2.8} ${220 - courierPosition.progress * 1.2}`}
            stroke="#3B82F6"
            strokeWidth="4"
            fill="none"
          />
        </svg>

        {/* Store marker */}
        <div className="absolute bottom-16 left-8 transform -translate-x-1/2">
          <div className="relative">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg border-2 border-white">
              <span className="text-2xl">🏪</span>
            </div>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              <span className="text-xs bg-white px-2 py-1 rounded shadow font-medium">{store.name}</span>
            </div>
          </div>
        </div>

        {/* Destination marker */}
        <div className="absolute top-8 right-12">
          <div className="relative">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg border-2 border-white animate-pulse">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              <span className="text-xs bg-white px-2 py-1 rounded shadow font-medium">Сиздин дарек</span>
            </div>
          </div>
        </div>

        {/* Courier marker */}
        <div
          className="absolute transition-all duration-1000 ease-linear z-10"
          style={{
            left: `${12 + courierPosition.progress * 0.7}%`,
            bottom: `${15 + courierPosition.progress * 0.5}%`,
          }}
        >
          <div className="relative">
            <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-xl border-3 border-white">
              <span className="text-2xl">{driver.vehicle.type === 'Мотоцикл' ? '🛵' : '🚗'}</span>
            </div>
            {/* Pulse effect */}
            <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-30"></div>
          </div>
        </div>

        {/* ETA Badge */}
        <div className="absolute top-4 left-4 bg-white rounded-xl shadow-lg px-4 py-2">
          <p className="text-xs text-gray-500">Болжолдуу убакыт</p>
          <p className="text-xl font-bold text-green-600">{getEstimatedTime()} мүн</p>
        </div>

        {/* Progress Badge */}
        <div className="absolute top-4 right-4 bg-white rounded-xl shadow-lg px-4 py-2">
          <p className="text-xs text-gray-500">Жеткирүү</p>
          <p className="text-xl font-bold text-blue-600">{Math.round(courierPosition.progress)}%</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white px-4 py-3 border-b">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>Дүкөн</span>
          <span>Жолдо</span>
          <span>Жеткирилди</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-1000"
            style={{ width: `${courierPosition.progress}%` }}
          />
        </div>
      </div>

      {/* Live Status */}
      <div className="bg-green-50 px-4 py-3 flex items-center gap-3 border-b border-green-100">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-800">Курьер жолдо</p>
          <p className="text-xs text-green-600">Реалдуу убакытта көзөмөл</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-green-700">{getEstimatedTime()}</p>
          <p className="text-xs text-green-600">мүнөт калды</p>
        </div>
      </div>

      {/* Driver Info Card */}
      <div className="bg-white mt-2 p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3">Курьер маалыматы</h3>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Image
              src={driver.photo}
              alt={driver.name}
              width={64}
              height={64}
              className="rounded-full border-2 border-green-500"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-800">{driver.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                <span className="text-sm font-medium">{driver.rating}</span>
              </div>
              <span className="text-gray-300">•</span>
              <span className="text-sm text-gray-500">{driver.deliveries} жеткирүү</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{driver.phone}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleCallDriver}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-xl font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Чалуу
          </button>
          <button
            onClick={handleMessageDriver}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-500 text-white rounded-xl font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Билдирүү
          </button>
        </div>
      </div>

      {/* Vehicle Info */}
      <div className="bg-white mt-2 p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3">Транспорт маалыматы</h3>
        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
          <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center text-3xl">
            {driver.vehicle.type === 'Мотоцикл' ? '🛵' : '🚗'}
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-800">{driver.vehicle.model}</p>
            <p className="text-sm text-gray-500">{driver.vehicle.type} • {driver.vehicle.color}</p>
            <div className="mt-2 inline-flex items-center gap-2 bg-yellow-100 px-3 py-1 rounded-lg">
              <span className="text-xs font-bold text-yellow-800">🔢</span>
              <span className="font-mono font-bold text-yellow-800">{driver.vehicle.plate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pickup Store Info */}
      <div className="bg-white mt-2 p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3">Алынган дүкөн</h3>
        <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
          <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-2xl">
            🏪
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-800">{store.name}</p>
            <p className="text-sm text-gray-500">{store.address}</p>
            <p className="text-xs text-orange-600 mt-1">✓ Товар алынды</p>
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="bg-white mt-2 p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3">Жеткирүү дареги</h3>
        <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
          <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-800">{destination.address}</p>
            <p className="text-xs text-red-600 mt-1">⏱ {getEstimatedTime()} мүнөт калды</p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white mt-2 p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3">Жеткирүү тарыхы</h3>
        <div className="space-y-0">
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <div className="w-0.5 h-10 bg-green-500" />
            </div>
            <div className="flex-1 pb-4">
              <p className="text-sm font-medium text-green-600">Дүкөндөн алынды</p>
              <p className="text-xs text-gray-400">20 мүнөт мурун • {store.name}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full ring-4 ring-blue-100" />
              <div className="w-0.5 h-10 bg-gray-200" />
            </div>
            <div className="flex-1 pb-4">
              <p className="text-sm font-medium text-blue-600">Жолдо</p>
              <p className="text-xs text-gray-400">Азыр • Курьер сизге жолдо</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-gray-300 rounded-full" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-400">Жеткирилет</p>
              <p className="text-xs text-gray-400">Болжол менен {getEstimatedTime()} мүнөттө</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 z-40">
        <div className="flex gap-3">
          <Link
            href={`/orders/${orderId}`}
            className="flex-1 py-3 text-center text-sm font-medium text-gray-700 bg-gray-100 rounded-xl"
          >
            Буйрутмага кайтуу
          </Link>
          <button
            onClick={handleCallDriver}
            className="flex-1 py-3 text-center text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Курьерге чалуу
          </button>
        </div>
      </div>
    </div>
  );
}