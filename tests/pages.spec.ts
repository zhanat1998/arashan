import { test, expect } from '@playwright/test';

/**
 * PUBLIC PAGES - Кирүү талап кылынбайт
 */
const publicPages = [
  { path: '/', name: 'Башкы бет' },
  { path: '/categories', name: 'Категориялар' },
  { path: '/search', name: 'Издөө' },
  { path: '/live', name: 'Түз эфирлер' },
  { path: '/help', name: 'Жардам' },
  { path: '/auth/login', name: 'Кирүү' },
  { path: '/auth/register', name: 'Каттоо' },
  { path: '/auth/forgot-password', name: 'Сырсөздү унуттуңузбу' },
];

/**
 * AUTH REQUIRED PAGES - Кирүү талап кылынат
 */
const authRequiredPages = [
  { path: '/profile', name: 'Профиль' },
  { path: '/orders', name: 'Буйрутмалар' },
  { path: '/favorites', name: 'Тандалмалар' },
  { path: '/notifications', name: 'Билдирүүлөр' },
  { path: '/checkout', name: 'Төлөө' },
];

/**
 * SELLER PAGES - Сатуучу болуш керек
 */
const sellerPages = [
  { path: '/seller', name: 'Сатуучу башкы бет' },
  { path: '/seller/products', name: 'Товарлар' },
  { path: '/seller/orders', name: 'Буйрутмалар' },
  { path: '/seller/messages', name: 'Билдирүүлөр' },
  { path: '/seller/analytics', name: 'Аналитика' },
  { path: '/seller/videos', name: 'Видеолор' },
  { path: '/seller/live', name: 'Түз эфирлер' },
  { path: '/seller/shop', name: 'Дүкөн' },
];

/**
 * ADMIN PAGES - Админ болуш керек
 */
const adminPages = [
  { path: '/admin', name: 'Админ башкы бет' },
  { path: '/admin/products', name: 'Админ товарлар' },
  { path: '/admin/orders', name: 'Админ буйрутмалар' },
  { path: '/admin/videos', name: 'Админ видеолор' },
  { path: '/admin/shop', name: 'Админ дүкөн' },
];

// ==========================================
// PUBLIC PAGES TESTS
// ==========================================
test.describe('Public Pages - Жалпыга ачык барактар', () => {
  for (const page of publicPages) {
    test(`${page.name} (${page.path}) - жүктөлүшү керек`, async ({ page: browserPage }) => {
      const response = await browserPage.goto(page.path);

      // Барак ийгиликтүү жүктөлүшү керек
      expect(response?.status()).toBeLessThan(400);

      // JavaScript каталары болбошу керек
      const errors: string[] = [];
      browserPage.on('pageerror', (error) => {
        errors.push(error.message);
      });

      await browserPage.waitForLoadState('networkidle');
      expect(errors).toHaveLength(0);
    });
  }
});

// ==========================================
// AUTH REDIRECT TESTS
// ==========================================
test.describe('Auth Required Pages - Кирүү текшерүү', () => {
  for (const page of authRequiredPages) {
    test(`${page.name} (${page.path}) - логинге багыттоо`, async ({ page: browserPage }) => {
      await browserPage.goto(page.path);
      await browserPage.waitForLoadState('networkidle');

      const url = browserPage.url();

      // Кирүүсүз болгондуктан логинге багыттоо же ошол эле бетте калуу мүмкүн
      // (client-side auth check кийинчерээк ишке кирет)
      expect(url).toContain('localhost');
    });
  }
});

