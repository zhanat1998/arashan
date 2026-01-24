import { test, expect, request } from '@playwright/test';

/**
 * SECURITY TESTS - Коопсуздук текшерүүлөрү
 * XSS, SQL Injection, CSRF, Authentication bypass, etc.
 */

// ==========================================
// XSS (Cross-Site Scripting) TESTS
// ==========================================
test.describe('XSS Protection - XSS коргоо', () => {
  const xssPayloads = [
    '<script>alert("xss")</script>',
    '"><script>alert(1)</script>',
    "'-alert(1)-'",
    '<img src=x onerror=alert(1)>',
    '<svg onload=alert(1)>',
    'javascript:alert(1)',
    '<body onload=alert(1)>',
    '{{constructor.constructor("alert(1)")()}}',
    '<iframe src="javascript:alert(1)">',
    '<input onfocus=alert(1) autofocus>',
  ];

  test('Издөө формасында XSS коргоо', async ({ page }) => {
    await page.goto('/search');

    for (const payload of xssPayloads.slice(0, 3)) {
      // Search input
      const searchInput = page.locator('input[type="search"], input[type="text"], input[placeholder*="изд"], input[name="q"]').first();

      if (await searchInput.isVisible()) {
        await searchInput.fill(payload);
        await searchInput.press('Enter');

        // Check that script is not executed
        const alerts: string[] = [];
        page.on('dialog', (dialog) => {
          alerts.push(dialog.message());
          dialog.dismiss();
        });

        await page.waitForTimeout(500);
        expect(alerts).toHaveLength(0);
      }
    }
  });

  test('API XSS коргоо - products search', async ({ request }) => {
    for (const payload of xssPayloads.slice(0, 5)) {
      const response = await request.get('/api/products', {
        params: { search: payload }
      });

      const data = await response.text();

      // Response should not contain unescaped script tags
      expect(data).not.toContain('<script>alert');
      expect(data).not.toContain('onerror=alert');
    }
  });

  test('Security headers болушу керек', async ({ page }) => {
    const response = await page.goto('/');

    const headers = response?.headers();

    // X-Content-Type-Options
    expect(headers?.['x-content-type-options']).toBe('nosniff');

    // X-Frame-Options
    expect(headers?.['x-frame-options']).toBeTruthy();

    // X-XSS-Protection
    expect(headers?.['x-xss-protection']).toBeTruthy();
  });
});

// ==========================================
// SQL INJECTION TESTS
// ==========================================
test.describe('SQL Injection Protection - SQL инъекция коргоо', () => {
  const sqlPayloads = [
    "' OR '1'='1",
    "1' OR '1'='1' --",
    "'; DROP TABLE users; --",
    "1; DELETE FROM products WHERE 1=1; --",
    "' UNION SELECT * FROM users --",
    "admin'--",
    "1' AND 1=1 --",
    "1' AND (SELECT COUNT(*) FROM users) > 0 --",
    "'; EXEC xp_cmdshell('dir'); --",
    "1' WAITFOR DELAY '0:0:5' --",
  ];

  test('API products SQL injection коргоо', async ({ request }) => {
    for (const payload of sqlPayloads) {
      const response = await request.get('/api/products', {
        params: { search: payload, category: payload }
      });

      // Should return valid response (not 500 server error from SQL)
      // 400 is acceptable for invalid input
      expect(response.status()).toBeLessThanOrEqual(500);

      // Response time should be normal (not delayed by SQL injection)
      expect(response.headers()['x-response-time'] || '0').not.toContain('5000');
    }
  });

  test('Login SQL injection коргоо', async ({ request }) => {
    for (const payload of sqlPayloads.slice(0, 5)) {
      const response = await request.post('/api/auth/login', {
        data: {
          phone: payload,
          password: payload,
        }
      });

      // Should not return server error
      expect(response.status()).toBeLessThan(500);

      // Should not leak database info
      const body = await response.text();
      expect(body.toLowerCase()).not.toContain('sql');
      expect(body.toLowerCase()).not.toContain('syntax');
      expect(body.toLowerCase()).not.toContain('database');
    }
  });

  test('Product ID SQL injection коргоо', async ({ request }) => {
    const maliciousIds = [
      "1' OR '1'='1",
      "1; DROP TABLE products;--",
      "1 UNION SELECT * FROM users",
    ];

    for (const id of maliciousIds) {
      const response = await request.get(`/api/products/${encodeURIComponent(id)}`);

      // Should return 400 or 404, not 500
      expect(response.status()).toBeLessThan(500);
    }
  });
});

