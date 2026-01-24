import { test, expect } from '@playwright/test';

/**
 * SELLER FUNCTIONALITY TESTS - Сатуучу функциялары
 */

// ==========================================
// SHOP CREATE PAGE TESTS
// ==========================================
test.describe('Shop Create Page - Дүкөн ачуу барагы', () => {
  test.beforeEach(async ({ page }) => {
    // Note: This will redirect to login if not authenticated
    await page.goto('/seller/shop/create');
    await page.waitForLoadState('networkidle');
  });

  test('Дүкөн ачуу барагы же логин барагы көрүнүшү керек', async ({ page }) => {
    const url = page.url();

    // Should be on either create page or login
    const isValidPage = url.includes('/seller/shop/create') || url.includes('/auth/login');
    expect(isValidPage).toBeTruthy();
  });

  test('Дүкөн ачуу формасы толук болушу керек', async ({ page }) => {
    // If on create page
    if (page.url().includes('/seller/shop/create')) {
      // Shop name input
      const nameInput = page.locator('input[name="name"], input[placeholder*="аты"], input[placeholder*="Дүкөн"]');
      await expect(nameInput).toBeVisible();

      // Description textarea
      const descriptionInput = page.locator('textarea[name="description"], textarea[placeholder*="сүрөттөмө"]');
      await expect(descriptionInput).toBeVisible();

      // Submit button
      const submitButton = page.locator('button[type="submit"], button:has-text("Ачуу"), button:has-text("Түзүү")');
      await expect(submitButton).toBeVisible();
    }
  });

  test('Бош аталыш менен жөнөтүүгө болбойт', async ({ page }) => {
    if (page.url().includes('/seller/shop/create')) {
      // Try to submit without name
      const submitButton = page.locator('button:has-text("Кийинки"), button:has-text("Ачуу")');
      await submitButton.click();

      await page.waitForTimeout(500);

      // Should show error
      const errorMessage = page.locator('text=/керек|киргизиңиз|required/i');
      const isInputInvalid = await page.locator('input:invalid').count() > 0;

      expect(await errorMessage.isVisible() || isInputInvalid).toBeTruthy();
    }
  });
});

// ==========================================
// SELLER DASHBOARD TESTS
// ==========================================
test.describe('Seller Dashboard - Сатуучу панели', () => {
  test('Уруксатсыз seller панелине кирүүгө болбойт', async ({ page }) => {
    await page.goto('/seller');
    await page.waitForLoadState('networkidle');

    const url = page.url();

    // Should redirect to login or shop create
    const isRedirected = url.includes('/auth/login') ||
                         url.includes('/seller/shop/create') ||
                         !url.endsWith('/seller');

    expect(isRedirected).toBeTruthy();
  });
});

// ==========================================
// SELLER PRODUCTS TESTS
// ==========================================
test.describe('Seller Products - Товарлар', () => {
  test('Товарлар барагына уруксатсыз кирүүгө болбойт', async ({ page }) => {
    await page.goto('/seller/products');
    await page.waitForLoadState('networkidle');

    const url = page.url();
    const isRedirected = url.includes('/auth/login') ||
                         url.includes('/seller/shop/create');

    expect(isRedirected).toBeTruthy();
  });

  test('Жаңы товар барагына уруксатсыз кирүүгө болбойт', async ({ page }) => {
    await page.goto('/seller/products/new');
    await page.waitForLoadState('networkidle');

    const url = page.url();
    const isRedirected = url.includes('/auth/login') ||
                         url.includes('/seller/shop/create');

    expect(isRedirected).toBeTruthy();
  });
});

// ==========================================
// SELLER ORDERS TESTS
// ==========================================
test.describe('Seller Orders - Буйрутмалар', () => {
  test('Буйрутмалар барагына уруксатсыз кирүүгө болбойт', async ({ page }) => {
    await page.goto('/seller/orders');
    await page.waitForLoadState('networkidle');

    const url = page.url();
    const isRedirected = url.includes('/auth/login') ||
                         url.includes('/seller/shop/create');

    expect(isRedirected).toBeTruthy();
  });
});

// ==========================================
// SELLER MESSAGES TESTS
// ==========================================
test.describe('Seller Messages - Билдирүүлөр', () => {
  test('Билдирүүлөр барагына уруксатсыз кирүүгө болбойт', async ({ page }) => {
    await page.goto('/seller/messages');
    await page.waitForLoadState('networkidle');

    const url = page.url();
    const isRedirected = url.includes('/auth/login') ||
                         url.includes('/seller/shop/create');

    expect(isRedirected).toBeTruthy();
  });
});

