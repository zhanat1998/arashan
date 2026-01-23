'use client';

import dynamic from 'next/dynamic';

// React-Admin динамикалык импорт (SSR жок)
const AdminApp = dynamic(() => import('@/components/admin/AdminApp'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Админ панел жүктөлүүдө...</p>
      </div>
    </div>
  )
});

export default function SuperAdminPage() {
  return <AdminApp />;
}