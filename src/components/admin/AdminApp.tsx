'use client';

import { Admin, Resource, ListGuesser, EditGuesser, ShowGuesser } from 'react-admin';
import { supabaseDataProvider } from 'ra-supabase';
import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';

// Колдонуучулар
import { UserList } from './resources/UserList';
import { UserShow } from './resources/UserShow';

// Заказдар
import { OrderList } from './resources/OrderList';

// Дүкөндөр
import { ShopList } from './resources/ShopList';

// Продукттар
import { ProductList } from './resources/ProductList';

// Supabase клиент - долбоордун client'ин колдонуу
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = getSupabaseClient();

// Data Provider
const dataProvider = supabaseDataProvider({
  instanceUrl: supabaseUrl,
  apiKey: supabaseKey,
  supabaseClient: supabase,
});

// Кыргызча котормо
const kyrgyzMessages = {
  ra: {
    action: {
      add_filter: 'Фильтр кошуу',
      add: 'Кошуу',
      back: 'Артка',
      bulk_actions: '%{smart_count} тандалды',
      cancel: 'Жокко чыгаруу',
      clear_input_value: 'Тазалоо',
      clone: 'Көчүрмө',
      confirm: 'Ырастоо',
      create: 'Түзүү',
      delete: 'Өчүрүү',
      edit: 'Өзгөртүү',
      export: 'Экспорт',
      list: 'Тизме',
      refresh: 'Жаңыртуу',
      remove_filter: 'Фильтрди алып салуу',
      remove: 'Алып салуу',
      save: 'Сактоо',
      search: 'Издөө',
      show: 'Көрүү',
      sort: 'Сорттоо',
      undo: 'Кайтаруу',
      unselect: 'Тандоону алып салуу',
      expand: 'Жайуу',
      close: 'Жабуу',
    },
    boolean: {
      true: 'Ооба',
      false: 'Жок',
      null: 'Белгисиз',
    },
    page: {
      create: '%{name} түзүү',
      dashboard: 'Башкы бет',
      edit: '%{name} #%{id}',
      error: 'Ката кетти',
      list: '%{name}',
      loading: 'Жүктөлүүдө',
      not_found: 'Табылган жок',
      show: '%{name} #%{id}',
    },
    input: {
      file: {
        upload_several: 'Файлдарды тартыңыз же тандоо үчүн басыңыз',
        upload_single: 'Файл тартыңыз же тандоо үчүн басыңыз',
      },
      image: {
        upload_several: 'Сүрөттөрдү тартыңыз же тандоо үчүн басыңыз',
        upload_single: 'Сүрөт тартыңыз же тандоо үчүн басыңыз',
      },
    },
    message: {
      about: 'Жөнүндө',
      are_you_sure: 'Ишенесизби?',
      bulk_delete_content: 'Чын эле %{name} өчүргүңүз келеби?',
      bulk_delete_title: '%{smart_count} %{name} өчүрүү',
      delete_content: 'Бул элементти өчүргүңүз келеби?',
      delete_title: '%{name} #%{id} өчүрүү',
      error: 'Ката кетти',
      invalid_form: 'Форма туура эмес толтурулган',
      loading: 'Барак жүктөлүүдө, күтө туруңуз',
      no: 'Жок',
      not_found: 'Туура эмес URL же ката шилтеме',
      yes: 'Ооба',
    },
    navigation: {
      no_results: 'Жыйынтык табылган жок',
      no_more_results: 'Барак номери %{page} чектен тышкары',
      page_out_of_boundaries: 'Барак номери %{page} чектен тышкары',
      page_out_from_end: 'Акыркы бараккан кийин өтүү мүмкүн эмес',
      page_out_from_begin: 'Биринчи бараккан мурун өтүү мүмкүн эмес',
      page_range_info: '%{offsetBegin}-%{offsetEnd} / %{total}',
      page_rows_per_page: 'Саптар:',
      next: 'Кийинки',
      prev: 'Мурунку',
    },
    notification: {
      updated: 'Элемент жаңыртылды',
      created: 'Элемент түзүлдү',
      deleted: 'Элемент өчүрүлдү',
      bad_item: 'Туура эмес элемент',
      item_doesnt_exist: 'Элемент жок',
      http_error: 'Сервер менен байланыш катасы',
      data_provider_error: 'dataProvider катасы',
      canceled: 'Аракет жокко чыгарылды',
    },
    validation: {
      required: 'Милдеттүү',
      minLength: 'Мин. %{min} символ',
      maxLength: 'Макс. %{max} символ',
      minValue: 'Мин. %{min}',
      maxValue: 'Макс. %{max}',
      number: 'Сан болушу керек',
      email: 'Туура эмес email',
    },
  },
};