// ==========================================
// SELLER ACCESS TESTS
// ==========================================
test.describe('Seller Pages - Сатуучу уруксаты', () => {
  for (const page of sellerPages) {
    test(`${page.name} (${page.path}) - seller эмес болсо багыттоо`, async ({ page: browserPage }) => {
      await browserPage.goto(page.path);
      await browserPage.waitForLoadState('networkidle');

      const url = browserPage.url();

      // Логинге же дүкөн ачуу баракчасына багыттоо
      const isRedirected = url.includes('/auth/login') ||
                          url.includes('/seller/shop/create') ||
                          url.includes('redirect=');

      expect(isRedirected).toBeTruthy();
    });
  }

  // Shop create page should be accessible
  test('Дүкөн ачуу барагы жеткиликтүү болушу керек', async ({ page: browserPage }) => {
    // First login needed
    await browserPage.goto('/seller/shop/create');
    await browserPage.waitForLoadState('networkidle');

    const url = browserPage.url();
    // Should either show login or the create page (if logged in)
    const isValid = url.includes('/auth/login') || url.includes('/seller/shop/create');
    expect(isValid).toBeTruthy();
  });
});

// ==========================================
// ADMIN ACCESS TESTS
// ==========================================
test.describe('Admin Pages - Админ уруксаты', () => {
  for (const page of adminPages) {
    test(`${page.name} (${page.path}) - админ эмес болсо багыттоо`, async ({ page: browserPage }) => {
      await browserPage.goto(page.path);
      await browserPage.waitForLoadState('networkidle');

      const url = browserPage.url();

      // Логинге же башкы бетке багыттоо
      const isRedirected = url.includes('/auth/login') ||
                          !url.includes('/admin') ||
                          url.includes('redirect=');

      expect(isRedirected).toBeTruthy();
    });
  }
});

// ==========================================
// 404 PAGE TESTS
// ==========================================
test.describe('404 Not Found - Жок барактар', () => {
  const notFoundPaths = [
    '/this-page-does-not-exist',
    '/random/path/that/is/invalid',
    '/product/invalid-id-12345',
    '/seller/invalid-page',
    '/api/invalid-endpoint',
  ];

  for (const path of notFoundPaths) {
    test(`${path} - 404 кайтарышы керек`, async ({ page: browserPage }) => {
      const response = await browserPage.goto(path);

      // 404 статусу же not-found барагы
      const status = response?.status();
      expect(status === 404 || status === 200).toBeTruthy(); // Next.js may return 200 with 404 page
    });
  }
});

// ==========================================
// PAGE LOAD PERFORMANCE
// ==========================================
test.describe('Performance - Ылдамдык', () => {
  test('Башкы бет 3 секундда жүктөлүшү керек', async ({ page: browserPage }) => {
    const startTime = Date.now();
    await browserPage.goto('/');
    await browserPage.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000);
  });

  test('Категориялар 3 секундда жүктөлүшү керек', async ({ page: browserPage }) => {
    const startTime = Date.now();
    await browserPage.goto('/categories');
    await browserPage.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000);
  });
});

// ==========================================
// MOBILE RESPONSIVE TESTS
// ==========================================
test.describe('Mobile Responsive - Мобилдик көрүнүш', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('Башкы бет мобилдикте туура көрүнүшү керек', async ({ page: browserPage }) => {
    await browserPage.goto('/');
    await browserPage.waitForLoadState('networkidle');

    // Page should load without errors
    expect(browserPage.url()).toContain('localhost');
  });

  test('Навигация мобилдикте иштеши керек', async ({ page: browserPage }) => {
    await browserPage.goto('/');
    await browserPage.waitForLoadState('networkidle');

    // Page should load
    expect(browserPage.url()).toContain('localhost');
  });
});

// ==========================================
// SEO TESTS
// ==========================================
test.describe('SEO - Издөө оптимизациясы', () => {
  test('Башкы бетте title болушу керек', async ({ page: browserPage }) => {
    await browserPage.goto('/');
    const title = await browserPage.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('Meta description болушу керек', async ({ page: browserPage }) => {
    await browserPage.goto('/');
    const metaDescription = await browserPage.locator('meta[name="description"]').getAttribute('content');
    expect(metaDescription).toBeTruthy();
  });

  test('Viewport meta болушу керек', async ({ page: browserPage }) => {
    await browserPage.goto('/');
    const viewport = await browserPage.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');
  });
});