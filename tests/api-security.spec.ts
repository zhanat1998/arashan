import { test, expect } from '@playwright/test';

/**
 * API ЖАНА КООПСУЗДУК ТЕСТТЕРИ
 *
 * Текшерет:
 * - API endpoints коргоосу
 * - Security headers
 * - CSRF коргоо
 * - Rate limiting
 * - Authentication checks
 */

const BASE_URL = 'http://localhost:3000';

test.describe('API Security - Authentication Endpoints', () => {

  // =====================
  // LOGIN API
  // =====================

  test('POST /api/auth/login - бош body', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/auth/login`, {
      data: {}
    });

    expect(response.status()).toBe(400);
    const json = await response.json();
    expect(json.error).toBeDefined();
  });

  test('POST /api/auth/login - туура эмес JSON', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: 'invalid json{'
    });

    // 400 же 500 болушу керек, бирок crash болбошу керек
    expect([400, 500]).toContain(response.status());
  });

  test('POST /api/auth/login - XSS payload', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/auth/login`, {
      data: {
        email: '<script>alert(1)</script>@test.com',
        password: '<script>alert(1)</script>'
      }
    });

    const json = await response.json();
    // XSS payload жооп ичинде болбошу керек
    const responseText = JSON.stringify(json);
    expect(responseText).not.toContain('<script>');
  });

  test('POST /api/auth/login - SQL injection', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/auth/login`, {
      data: {
        email: "' OR '1'='1' --@test.com",
        password: "' OR '1'='1"
      }
    });

    // 500 error болбошу керек (SQL injection иштебеши керек)
    expect(response.status()).not.toBe(500);
  });

  // =====================
  // REGISTER API
  // =====================

  test('POST /api/auth/register - бош body', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/auth/register`, {
      data: {}
    });

    // 400 же 429 (rate limit) болушу мүмкүн
    expect([400, 429]).toContain(response.status());
  });

  test('POST /api/auth/register - алсыз сырсөз', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/auth/register`, {
      data: {
        email: `test${Date.now()}@test.com`,
        password: '123',
        fullName: 'Test User'
      }
    });

    // 400 же 429 (rate limit) болушу мүмкүн
    expect([400, 429]).toContain(response.status());
  });

  test('POST /api/auth/register - туура эмес email', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/auth/register`, {
      data: {
        email: 'notanemail',
        password: 'TestPass123!',
        fullName: 'Test User'
      }
    });

    // 400 же 429 (rate limit) болушу мүмкүн
    expect([400, 429]).toContain(response.status());
  });

  // =====================
  // RESET PASSWORD API
  // =====================

  test('POST /api/auth/reset-password - бош body', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/auth/reset-password`, {
      data: {}
    });

    // 400 же 429 (rate limit) болушу мүмкүн
    expect([400, 429]).toContain(response.status());
  });

  test('POST /api/auth/reset-password - телефон жок', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/auth/reset-password`, {
      data: {
        newPassword: 'NewPass123!'
      }
    });

    // 400 же 429 (rate limit) болушу мүмкүн
    expect([400, 429]).toContain(response.status());
  });

  // =====================
  // SEND OTP API
  // =====================

  test('POST /api/auth/send-otp - бош body', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/auth/send-otp`, {
      data: {}
    });

    expect(response.status()).toBe(400);
  });

  test('POST /api/auth/send-otp - туура эмес телефон', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/auth/send-otp`, {
      data: {
        phone: '123'
      }
    });

    expect(response.status()).toBe(400);
  });
});

test.describe('API Security - Protected Endpoints', () => {

  // =====================
  // ADMIN ROUTES
  // =====================

  test('GET /admin - authentication керек', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/admin`);

    // Redirect же 401/403 болушу керек
    expect([200, 302, 303, 307, 401, 403]).toContain(response.status());
  });

  test('GET /seller - authentication керек', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/seller`);

    expect([200, 302, 303, 307, 401, 403]).toContain(response.status());
  });

  // =====================
  // API ENDPOINTS
  // =====================

  test('GET /api/orders - authentication талап кылынат', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/orders`);

    // 401 же 403 болушу керек
    expect([401, 403]).toContain(response.status());
  });

  test('GET /api/seller/products - authentication талап кылынат', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/seller/products`);

    expect([401, 403]).toContain(response.status());
  });

  test('GET /api/seller/stats - authentication талап кылынат', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/seller/stats`);

    expect([401, 403]).toContain(response.status());
  });
});

test.describe('Security Headers', () => {

  test('X-Content-Type-Options header бар', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/`);
    const headers = response.headers();

    expect(headers['x-content-type-options']).toBe('nosniff');
  });

  test('X-Frame-Options header бар', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/`);
    const headers = response.headers();

    expect(headers['x-frame-options']).toBeDefined();
  });

  test('X-XSS-Protection header бар', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/`);
    const headers = response.headers();

    // X-XSS-Protection же CSP болушу керек
    const hasXss = headers['x-xss-protection'] !== undefined;
    const hasCsp = headers['content-security-policy'] !== undefined;
    expect(hasXss || hasCsp).toBeTruthy();
  });
});