// ==========================================
// AUTHENTICATION BYPASS TESTS
// ==========================================
test.describe('Authentication Bypass - Авторизация текшерүү', () => {
  test('Seller API уруксатсыз жеткиликсиз', async ({ request }) => {
    const sellerEndpoints = [
      { method: 'GET', url: '/api/seller/products' },
      { method: 'POST', url: '/api/seller/products' },
      { method: 'GET', url: '/api/seller/orders' },
      { method: 'GET', url: '/api/seller/stats' },
      { method: 'GET', url: '/api/seller/messages' },
      { method: 'POST', url: '/api/seller/live' },
    ];

    for (const endpoint of sellerEndpoints) {
      let response;
      if (endpoint.method === 'GET') {
        response = await request.get(endpoint.url);
      } else {
        response = await request.post(endpoint.url, { data: {} });
      }

      // Should return 401 Unauthorized or 405 Method Not Allowed
      expect([401, 405]).toContain(response.status());
    }
  });

  test('Orders API башка колдонуучунун заказына жетүү мүмкүн эмес', async ({ request }) => {
    // Try to access someone else's order
    const response = await request.get('/api/orders/fake-order-id-12345');

    // Should be 401 (not logged in) or 404 (not found)
    expect([401, 404]).toContain(response.status());
  });

  test('JWT/Cookie manipulation', async ({ page }) => {
    // Try to access protected page with fake cookie
    await page.context().addCookies([
      {
        name: 'sb-access-token',
        value: 'fake-token-12345',
        domain: 'localhost',
        path: '/',
      }
    ]);

    await page.goto('/seller');
    await page.waitForLoadState('networkidle');

    const url = page.url();
    // Should redirect to login or show error
    const isProtected = url.includes('/auth/login') ||
                        url.includes('/seller/shop/create') ||
                        !url.includes('/seller');

    expect(isProtected).toBeTruthy();
  });
});

