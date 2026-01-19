'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type NotificationType = 'all' | 'orders' | 'promos' | 'system';

interface Notification {
  id: string;
  type: 'order' | 'promo' | 'system';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  image?: string;
  link?: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'order',
    title: 'Буйрутма жеткирилди!',
    message: 'Буйрутма #123456 ийгиликтүү жеткирилди. Рахмат сатып алганыңыз үчүн!',
    time: '10 мүнөт мурун',
    isRead: false,
    image: 'https://picsum.photos/seed/order1/100/100',
    link: '/profile',
  },
  {
    id: '2',
    type: 'promo',
    title: '🔥 Flash Sale башталды!',
    message: 'Бүгүн гана! Бардык электроникага 50% чейин арзандатуу. Өткөрүп жибербеңиз!',
    time: '1 саат мурун',
    isRead: false,
    image: 'https://picsum.photos/seed/sale1/100/100',
    link: '/categories',
  },
  {
    id: '3',
    type: 'order',
    title: 'Буйрутма жолдо',
    message: 'Буйрутма #123455 курьерге берилди. Болжолдуу жеткирүү: бүгүн 18:00-20:00',
    time: '3 саат мурун',
    isRead: false,
    image: 'https://picsum.photos/seed/order2/100/100',
    link: '/profile',
  },
  {
    id: '4',
    type: 'system',
    title: 'Профиль жаңыртылды',
    message: 'Сиздин профиль маалыматтарыңыз ийгиликтүү жаңыртылды.',
    time: '5 саат мурун',
    isRead: true,
  },
  {
    id: '5',
    type: 'promo',
    title: '🎁 Сизге белек!',
    message: 'Активдүү колдонуучу болгонуңуз үчүн 500 упай белек кылабыз!',
    time: '1 күн мурун',
    isRead: true,
    link: '/profile',
  },
  {
    id: '6',
    type: 'order',
    title: 'Буйрутма кабыл алынды',
    message: 'Буйрутма #123454 кабыл алынды жана даярдалууда.',
    time: '2 күн мурун',
    isRead: true,
    image: 'https://picsum.photos/seed/order3/100/100',
    link: '/profile',
  },
  {
    id: '7',
    type: 'promo',
    title: '💝 Жаңы жыл акциясы!',
    message: 'Жаңы жылга чейин бардык товарларга 30% арзандатуу! Код: NEWYEAR2024',
    time: '3 күн мурун',
    isRead: true,
    link: '/',
  },
  {
    id: '8',
    type: 'system',
    title: 'Коопсуздук эскертүүсү',
    message: 'Сиздин аккаунтуңузга жаңы түзмөктөн кирүү болду. Эгер сиз болбосоңуз, сыр сөздү өзгөртүңүз.',
    time: '1 жума мурун',
    isRead: true,
  },
];

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<NotificationType>('all');
  const [notifications, setNotifications] = useState(mockNotifications);

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'orders') return n.type === 'order';
    if (activeTab === 'promos') return n.type === 'promo';
    if (activeTab === 'system') return n.type === 'system';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const unreadByType = {
    orders: notifications.filter(n => n.type === 'order' && !n.isRead).length,
    promos: notifications.filter(n => n.type === 'promo' && !n.isRead).length,
    system: notifications.filter(n => n.type === 'system' && !n.isRead).length,
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order':
        return (
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
        );
      case 'promo':
        return (
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
        );
      case 'system':
        return (
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--pdd-gray)]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-lg font-bold text-gray-800">Билдирүүлөр</h1>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-[var(--pdd-red)] text-white text-xs font-bold rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-[var(--pdd-red)] font-medium"
              >
                Баарын окуу
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === 'all'
                  ? 'bg-[var(--pdd-red)] text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Баары
              {unreadCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === 'orders'
                  ? 'bg-[var(--pdd-red)] text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Буйрутмалар
              {unreadByType.orders > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-blue-500 text-white rounded-full text-xs">
                  {unreadByType.orders}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('promos')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === 'promos'
                  ? 'bg-[var(--pdd-red)] text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Акциялар
              {unreadByType.promos > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-orange-500 text-white rounded-full text-xs">
                  {unreadByType.promos}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === 'system'
                  ? 'bg-[var(--pdd-red)] text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Система
              {unreadByType.system > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-gray-500 text-white rounded-full text-xs">
                  {unreadByType.system}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Notifications List */}
      <main className="max-w-7xl mx-auto px-4 py-4 pb-24">
        {filteredNotifications.length > 0 ? (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={`bg-white rounded-xl p-4 shadow-sm cursor-pointer transition-all hover:shadow-md ${
                  !notification.isRead ? 'border-l-4 border-[var(--pdd-red)]' : ''
                }`}
              >
                <div className="flex gap-3">
                  {/* Icon or Image */}
                  {notification.image ? (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={notification.image}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    getTypeIcon(notification.type)
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-[var(--pdd-red)] rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">{notification.time}</span>
                      {notification.link && (
                        <Link
                          href={notification.link}
                          className="text-xs text-[var(--pdd-red)] font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Көрүү →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Билдирүү жок</h3>
            <p className="text-gray-500">
              {activeTab === 'all'
                ? 'Азырынча эч кандай билдирүү жок'
                : activeTab === 'orders'
                ? 'Буйрутма билдирүүлөрү жок'
                : activeTab === 'promos'
                ? 'Акция билдирүүлөрү жок'
                : 'Система билдирүүлөрү жок'}
            </p>
          </div>
        )}

        {/* Notification Settings Link */}
        <div className="mt-6">
          <Link
            href="/profile"
            className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Билдирүү жөндөөлөрү</h3>
                <p className="text-sm text-gray-500">Кайсы билдирүүлөрдү алууну тандаңыз</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
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
          <Link href="/" className="flex flex-col items-center gap-0.5 text-gray-500 relative">
            <div className="w-12 h-12 -mt-6 bg-gradient-to-r from-[var(--pdd-red)] to-[var(--pdd-orange)] rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <span className="text-xs mt-1">Видео</span>
          </Link>
          <Link href="/search" className="flex flex-col items-center gap-0.5 text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs">Издөө</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center gap-0.5 text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs">Профиль</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}