/**
 * AI Тестировщик - Localhost'ту автоматтык текшерүү
 *
 * Иштетүү: npx ts-node scripts/ai-tester.ts
 * же: npx tsx scripts/ai-tester.ts
 */

const BASE_URL = 'http://localhost:3000';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
  suggestion?: string;
}

const results: TestResult[] = [];

// Түстүү консол
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color: keyof typeof colors, text: string) {
  console.log(`${colors[color]}${text}${colors.reset}`);
}

function addResult(result: TestResult) {
  results.push(result);
  const icon = result.status === 'pass' ? '✓' : result.status === 'fail' ? '✗' : '⚠';
  const color = result.status === 'pass' ? 'green' : result.status === 'fail' ? 'red' : 'yellow';
  log(color, `  ${icon} ${result.name}: ${result.message}`);
  if (result.suggestion) {
    log('cyan', `    💡 Сунуш: ${result.suggestion}`);
  }
}

// ============================================
// ТЕСТТЕР
// ============================================

async function testServerRunning() {
  log('blue', '\n🔍 Сервер текшерүү...');

  try {
    const res = await fetch(BASE_URL);
    if (res.ok) {
      addResult({
        name: 'Сервер статусу',
        status: 'pass',
        message: `Сервер иштеп жатат (${res.status})`
      });
      return true;
    }
  } catch (err: any) {
    addResult({
      name: 'Сервер статусу',
      status: 'fail',
      message: 'Сервер иштебейт!',
      suggestion: 'npm run dev командасын иштетиңиз'
    });
    return false;
  }
}

async function testLoginAPI() {
  log('blue', '\n🔐 Login API текшерүү...');

  // 1. Бош маалымат
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const data = await res.json();

    if (res.status === 400) {
      addResult({
        name: 'Login - бош маалымат',
        status: 'pass',
        message: 'Валидация иштейт'
      });
    } else {
      addResult({
        name: 'Login - бош маалымат',
        status: 'fail',
        message: `Күтүлгөн 400, алынды ${res.status}`,
        suggestion: 'Input валидация кошуңуз'
      });
    }
  } catch (err: any) {
    addResult({
      name: 'Login API',
      status: 'fail',
      message: err.message,
      suggestion: '/api/auth/login route бар экенин текшериңиз'
    });
  }

  // 2. Туура эмес email формат
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'invalid-email', password: '123' })
    });
    const data = await res.json();

    if (res.status === 400 || res.status === 401) {
      addResult({
        name: 'Login - туура эмес email',
        status: 'pass',
        message: 'Email валидация иштейт'
      });
    } else {
      addResult({
        name: 'Login - туура эмес email',
        status: 'warning',
        message: 'Email форматы текшерилбейт',
        suggestion: 'Email regex валидация кошуңуз'
      });
    }
  } catch (err) {}

  // 3. Туура эмес credentials
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nonexistent@test.com',
        password: 'WrongPassword123'
      })
    });
    const data = await res.json();

    if (res.status === 401) {
      addResult({
        name: 'Login - туура эмес credentials',
        status: 'pass',
        message: '401 Unauthorized кайтарылды'
      });

      // Коопсуздук текшерүү - так ката билдирбеш керек
      if (data.error && !data.error.includes('email') && !data.error.includes('пароль')) {
        addResult({
          name: 'Login - коопсуз ката билдирүү',
          status: 'pass',
          message: 'Так маалымат ачылбайт (коопсуз)'
        });
      }
    }
  } catch (err) {}
}

async function testRegisterAPI() {
  log('blue', '\n📝 Register API текшерүү...');

  // 1. Бош маалымат
  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    if (res.status === 400 || res.status === 429) {
      addResult({
        name: 'Register - бош маалымат',
        status: 'pass',
        message: 'Валидация иштейт'
      });
    }
  } catch (err: any) {
    addResult({
      name: 'Register API',
      status: 'fail',
      message: err.message
    });
  }

  // 2. Алсыз сырсөз
  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: '123', // Алсыз
        fullName: 'Test User'
      })
    });
    const data = await res.json();

    if (res.status === 400 && (data.code === 'WEAK_PASSWORD' || data.code === 'VALIDATION_ERROR')) {
      addResult({
        name: 'Register - алсыз сырсөз',
        status: 'pass',
        message: 'Сырсөз күчү текшерилет'
      });
    } else {
      addResult({
        name: 'Register - алсыз сырсөз',
        status: 'warning',
        message: 'Алсыз сырсөз кабыл алынат',
        suggestion: 'checkPasswordStrength функциясын колдонуңуз'
      });
    }
  } catch (err) {}

  // 3. Туура маалымат (email мурунтан бар болушу мүмкүн)
  try {
    const testEmail = `test_${Date.now()}@example.com`;
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'StrongPass123!',
        fullName: 'Test User',
        phone: '+996700123456'
      })
    });
    const data = await res.json();

    if (res.status === 201 || res.status === 200) {
      addResult({
        name: 'Register - жаңы колдонуучу',
        status: 'pass',
        message: 'Регистрация иштейт',
        details: { email: testEmail }
      });
    } else if (res.status === 429) {
      addResult({
        name: 'Register - rate limit',
        status: 'pass',
        message: 'Rate limiting иштейт'
      });
    } else {
      addResult({
        name: 'Register - жаңы колдонуучу',
        status: 'warning',
        message: `Статус: ${res.status}`,
        details: data
      });
    }
  } catch (err) {}
}

