'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function SellerProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, [pagination.page, status]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (status !== 'all') {
        params.set('status', status);
      }

      if (search) {
        params.set('search', search);
      }

      const res = await fetch(`/api/seller/products?${params}`);
      const data = await res.json();

      if (res.ok) {
        setProducts(data.products);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchProducts();
  };

  const toggleProductStatus = async (productId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive }),
      });

      if (res.ok) {
        setProducts(products.map(p =>
          p.id === productId ? { ...p, is_active: !isActive } : p
        ));
      }
    } catch (error) {
      console.error('Error toggling product status:', error);
    }
  };

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Товарлар</h1>
          <p className="text-gray-500 mt-1">Жалпы: {pagination.total} товар</p>
        </div>
        <Link
          href="/seller/products/new"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium rounded-xl hover:from-red-600 hover:to-orange-600 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Товар кошуу
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Товар издөө..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>

          {/* Status Filter */}
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'Баары' },
              { value: 'active', label: 'Активдүү' },
              { value: 'inactive', label: 'Өчүрүлгөн' },
            ].map((s) => (
              <button
                key={s.value}
                onClick={() => {
                  setStatus(s.value);
                  setPagination({ ...pagination, page: 1 });
                }}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  status === s.value
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Товарлар жок</h3>
          <p className="text-gray-500 mb-4">Биринчи товарыңызды кошуп баштаңыз</p>
          <Link
            href="/seller/products/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium rounded-xl hover:from-red-600 hover:to-orange-600 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Товар кошуу
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 p-4 bg-gray-50 text-sm font-medium text-gray-500 border-b">
            <div className="col-span-5">Товар</div>
            <div className="col-span-2 text-center">Баасы</div>
            <div className="col-span-2 text-center">Саны</div>
            <div className="col-span-2 text-center">Статус</div>
            <div className="col-span-1"></div>
          </div>

          {/* Products List */}
          <div className="divide-y divide-gray-100">
            {products.map((product) => (
              <div key={product.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="md:grid md:grid-cols-12 gap-4 items-center">
                  {/* Product Info */}
                  <div className="col-span-5 flex items-center gap-4 mb-4 md:mb-0">
                    <div className="relative w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.title}
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
                    <div className="min-w-0">
                      <h3 className="font-medium text-gray-800 truncate">{product.title}</h3>
                      <p className="text-sm text-gray-500">{product.category?.name || 'Категориясыз'}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-2 text-center mb-2 md:mb-0">
                    <span className="font-semibold text-red-500">{product.price?.toLocaleString()} c</span>
                    {product.original_price && product.original_price > product.price && (
                      <span className="block text-sm text-gray-400 line-through">
                        {product.original_price.toLocaleString()} c
                      </span>
                    )}
                  </div>

                  {/* Stock */}
                  <div className="col-span-2 text-center mb-2 md:mb-0">
                    <span className={`inline-flex items-center px-2 py-1 rounded-lg text-sm ${
                      product.stock > 10
                        ? 'bg-green-100 text-green-700'
                        : product.stock > 0
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {product.stock} шт
                    </span>
                  </div>

                  {/* Status Toggle */}
                  <div className="col-span-2 text-center mb-4 md:mb-0">
                    <button
                      onClick={() => toggleProductStatus(product.id, product.is_active)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        product.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${product.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                      {product.is_active ? 'Активдүү' : 'Өчүк'}
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex justify-end gap-2">
                    <Link
                      href={`/seller/products/${product.id}/edit`}
                      className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <Link
                      href={`/product/${product.id}`}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t flex items-center justify-between">
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