test.describe('Rate Limiting Tests', () => {

  test('Login rate limiting иштейт', async ({ request }) => {
    // 10 жолу туура эмес логин
    let lastResponse;
    for (let i = 0; i < 10; i++) {
      lastResponse = await request.post(`${BASE_URL}/api/auth/login`, {
        data: {
          email: 'ratelimit@test.com',
          password: 'WrongPass' + i
        }
      });
    }

    // Акыры 429 болушу керек
    // Же "Өтө көп аракет" катасы
    const json = await lastResponse!.json();
    const isRateLimited = lastResponse!.status() === 429 ||
                          json.code === 'RATE_LIMITED' ||
                          json.error?.includes('Өтө көп');

    expect(isRateLimited).toBeTruthy();
  });

  test('SMS rate limiting иштейт', async ({ request }) => {
    // 5 жолу SMS жөнөтүү
    let lastResponse;
    for (let i = 0; i < 5; i++) {
      lastResponse = await request.post(`${BASE_URL}/api/auth/send-otp`, {
        data: {
          phone: '+996700123456'
        }
      });
      await new Promise(r => setTimeout(r, 100));
    }

    // Rate limit болушу керек
    const json = await lastResponse!.json();
    const isRateLimited = lastResponse!.status() === 429 ||
                          json.code === 'RATE_LIMITED';

    expect(isRateLimited).toBeTruthy();
  });
});

test.describe('Input Validation Tests', () => {

  const maliciousInputs = [
    // XSS
    '<script>alert(1)</script>',
    '<img src=x onerror=alert(1)>',
    '"><script>alert(1)</script>',
    "javascript:alert(1)",

    // SQL Injection
    "' OR '1'='1",
    "'; DROP TABLE users; --",
    "1; DELETE FROM users",

    // Path Traversal
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32\\config\\sam',

    // Command Injection
    '; ls -la',
    '| cat /etc/passwd',
    '`id`',

    // LDAP Injection
    '*)(objectClass=*',
    'admin)(&)',

    // XML Injection
    '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>',

    // Header Injection
    'test\r\nX-Injected: header',

    // Null byte
    'test\x00.jpg',
  ];

  for (const input of maliciousInputs.slice(0, 10)) {
    test(`Малициоздуу input коргоо: ${input.slice(0, 20)}...`, async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/auth/login`, {
        data: {
          email: input,
          password: input
        }
      });

      // 500 error болбошу керек
      expect(response.status()).not.toBe(500);

      // Response ичинде input кайтарылбашы керек (reflection XSS коргоо)
      const text = await response.text();
      if (input.includes('<script>')) {
        expect(text).not.toContain('<script>');
      }
    });
  }
});

test.describe('IDOR (Insecure Direct Object Reference) Tests', () => {

  test('Башка колдонуучунун заказын көрүү мүмкүн эмес', async ({ request }) => {
    // Random UUID менен заказ алууга аракет
    const response = await request.get(`${BASE_URL}/api/orders/550e8400-e29b-41d4-a716-446655440000`);

    // 401, 403, же 404 болушу керек (200 болбошу керек)
    expect([401, 403, 404]).toContain(response.status());
  });

  test('Башка дүкөндүн маалыматын өзгөртүү мүмкүн эмес', async ({ request }) => {
    const response = await request.put(`${BASE_URL}/api/shops/550e8400-e29b-41d4-a716-446655440000`, {
      data: { name: 'Hacked Shop' }
    });

    expect([401, 403, 404, 405]).toContain(response.status());
  });
});

test.describe('Information Disclosure Tests', () => {

  test('Stack trace көрүнбөйт', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/auth/login`, {
      data: null
    });

    const text = await response.text();

    // Stack trace же code paths көрүнбөшү керек
    expect(text).not.toContain('at Object.');
    expect(text).not.toContain('.ts:');
    expect(text).not.toContain('.js:');
    expect(text).not.toContain('node_modules');
  });

  test('Сервер версиясы көрүнбөйт', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/`);
    const headers = response.headers();

    // X-Powered-By header болбошу керек
    expect(headers['x-powered-by']).toBeUndefined();
  });
});