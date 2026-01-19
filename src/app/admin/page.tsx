import { products, videos, shops } from '@/data/products';
import Link from 'next/link';

export default function AdminDashboard() {
  const totalProducts = products.length;
  const totalVideos = videos.length;
  const totalSales = products.reduce((sum, p) => sum + p.soldCount, 0);
  const totalRevenue = products.reduce((sum, p) => sum + (p.price * p.soldCount), 0);

  const stats = [
    { label: 'Продукттар', value: totalProducts, icon: '📦', color: 'blue', href: '/admin/products' },
    { label: 'Видеолор', value: totalVideos, icon: '🎬', color: 'purple', href: '/admin/videos' },
    { label: 'Сатуулар', value: totalSales.toLocaleString(), icon: '🛒', color: 'green', href: '/admin/orders' },
    { label: 'Киреше', value: `${(totalRevenue / 1000000).toFixed(1)}M с`, icon: '💰', color: 'orange', href: '#' },
  ];

  const recentProducts = products.slice(0, 5);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Кош келиңиз! 👋</h1>
        <p className="text-gray-500 mt-1">Дүкөнүңүздүн статистикасы</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">{stat.icon}</span>
              <span className={`text-xs font-medium px-2 py-1 rounded-full bg-${stat.color}-100 text-${stat.color}-600`}>
                +12%
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Тез аракеттер</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/admin/products/new"
              className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <span className="text-2xl">➕</span>
              <span className="font-medium text-blue-700">Продукт кошуу</span>
            </Link>
            <Link
              href="/admin/videos/upload"
              className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
            >
              <span className="text-2xl">🎥</span>
              <span className="font-medium text-purple-700">Видео жүктөө</span>
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center gap-3 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
            >
              <span className="text-2xl">📋</span>
              <span className="font-medium text-green-700">Заказдар</span>
            </Link>
            <Link
              href="/admin/shop"
              className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors"
            >
              <span className="text-2xl">⚙️</span>
              <span className="font-medium text-orange-700">Жөндөөлөр</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Акыркы продукттар</h2>
          <div className="space-y-3">
            {recentProducts.map((product) => (
              <div key={product.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{product.title}</p>
                  <p className="text-xs text-gray-500">{product.price.toLocaleString()} сом</p>
                </div>
                <span className="text-xs text-green-600 font-medium">
                  {product.soldCount} сатылды
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Shops */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Дүкөндөр</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {shops.slice(0, 5).map((shop) => (
            <div key={shop.id} className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="w-16 h-16 mx-auto rounded-full overflow-hidden mb-3">
                <img
                  src={shop.logo}
                  alt={shop.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm font-medium text-gray-800 truncate">{shop.name}</p>
              <p className="text-xs text-gray-500">{shop.productsCount} продукт</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="text-yellow-500">⭐</span>
                <span className="text-xs text-gray-600">{shop.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}