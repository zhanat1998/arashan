import { test, expect } from '@playwright/test';

/**
 * API ENDPOINT TESTS - API текшерүүлөрү
 */

// ==========================================
// PRODUCTS API
// ==========================================
test.describe('Products API - Товарлар', () => {
  test('GET /api/products - товарлар тизмесин алуу', async ({ request }) => {
    const response = await request.get('/api/products');

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('products');
    expect(Array.isArray(data.products)).toBeTruthy();
  });

  test('GET /api/products?limit=5 - чектөө менен', async ({ request }) => {
    const response = await request.get('/api/products?limit=5');

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.products.length).toBeLessThanOrEqual(5);
  });

  test('GET /api/products?search=test - издөө менен', async ({ request }) => {
    const response = await request.get('/api/products?search=test');

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty('products');
  });

  test('GET /api/products/:id - жок товар 404', async ({ request }) => {
    const response = await request.get('/api/products/non-existent-product-id-12345');

    // Should return 404
    expect([400, 404]).toContain(response.status());
  });

  test('POST /api/products - уруксатсыз түзүү 401', async ({ request }) => {
    const response = await request.post('/api/products', {
      data: {
        name: 'Test Product',
        price: 100,
      }
    });

    // Should require authentication
    expect(response.status()).toBe(401);
  });
});

// ==========================================
// CATEGORIES API
// ==========================================
test.describe('Categories API - Категориялар', () => {
  test('GET /api/categories - категориялар тизмеси', async ({ request }) => {
    const response = await request.get('/api/categories');

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(Array.isArray(data) || data.categories).toBeTruthy();
  });
});

// ==========================================
// SHOPS API
// ==========================================
test.describe('Shops API - Дүкөндөр', () => {
  test('GET /api/shops - дүкөндөр тизмеси', async ({ request }) => {
    const response = await request.get('/api/shops');

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty('shops');
  });

  test('POST /api/shops - уруксатсыз түзүү 401', async ({ request }) => {
    const response = await request.post('/api/shops', {
      data: {
        name: 'Test Shop',
      }
    });

    expect(response.status()).toBe(401);
  });

  test('GET /api/shops/my - уруксатсыз 401', async ({ request }) => {
    const response = await request.get('/api/shops/my');

    expect(response.status()).toBe(401);
  });
});