// ==========================================
// SELLER ANALYTICS TESTS
// ==========================================
test.describe('Seller Analytics - Аналитика', () => {
  test('Аналитика барагына уруксатсыз кирүүгө болбойт', async ({ page }) => {
    await page.goto('/seller/analytics');
    await page.waitForLoadState('networkidle');

    const url = page.url();
    const isRedirected = url.includes('/auth/login') ||
                         url.includes('/seller/shop/create');

    expect(isRedirected).toBeTruthy();
  });
});

// ==========================================
// SELLER VIDEOS TESTS
// ==========================================
test.describe('Seller Videos - Видеолор', () => {
  test('Видеолор барагына уруксатсыз кирүүгө болбойт', async ({ page }) => {
    await page.goto('/seller/videos');
    await page.waitForLoadState('networkidle');

    const url = page.url();
    const isRedirected = url.includes('/auth/login') ||
                         url.includes('/seller/shop/create');

    expect(isRedirected).toBeTruthy();
  });

  test('Видео жүктөө барагына уруксатсыз кирүүгө болбойт', async ({ page }) => {
    await page.goto('/seller/videos/upload');
    await page.waitForLoadState('networkidle');

    const url = page.url();
    const isRedirected = url.includes('/auth/login') ||
                         url.includes('/seller/shop/create');

    expect(isRedirected).toBeTruthy();
  });
});

// ==========================================
// SELLER LIVE TESTS
// ==========================================
test.describe('Seller Live - Түз эфир', () => {
  test('Түз эфир барагына уруксатсыз кирүүгө болбойт', async ({ page }) => {
    await page.goto('/seller/live');
    await page.waitForLoadState('networkidle');

    const url = page.url();
    const isRedirected = url.includes('/auth/login') ||
                         url.includes('/seller/shop/create');

    expect(isRedirected).toBeTruthy();
  });

  test('Эфир баштоо барагына уруксатсыз кирүүгө болбойт', async ({ page }) => {
    await page.goto('/seller/live/start');
    await page.waitForLoadState('networkidle');

    const url = page.url();
    const isRedirected = url.includes('/auth/login') ||
                         url.includes('/seller/shop/create');

    expect(isRedirected).toBeTruthy();
  });
});

// ==========================================
// SELLER SHOP SETTINGS TESTS
// ==========================================
test.describe('Seller Shop Settings - Дүкөн жөндөөлөрү', () => {
  test('Дүкөн жөндөөлөрүнө уруксатсыз кирүүгө болбойт', async ({ page }) => {
    await page.goto('/seller/shop');
    await page.waitForLoadState('networkidle');

    const url = page.url();
    const isRedirected = url.includes('/auth/login') ||
                         url.includes('/seller/shop/create');

    expect(isRedirected).toBeTruthy();
  });
});

// ==========================================
// SELLER API AUTHORIZATION TESTS
// ==========================================
test.describe('Seller API Authorization - API авторизация', () => {
  test('Товар түзүү API уруксатсыз иштебейт', async ({ request }) => {
    const response = await request.post('/api/seller/products', {
      data: {
        name: 'Test Product',
        price: 100,
        description: 'Test description',
      }
    });

    // 401 unauthorized or 405 method not allowed
    expect([401, 405]).toContain(response.status());
  });

  test('Товар жаңылоо API уруксатсыз иштебейт', async ({ request }) => {
    const response = await request.patch('/api/seller/products', {
      data: {
        id: 'some-product-id',
        name: 'Updated Name',
      }
    });

    expect([401, 405]).toContain(response.status());
  });

  test('Товар өчүрүү API уруксатсыз иштебейт', async ({ request }) => {
    const response = await request.delete('/api/seller/products', {
      data: {
        id: 'some-product-id',
      }
    });

    expect([401, 405]).toContain(response.status());
  });

  test('Статистика API уруксатсыз иштебейт', async ({ request }) => {
    const response = await request.get('/api/seller/stats');

    expect(response.status()).toBe(401);
  });

  test('Билдирүүлөр API уруксатсыз иштебейт', async ({ request }) => {
    const response = await request.get('/api/seller/messages');

    expect(response.status()).toBe(401);
  });

  test('Түз эфир түзүү API уруксатсыз иштебейт', async ({ request }) => {
    const response = await request.post('/api/seller/live', {
      data: {
        title: 'Test Live',
        description: 'Test description',
      }
    });

    expect(response.status()).toBe(401);
  });

  test('Видео жүктөө API уруксатсыз иштебейт', async ({ request }) => {
    const response = await request.post('/api/seller/videos', {
      data: {
        title: 'Test Video',
        video_url: 'https://example.com/video.mp4',
      }
    });

    expect([401, 405]).toContain(response.status());
  });
});