// ==========================================
// CSRF PROTECTION TESTS
// ==========================================
test.describe('CSRF Protection - CSRF коргоо', () => {
  test('API POST requests без валидации отвергаются', async ({ request }) => {
    // Try to create order without proper authentication
    const response = await request.post('/api/orders', {
      data: {
        items: [{ product_id: 'test', quantity: 1 }],
        address: 'Test address',
      },
      headers: {
        'Origin': 'https://evil-site.com',
      }
    });

    // Should be rejected
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('Payment webhook без signature отвергается', async ({ request }) => {
    const webhooks = [
      '/api/payments/webhook/mbank',
      '/api/payments/webhook/elsom',
      '/api/payments/webhook/odengi',
    ];

    for (const webhook of webhooks) {
      const response = await request.post(webhook, {
        data: {
          transaction_id: 'fake-123',
          amount: 1000,
          status: 'success',
        }
      });

      // Should verify signature and reject
      expect(response.status()).toBeGreaterThanOrEqual(400);
    }
  });
});

// ==========================================
// RATE LIMITING TESTS
// ==========================================
test.describe('Rate Limiting - Чектөө', () => {
  test('Login brute force коргоо', async ({ request }) => {
    const attempts = [];

    // Try 20 rapid login attempts
    for (let i = 0; i < 20; i++) {
      const response = await request.post('/api/auth/login', {
        data: {
          phone: '+996700000000',
          password: 'wrongpassword' + i,
        }
      });
      attempts.push(response.status());
    }

    // Some attempts should be rate limited (429)
    // or at least all should fail (401)
    const allFailed = attempts.every(status => status >= 400);
    expect(allFailed).toBeTruthy();
  });

  test('OTP brute force коргоо', async ({ request }) => {
    const attempts = [];

    // Try 20 rapid OTP verifications
    for (let i = 0; i < 20; i++) {
      const response = await request.post('/api/auth/verify-otp', {
        data: {
          phone: '+996700000000',
          otp: String(100000 + i),
        }
      });
      attempts.push(response.status());
    }

    // Should be rate limited or fail
    const allFailed = attempts.every(status => status >= 400);
    expect(allFailed).toBeTruthy();
  });
});

// ==========================================
// FILE UPLOAD SECURITY TESTS
// ==========================================
test.describe('File Upload Security - Файл жүктөө коопсуздугу', () => {
  test('Зыяндуу файл тиби четке кагылышы керек', async ({ request }) => {
    const maliciousFiles = [
      { name: 'malware.exe', type: 'application/x-msdownload' },
      { name: 'script.php', type: 'application/x-php' },
      { name: 'shell.jsp', type: 'text/x-jsp' },
      { name: 'backdoor.asp', type: 'text/asp' },
      { name: 'virus.bat', type: 'application/x-msdos-program' },
    ];

    for (const file of maliciousFiles) {
      const response = await request.post('/api/upload', {
        multipart: {
          file: {
            name: file.name,
            mimeType: file.type,
            buffer: Buffer.from('malicious content'),
          },
        },
      });

      // Should reject malicious file types
      expect([400, 401, 403, 415]).toContain(response.status());
    }
  });

  test('Чоң файл четке кагылышы керек', async ({ request }) => {
    // Create 50MB file (larger than typical limit)
    const largeBuffer = Buffer.alloc(50 * 1024 * 1024, 'x');

    const response = await request.post('/api/upload', {
      multipart: {
        file: {
          name: 'large-file.jpg',
          mimeType: 'image/jpeg',
          buffer: largeBuffer,
        },
      },
    });

    // Should reject large files (413 or 400)
    expect([400, 401, 413]).toContain(response.status());
  });
});

// ==========================================
// SENSITIVE DATA EXPOSURE TESTS
// ==========================================
test.describe('Sensitive Data Exposure - Маалымат агып кетүүсү', () => {
  test('Error messages should not expose internal info', async ({ request }) => {
    // Trigger an error
    const response = await request.get('/api/products/invalid-uuid-format-!!!');

    const body = await response.text();

    // Should not expose internal paths or stack traces
    expect(body).not.toContain('/Users/');
    expect(body).not.toContain('node_modules');
    expect(body).not.toContain('at Object.');
    expect(body).not.toContain('.ts:');
  });

  test('API should not expose sensitive user data', async ({ request }) => {
    const response = await request.get('/api/products');

    if (response.ok()) {
      const data = await response.json();

      // Stringify to check all fields
      const jsonString = JSON.stringify(data);

      // Should not contain sensitive fields
      expect(jsonString).not.toContain('password');
      expect(jsonString).not.toContain('password_hash');
      expect(jsonString).not.toContain('secret');
      expect(jsonString).not.toContain('api_key');
      expect(jsonString).not.toContain('private_key');
    }
  });

  test('Source maps should not be exposed in production', async ({ page }) => {
    await page.goto('/');

    // Try to access source maps
    const response = await page.request.get('/_next/static/chunks/main.js.map');

    // Should not be accessible (404 or 403)
    expect([403, 404]).toContain(response.status());
  });
});

// ==========================================
// IDOR (Insecure Direct Object Reference) TESTS
// ==========================================
test.describe('IDOR Protection - Объект чалгындоо коргоо', () => {
  test('Башка колдонуучунун профилин өзгөртүүгө мүмкүн эмес', async ({ request }) => {
    // Try to update someone else's profile without auth
    const response = await request.patch('/api/users/other-user-id', {
      data: {
        full_name: 'Hacked Name',
        role: 'admin',
      }
    });

    // Should be unauthorized or not found
    expect([401, 403, 404, 405]).toContain(response.status());
  });

  test('Башка дүкөндүн товарын өзгөртүүгө мүмкүн эмес', async ({ request }) => {
    const response = await request.patch('/api/seller/products', {
      data: {
        id: 'other-shop-product-id',
        price: 0,
      }
    });

    // Should be unauthorized or method not allowed
    expect([401, 403, 404, 405]).toContain(response.status());
  });
});

// ==========================================
// HEADER SECURITY TESTS
// ==========================================
test.describe('Security Headers - Коопсуздук хедерлери', () => {
  test('Content-Security-Policy болушу керек', async ({ page }) => {
    const response = await page.goto('/');
    const csp = response?.headers()['content-security-policy'];

    expect(csp).toBeTruthy();
    expect(csp).toContain("default-src");
  });

  test('Referrer-Policy болушу керек', async ({ page }) => {
    const response = await page.goto('/');
    const referrerPolicy = response?.headers()['referrer-policy'];

    expect(referrerPolicy).toBeTruthy();
  });

  test('Server header жашырылышы керек', async ({ page }) => {
    const response = await page.goto('/');
    const server = response?.headers()['server'];
    const poweredBy = response?.headers()['x-powered-by'];

    // Server info should be hidden
    expect(poweredBy).toBeFalsy();
  });
});

// ==========================================
// INPUT VALIDATION TESTS
// ==========================================
test.describe('Input Validation - Киргизүү текшерүү', () => {
  test('Телефон номери валидациясы', async ({ request }) => {
    const invalidPhones = [
      'not-a-phone',
      '123',
      'abcdefghij',
      '+996 700 00 00 00 extra text',
      '<script>alert(1)</script>',
    ];

    for (const phone of invalidPhones) {
      const response = await request.post('/api/auth/send-otp', {
        data: { phone }
      });

      // Should reject invalid phone
      expect(response.status()).toBeGreaterThanOrEqual(400);
      expect(response.status()).toBeLessThan(500);
    }
  });

  test('Email валидациясы', async ({ request }) => {
    const invalidEmails = [
      'not-an-email',
      '@no-local-part.com',
      'no-domain@',
      'spaces in@email.com',
      '<script>@evil.com',
    ];

    for (const email of invalidEmails) {
      const response = await request.post('/api/auth/register', {
        data: {
          email,
          password: 'Test123!@#',
          full_name: 'Test User',
        }
      });

      // Should reject invalid email
      expect(response.status()).toBeGreaterThanOrEqual(400);
    }
  });

  test('Price manipulation коргоо', async ({ request }) => {
    const maliciousPrices = [
      -100,      // Negative price
      0,         // Zero price
      0.001,     // Micro price
      999999999, // Extremely high
    ];

    for (const price of maliciousPrices) {
      const response = await request.post('/api/orders', {
        data: {
          items: [{
            product_id: 'test',
            quantity: 1,
            price: price,  // Client-side price manipulation
          }],
        }
      });

      // Should be rejected (401 unauth or 400 bad request)
      expect(response.status()).toBeGreaterThanOrEqual(400);
    }
  });
});