// ==========================================
// AUTH API
// ==========================================
test.describe('Auth API - Авторизация', () => {
  test('POST /api/auth/login - бош маалымат менен', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: {}
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('POST /api/auth/login - туура эмес маалымат', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: {
        phone: '+996700000000',
        password: 'wrongpassword123',
      }
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
  });

  test('POST /api/auth/register - бош маалымат', async ({ request }) => {
    const response = await request.post('/api/auth/register', {
      data: {}
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('POST /api/auth/send-otp - бош телефон', async ({ request }) => {
    const response = await request.post('/api/auth/send-otp', {
      data: {}
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('POST /api/auth/verify-otp - туура эмес OTP', async ({ request }) => {
    const response = await request.post('/api/auth/verify-otp', {
      data: {
        phone: '+996700000000',
        otp: '000000',
      }
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('POST /api/auth/logout - жооп', async ({ request }) => {
    const response = await request.post('/api/auth/logout');

    // Should work even without session
    expect(response.status()).toBeLessThan(500);
  });

  test('POST /api/auth/reset-password - бош маалымат', async ({ request }) => {
    const response = await request.post('/api/auth/reset-password', {
      data: {}
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});

// ==========================================
// ORDERS API
// ==========================================
test.describe('Orders API - Буйрутмалар', () => {
  test('GET /api/orders - уруксатсыз 401', async ({ request }) => {
    const response = await request.get('/api/orders');

    expect(response.status()).toBe(401);
  });

  test('POST /api/orders - уруксатсыз 401', async ({ request }) => {
    const response = await request.post('/api/orders', {
      data: {
        items: [],
      }
    });

    expect(response.status()).toBe(401);
  });

  test('GET /api/orders/:id - уруксатсыз 401', async ({ request }) => {
    const response = await request.get('/api/orders/some-order-id');

    expect([401, 404]).toContain(response.status());
  });
});

// ==========================================
// REVIEWS API
// ==========================================
test.describe('Reviews API - Пикирлер', () => {
  test('GET /api/reviews - пикирлер тизмеси', async ({ request }) => {
    const response = await request.get('/api/reviews');

    expect(response.status()).toBeLessThan(500);
  });

  test('POST /api/reviews - уруксатсыз 401', async ({ request }) => {
    const response = await request.post('/api/reviews', {
      data: {
        product_id: 'test',
        rating: 5,
        comment: 'Great!',
      }
    });

    expect(response.status()).toBe(401);
  });
});

// ==========================================
// VIDEOS API
// ==========================================
test.describe('Videos API - Видеолор', () => {
  test('GET /api/videos - видеолор тизмеси', async ({ request }) => {
    const response = await request.get('/api/videos');

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty('videos');
  });

  test('GET /api/videos/:id - жок видео', async ({ request }) => {
    const response = await request.get('/api/videos/non-existent-video');

    expect([400, 404]).toContain(response.status());
  });
});

// ==========================================
// LIVE API
// ==========================================
test.describe('Live API - Түз эфир', () => {
  test('GET /api/live - түз эфирлер тизмеси', async ({ request }) => {
    const response = await request.get('/api/live');

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty('livestreams');
  });

  test('GET /api/live?status=live - статус боюнча', async ({ request }) => {
    const response = await request.get('/api/live?status=live');

    expect(response.ok()).toBeTruthy();
  });

  test('GET /api/live/:id - жок эфир', async ({ request }) => {
    const response = await request.get('/api/live/non-existent-live');

    expect([400, 404]).toContain(response.status());
  });
});

// ==========================================
// WISHLIST API
// ==========================================
test.describe('Wishlist API - Тандалмалар', () => {
  test('GET /api/wishlist - уруксатсыз 401', async ({ request }) => {
    const response = await request.get('/api/wishlist');

    expect(response.status()).toBe(401);
  });

  test('POST /api/wishlist - уруксатсыз 401', async ({ request }) => {
    const response = await request.post('/api/wishlist', {
      data: {
        product_id: 'test',
      }
    });

    expect(response.status()).toBe(401);
  });
});

// ==========================================
// CHAT API
// ==========================================
test.describe('Chat API - Чат', () => {
  test('GET /api/chat - уруксатсыз 401', async ({ request }) => {
    const response = await request.get('/api/chat');

    expect(response.status()).toBe(401);
  });

  test('POST /api/chat - уруксатсыз 401', async ({ request }) => {
    const response = await request.post('/api/chat', {
      data: {
        receiver_id: 'test',
        message: 'Hello',
      }
    });

    expect(response.status()).toBe(401);
  });
});

// ==========================================
// SELLER API
// ==========================================
test.describe('Seller API - Сатуучу', () => {
  test('GET /api/seller/products - уруксатсыз 401', async ({ request }) => {
    const response = await request.get('/api/seller/products');

    expect(response.status()).toBe(401);
  });

  test('GET /api/seller/orders - уруксатсыз 401', async ({ request }) => {
    const response = await request.get('/api/seller/orders');

    expect(response.status()).toBe(401);
  });

  test('GET /api/seller/stats - уруксатсыз 401', async ({ request }) => {
    const response = await request.get('/api/seller/stats');

    expect(response.status()).toBe(401);
  });

  test('GET /api/seller/messages - уруксатсыз 401', async ({ request }) => {
    const response = await request.get('/api/seller/messages');

    expect(response.status()).toBe(401);
  });

  test('GET /api/seller/videos - уруксатсыз 401', async ({ request }) => {
    const response = await request.get('/api/seller/videos');

    expect(response.status()).toBe(401);
  });

  test('GET /api/seller/live - уруксатсыз 401', async ({ request }) => {
    const response = await request.get('/api/seller/live');

    expect(response.status()).toBe(401);
  });

  test('POST /api/seller/live - уруксатсыз 401', async ({ request }) => {
    const response = await request.post('/api/seller/live', {
      data: {
        title: 'Test Live',
      }
    });

    expect(response.status()).toBe(401);
  });
});

// ==========================================
// GAMES API
// ==========================================
test.describe('Games API - Оюндар', () => {
  test('GET /api/games - оюндар', async ({ request }) => {
    const response = await request.get('/api/games');

    expect(response.status()).toBeLessThan(500);
  });

  test('POST /api/games/spin-wheel - уруксатсыз', async ({ request }) => {
    const response = await request.post('/api/games/spin-wheel');

    expect([401, 400]).toContain(response.status());
  });

  test('POST /api/games/daily-checkin - уруксатсыз', async ({ request }) => {
    const response = await request.post('/api/games/daily-checkin');

    expect([401, 400]).toContain(response.status());
  });
});

// ==========================================
// FLASH SALE API
// ==========================================
test.describe('Flash Sale API - Flash сатуу', () => {
  test('GET /api/flash-sale - flash сатуулар', async ({ request }) => {
    const response = await request.get('/api/flash-sale');

    expect(response.status()).toBeLessThan(500);
  });
});

// ==========================================
// GROUP BUY API
// ==========================================
test.describe('Group Buy API - Топтук сатып алуу', () => {
  test('GET /api/group-buy - топтук сатуулар', async ({ request }) => {
    const response = await request.get('/api/group-buy');

    expect(response.status()).toBeLessThan(500);
  });
});

// ==========================================
// PAYMENTS API
// ==========================================
test.describe('Payments API - Төлөмдөр', () => {
  test('POST /api/payments - уруксатсыз 401', async ({ request }) => {
    const response = await request.post('/api/payments', {
      data: {
        order_id: 'test',
        method: 'mbank',
      }
    });

    expect(response.status()).toBe(401);
  });

  test('POST /api/payments/webhook/mbank - signature жок', async ({ request }) => {
    const response = await request.post('/api/payments/webhook/mbank', {
      data: {
        transaction_id: 'fake',
        status: 'success',
      }
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('POST /api/payments/webhook/elsom - signature жок', async ({ request }) => {
    const response = await request.post('/api/payments/webhook/elsom', {
      data: {
        transaction_id: 'fake',
        status: 'success',
      }
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});

// ==========================================
// UPLOAD API
// ==========================================
test.describe('Upload API - Жүктөө', () => {
  test('POST /api/upload - уруксатсыз 401', async ({ request }) => {
    const response = await request.post('/api/upload');

    expect(response.status()).toBe(401);
  });
});

// ==========================================
// API ERROR HANDLING
// ==========================================
test.describe('API Error Handling - Ката иштетүү', () => {
  test('Invalid JSON body', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      headers: {
        'Content-Type': 'application/json',
      },
      data: 'not valid json {{{',
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
  });

  test('Wrong HTTP method', async ({ request }) => {
    // Try DELETE on GET-only endpoint
    const response = await request.delete('/api/products');

    expect([400, 405]).toContain(response.status());
  });

  test('Missing required fields', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: {
        phone: '+996700000000',
        // missing password
      }
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
  });
});

// ==========================================
// API RESPONSE FORMAT
// ==========================================
test.describe('API Response Format - Жооп форматы', () => {
  test('JSON response header', async ({ request }) => {
    const response = await request.get('/api/products');

    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
  });

  test('Error response format', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: {}
    });

    const data = await response.json();

    // Error response should have error field
    expect(data).toHaveProperty('error');
    expect(typeof data.error).toBe('string');
  });
});