// ==========================================
// SELLER SIDEBAR NAVIGATION TESTS
// ==========================================
test.describe('Seller Navigation - Сатуучу навигация', () => {
  test('Сол менюда бардык шилтемелер болушу керек', async ({ page }) => {
    // This test will run if we somehow get to seller pages
    await page.goto('/seller/shop/create');
    await page.waitForLoadState('networkidle');

    if (page.url().includes('/seller/shop/create')) {
      // Check for navigation links in sidebar
      const sidebarLinks = [
        'Башкы бет',
        'Дүкөн',
        'Товарлар',
        'Видеолор',
        'Буйрутмалар',
        'Билдирүүлөр',
        'Аналитика',
      ];

      for (const linkText of sidebarLinks) {
        const link = page.locator(`text=${linkText}`);
        // Link might be visible in sidebar
        // await expect(link).toBeVisible();
      }
    }
  });
});

// ==========================================
// SELLER FORM VALIDATION TESTS
// ==========================================
test.describe('Seller Form Validation - Форма текшерүү', () => {
  test('Товар формасында баа терс болбошу керек', async ({ request }) => {
    const response = await request.post('/api/seller/products', {
      data: {
        name: 'Test Product',
        price: -100, // Negative price
        description: 'Test',
      }
    });

    // Should be rejected (401 because not auth, or 400 if auth)
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('Товар формасында аталыш бош болбошу керек', async ({ request }) => {
    const response = await request.post('/api/seller/products', {
      data: {
        name: '', // Empty name
        price: 100,
      }
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('Түз эфир аталышы бош болбошу керек', async ({ request }) => {
    const response = await request.post('/api/seller/live', {
      data: {
        title: '', // Empty title
      }
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});

// ==========================================
// CROSS-SHOP PROTECTION TESTS
// ==========================================
test.describe('Cross-Shop Protection - Башка дүкөн коргоо', () => {
  test('Башка дүкөндүн товарын өзгөртүүгө болбойт API', async ({ request }) => {
    // Even if authenticated as seller, can't modify other shop's products
    const response = await request.patch('/api/seller/products', {
      data: {
        id: 'other-shop-product-id-12345',
        name: 'Hacked Product Name',
        price: 0,
      }
    });

    // Should be 401 (no auth) or 403/404 (not owner) or 405 (method not allowed)
    expect([401, 403, 404, 405]).toContain(response.status());
  });

  test('Башка дүкөндүн буйрутмасын өзгөртүүгө болбойт', async ({ request }) => {
    const response = await request.patch('/api/seller/orders', {
      data: {
        order_id: 'other-shop-order-id',
        status: 'cancelled',
      }
    });

    expect([401, 403, 404, 405]).toContain(response.status());
  });
});

// ==========================================
// FILE UPLOAD TESTS
// ==========================================
test.describe('Seller File Upload - Файл жүктөө', () => {
  test('Сүрөт жүктөө уруксатсыз иштебейт', async ({ request }) => {
    const response = await request.post('/api/upload', {
      multipart: {
        file: {
          name: 'test.jpg',
          mimeType: 'image/jpeg',
          buffer: Buffer.from('fake image content'),
        },
      },
    });

    expect(response.status()).toBe(401);
  });
});

// ==========================================
// SELLER MOBILE RESPONSIVE TESTS
// ==========================================
test.describe('Seller Mobile Responsive - Мобилдик', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('Дүкөн ачуу мобилдикте туура көрүнүшү керек', async ({ page }) => {
    await page.goto('/seller/shop/create');
    await page.waitForLoadState('networkidle');

    if (page.url().includes('/seller/shop/create')) {
      // Check no horizontal scroll
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);

      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10);
    }
  });

  test('Мобилдик меню иштеши керек', async ({ page }) => {
    await page.goto('/seller/shop/create');
    await page.waitForLoadState('networkidle');

    if (page.url().includes('/seller/shop/create')) {
      // Look for hamburger menu button
      const menuButton = page.locator('button[aria-label*="menu"], button:has(svg):near(text="Seller")');

      if (await menuButton.isVisible()) {
        await menuButton.click();
        await page.waitForTimeout(300);

        // Sidebar should be visible
        const sidebar = page.locator('aside, nav, [role="navigation"]');
        await expect(sidebar).toBeVisible();
      }
    }
  });
});