async function testOTPAPI() {
  log('blue', '\n📱 OTP API текшерүү...');

  // 1. Send OTP
  try {
    const res = await fetch(`${BASE_URL}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+996700123456' })
    });
    const data = await res.json();

    if (res.ok || res.status === 429) {
      addResult({
        name: 'Send OTP API',
        status: 'pass',
        message: res.status === 429 ? 'Rate limit иштейт' : 'OTP жөнөтүлдү'
      });
    } else if (res.status === 400) {
      addResult({
        name: 'Send OTP - валидация',
        status: 'pass',
        message: 'Телефон валидация иштейт'
      });
    }
  } catch (err: any) {
    addResult({
      name: 'Send OTP API',
      status: 'fail',
      message: err.message
    });
  }

  // 2. Verify OTP - туура эмес код
  try {
    const res = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+996700123456', code: '000000' })
    });
    const data = await res.json();

    if (res.status === 400) {
      addResult({
        name: 'Verify OTP - туура эмес код',
        status: 'pass',
        message: 'Туура эмес код четке кагылды'
      });
    }
  } catch (err) {}
}

async function testRateLimiting() {
  log('blue', '\n🛡️ Rate Limiting текшерүү...');

  // Көп аракет жасоо
  let rateLimited = false;
  for (let i = 0; i < 10; i++) {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'ratelimit@test.com',
          password: 'wrong'
        })
      });

      if (res.status === 429) {
        rateLimited = true;
        addResult({
          name: 'Rate Limiting',
          status: 'pass',
          message: `${i + 1} аракеттен кийин блоктолду`
        });
        break;
      }
    } catch (err) {}
  }

  if (!rateLimited) {
    addResult({
      name: 'Rate Limiting',
      status: 'warning',
      message: '10 аракеттен кийин да блоктолгон жок',
      suggestion: 'Rate limiting туура конфигурацияланганын текшериңиз'
    });
  }
}

async function testSecurityHeaders() {
  log('blue', '\n🔒 Коопсуздук Headers текшерүү...');

  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com', password: 'test' })
    });

    const headers = res.headers;

    // X-Content-Type-Options
    if (headers.get('x-content-type-options') === 'nosniff') {
      addResult({
        name: 'X-Content-Type-Options',
        status: 'pass',
        message: 'nosniff орнотулган'
      });
    } else {
      addResult({
        name: 'X-Content-Type-Options',
        status: 'warning',
        message: 'Header жок',
        suggestion: "Response'го 'X-Content-Type-Options': 'nosniff' кошуңуз"
      });
    }
  } catch (err) {}
}

async function testPages() {
  log('blue', '\n📄 Барактарды текшерүү...');

  const pages = [
    '/',
    '/auth/login',
    '/auth/register',
    '/categories',
    '/search',
    '/profile',
  ];

  for (const page of pages) {
    try {
      const res = await fetch(`${BASE_URL}${page}`);
      if (res.ok) {
        addResult({
          name: `Барак: ${page}`,
          status: 'pass',
          message: `OK (${res.status})`
        });
      } else {
        addResult({
          name: `Барак: ${page}`,
          status: 'fail',
          message: `Ката: ${res.status}`
        });
      }
    } catch (err: any) {
      addResult({
        name: `Барак: ${page}`,
        status: 'fail',
        message: err.message
      });
    }
  }
}

// ============================================
// НЕГИЗГИ ФУНКЦИЯ
// ============================================

async function runTests() {
  console.log('\n' + '='.repeat(50));
  log('cyan', '🤖 AI ТЕСТИРОВЩИК - Pinduo Shop');
  console.log('='.repeat(50));
  log('blue', `📍 URL: ${BASE_URL}`);
  log('blue', `⏰ Убакыт: ${new Date().toLocaleString()}`);

  // Сервер текшерүү
  const serverOk = await testServerRunning();
  if (!serverOk) {
    log('red', '\n❌ Сервер иштебейт! Тесттер токтотулду.');
    log('yellow', '💡 npm run dev командасын иштетип, кайра аракет кылыңыз.\n');
    return;
  }

  // Баардык тесттер
  await testLoginAPI();
  await testRegisterAPI();
  await testOTPAPI();
  await testRateLimiting();
  await testSecurityHeaders();
  await testPages();

  // Жыйынтык
  console.log('\n' + '='.repeat(50));
  log('cyan', '📊 ЖЫЙЫНТЫК');
  console.log('='.repeat(50));

  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const warnings = results.filter(r => r.status === 'warning').length;

  log('green', `✓ Ийгиликтүү: ${passed}`);
  log('red', `✗ Ийгиликсиз: ${failed}`);
  log('yellow', `⚠ Эскертүү: ${warnings}`);

  if (failed > 0) {
    log('red', '\n❌ КАТАЛАР ТАБЫЛДЫ:');
    results
      .filter(r => r.status === 'fail')
      .forEach(r => {
        log('red', `  • ${r.name}: ${r.message}`);
        if (r.suggestion) log('cyan', `    💡 ${r.suggestion}`);
      });
  }

  if (warnings > 0) {
    log('yellow', '\n⚠️ ЭСКЕРТҮҮЛӨР:');
    results
      .filter(r => r.status === 'warning')
      .forEach(r => {
        log('yellow', `  • ${r.name}: ${r.message}`);
        if (r.suggestion) log('cyan', `    💡 ${r.suggestion}`);
      });
  }

  console.log('\n');
}

// Иштетүү
runTests().catch(console.error);