// i18nProvider
const i18nProvider = {
  translate: (key: string, options?: any) => {
    const keys = key.split('.');
    let value: any = kyrgyzMessages;
    for (const k of keys) {
      value = value?.[k];
    }
    if (typeof value === 'string') {
      // Replace placeholders
      return value.replace(/%\{(\w+)\}/g, (_, p) => options?.[p] ?? '');
    }
    return key;
  },
  changeLocale: () => Promise.resolve(),
  getLocale: () => 'ky',
};

export default function AdminApp() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    const checkAdminAccess = async () => {
      // Admin email'дер
      const adminEmails = [
        'zhanatbekzheenbaev81@gmail.com',
        'zhanatbekzheenbaev54@gmail.com',
        'admin@arashan.kg'
      ];

      try {
        // Session текшерүү - жөнөкөй жол
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (error) {
          console.log('Session error:', error.message);
          setIsLoggedIn(false);
          setIsAdmin(false);
          return;
        }

        if (!session?.user) {
          console.log('❌ Session жок');
          setIsLoggedIn(false);
          setIsAdmin(false);
          return;
        }

        const user = session.user;
        console.log('✅ User:', user.email);

        setIsLoggedIn(true);
        setUserEmail(user.email || '');

        // Email текшерүү
        if (adminEmails.includes(user.email || '')) {
          console.log('✅ Admin!');
          setIsAdmin(true);
        } else {
          console.log('❌ Admin эмес');
          setIsAdmin(false);
        }
      } catch (error: any) {
        if (!isMounted) return;
        // AbortError игнордоо
        if (error?.name === 'AbortError') {
          console.log('Request aborted, retrying...');
          setTimeout(checkAdminAccess, 500);
          return;
        }
        console.error('Admin check error:', error);
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    };

    // Бир аз күтүү - hydration үчүн
    const timer = setTimeout(checkAdminAccess, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  // Жүктөлүүдө
  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Текшерилүүдө...</p>
        </div>
      </div>
    );
  }

  // Логин кылган эмес
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Кирүү талап кылынат</h1>
          <p className="text-gray-600 mb-6">
            Админ панелге кирүү үчүн биринчи аккаунтуңузга кириңиз.
          </p>
          <a
            href="/auth/login"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
          >
            Кирүү
          </a>
        </div>
      </div>
    );
  }

  // Админ эмес
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Кирүү тыюу салынган</h1>
          <p className="text-gray-600 mb-4">
            Бул барак админдер үчүн гана. Сизде жетиштүү укук жок.
          </p>
          <p className="text-sm text-gray-400 mb-6">
            Сиздин email: {userEmail}
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
          >
            Башкы бетке кайтуу
          </a>
        </div>
      </div>
    );
  }

  return (
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      title="Arashan Admin"
      darkTheme={{ palette: { mode: 'dark' } }}
    >
      <Resource
        name="users"
        list={UserList}
        show={UserShow}
        options={{ label: '👥 Колдонуучулар' }}
      />
      <Resource
        name="orders"
        list={OrderList}
        options={{ label: '📦 Заказдар' }}
      />
      <Resource
        name="shops"
        list={ShopList}
        options={{ label: '🏪 Дүкөндөр' }}
      />
      <Resource
        name="products"
        list={ProductList}
        options={{ label: '📱 Товарлар' }}
      />
    </Admin>
  );
}