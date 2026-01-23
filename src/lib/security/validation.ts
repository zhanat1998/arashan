/**
 * Input Validation - XSS жана SQL Injection коргоо
 *
 * Бардык колдонуучу киргизүүлөрүн текшерүү жана тазалоо
 */

// Email валидация
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

// Телефон валидация (Кыргызстан)
export function isValidPhone(phone: string): boolean {
  // +996 XXX XXXXXX же 0XXX XXXXXX форматтары
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  const phoneRegex = /^(\+996|996|0)?[0-9]{9}$/;
  return phoneRegex.test(cleanPhone);
}

// Телефонду стандарттуу форматка келтирүү
export function normalizePhone(phone: string): string {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

  if (cleanPhone.startsWith('+996')) {
    return cleanPhone;
  }
  if (cleanPhone.startsWith('996')) {
    return '+' + cleanPhone;
  }
  if (cleanPhone.startsWith('0')) {
    return '+996' + cleanPhone.slice(1);
  }
  return '+996' + cleanPhone;
}

// Сырсөз күчүн текшерүү
export interface PasswordStrength {
  isValid: boolean;
  score: number; // 0-5
  errors: string[];
  suggestions: string[];
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const errors: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  // Минималдуу узундук
  if (password.length < 8) {
    errors.push('Сырсөз 8 символдон кем болбосун');
  } else {
    score++;
    if (password.length >= 12) score++;
  }

  // Чоң тамга
  if (!/[A-Z]/.test(password)) {
    errors.push('Чоң тамга кошуңуз (A-Z)');
  } else {
    score++;
  }

  // Кичине тамга
  if (!/[a-z]/.test(password)) {
    errors.push('Кичине тамга кошуңуз (a-z)');
  } else {
    score++;
  }

  // Сан
  if (!/[0-9]/.test(password)) {
    errors.push('Сан кошуңуз (0-9)');
  } else {
    score++;
  }

  // Атайын символ
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    suggestions.push('Атайын символ кошсоңуз коопсуздук жогорулайт (!@#$%...)');
  } else {
    score++;
  }

  // Жөнөкөй сырсөздөрдү текшерүү
  const commonPasswords = [
    'password', '123456', '12345678', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey',
    '1234567890', 'password1', 'qwerty123', 'iloveyou'
  ];

  if (commonPasswords.some(p => password.toLowerCase().includes(p))) {
    errors.push('Бул сырсөз өтө жөнөкөй');
    score = Math.max(0, score - 2);
  }

  // Кайталануучу символдор
  if (/(.)\1{2,}/.test(password)) {
    suggestions.push('Кайталануучу символдорду азайтыңыз');
  }

  return {
    isValid: errors.length === 0 && password.length >= 8,
    score: Math.min(5, score),
    errors,
    suggestions
  };
}

// XSS коргоо - HTML escape
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };
  return text.replace(/[&<>"'`=\/]/g, (s) => map[s]);
}

// SQL injection коргоо - атайын символдорду тазалоо
export function sanitizeInput(input: string): string {
  // NULL bytes жана башка коркунучтуу символдорду алып салуу
  return input
    .replace(/\0/g, '')           // NULL byte
    .replace(/\x08/g, '')         // Backspace
    .replace(/\x09/g, ' ')        // Tab → space
    .replace(/\x1a/g, '')         // Ctrl+Z
    .replace(/[\x00-\x1F\x7F]/g, '') // Control characters
    .trim();
}

// Аты-жөнү валидация
export function isValidName(name: string): boolean {
  // 2-50 символ, тамгалар, боштук, дефис
  const nameRegex = /^[a-zA-Zа-яА-ЯёЁүҮөӨңҢ\s\-]{2,50}$/;
  return nameRegex.test(name.trim());
}

// OTP код валидация
export function isValidOTP(otp: string): boolean {
  return /^\d{6}$/.test(otp);
}

// UUID валидация
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// URL валидация
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Сумма валидация
export function isValidAmount(amount: number): boolean {
  return !isNaN(amount) && amount > 0 && amount <= 1000000 && Number.isFinite(amount);
}

// Login input валидация
export interface LoginInput {
  email?: string;
  phone?: string;
  password: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  sanitized: Record<string, string>;
}

export function validateLoginInput(input: LoginInput): ValidationResult {
  const errors: Record<string, string> = {};
  const sanitized: Record<string, string> = {};

  // Email же телефон керек
  if (input.email) {
    const cleanEmail = sanitizeInput(input.email.toLowerCase());
    if (!isValidEmail(cleanEmail)) {
      errors.email = 'Туура эмес email форматы';
    }
    sanitized.email = cleanEmail;
  } else if (input.phone) {
    const cleanPhone = sanitizeInput(input.phone);
    if (!isValidPhone(cleanPhone)) {
      errors.phone = 'Туура эмес телефон номери';
    }
    sanitized.phone = normalizePhone(cleanPhone);
  } else {
    errors.identifier = 'Email же телефон керек';
  }

  // Сырсөз
  if (!input.password || input.password.length < 1) {
    errors.password = 'Сырсөз керек';
  }
  sanitized.password = input.password; // Сырсөздү escape кылбайбыз

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized
  };
}

// Register input валидация
export interface RegisterInput {
  email: string;
  phone?: string;
  password: string;
  fullName?: string;
}

export function validateRegisterInput(input: RegisterInput): ValidationResult {
  const errors: Record<string, string> = {};
  const sanitized: Record<string, string> = {};

  // Email
  const cleanEmail = sanitizeInput(input.email?.toLowerCase() || '');
  if (!cleanEmail) {
    errors.email = 'Email керек';
  } else if (!isValidEmail(cleanEmail)) {
    errors.email = 'Туура эмес email форматы';
  }
  sanitized.email = cleanEmail;

  // Телефон (милдеттүү эмес)
  if (input.phone) {
    const cleanPhone = sanitizeInput(input.phone);
    if (!isValidPhone(cleanPhone)) {
      errors.phone = 'Туура эмес телефон номери';
    }
    sanitized.phone = normalizePhone(cleanPhone);
  }

  // Сырсөз
  const passwordCheck = checkPasswordStrength(input.password || '');
  if (!passwordCheck.isValid) {
    errors.password = passwordCheck.errors[0] || 'Сырсөз талаптарга туура келбейт';
  }
  sanitized.password = input.password;

  // Аты-жөнү
  if (input.fullName) {
    const cleanName = sanitizeInput(input.fullName);
    if (!isValidName(cleanName)) {
      errors.fullName = 'Аты-жөнү туура эмес форматта';
    }
    sanitized.fullName = escapeHtml(cleanName);
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized
  };
}