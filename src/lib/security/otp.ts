/**
 * OTP (One-Time Password) - SMS верификация системасы
 *
 * Колдонуу:
 * - Телефон номерин тастыктоо
 * - Эки факторлуу аутентификация
 * - Сырсөздү калыбына келтирүү
 */

import crypto from 'crypto';

// OTP сактагыч (production'до Redis колдонуу)
const otpStore = new Map<string, {
  code: string;
  expiresAt: number;
  attempts: number;
  verified: boolean;
}>();

interface OTPConfig {
  length: number;
  expiresInMinutes: number;
  maxAttempts: number;
}

const DEFAULT_CONFIG: OTPConfig = {
  length: 6,
  expiresInMinutes: 5,
  maxAttempts: 3
};

/**
 * Коопсуз OTP код түзүү
 */
export function generateOTP(length: number = 6): string {
  // crypto.randomInt колдонуу (коопсуз random)
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += crypto.randomInt(0, 10).toString();
  }
  return otp;
}

/**
 * OTP түзүү жана сактоо
 */
export function createOTP(
  identifier: string, // телефон же email
  config: Partial<OTPConfig> = {}
): { code: string; expiresAt: number } {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  const code = generateOTP(cfg.length);
  const expiresAt = Date.now() + cfg.expiresInMinutes * 60 * 1000;

  otpStore.set(identifier, {
    code,
    expiresAt,
    attempts: 0,
    verified: false
  });

  return { code, expiresAt };
}

/**
 * OTP текшерүү
 */
export interface OTPVerifyResult {
  success: boolean;
  error?: string;
  attemptsRemaining?: number;
}

export function verifyOTP(
  identifier: string,
  inputCode: string,
  maxAttempts: number = 3
): OTPVerifyResult {
  const entry = otpStore.get(identifier);

  if (!entry) {
    return {
      success: false,
      error: 'Код табылган жок. Жаңы код суратыңыз.'
    };
  }

  // Мөөнөт өтүп кеттиби?
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(identifier);
    return {
      success: false,
      error: 'Коддун мөөнөтү өттү. Жаңы код суратыңыз.'
    };
  }

  // Аракеттер чектен ашты
  if (entry.attempts >= maxAttempts) {
    otpStore.delete(identifier);
    return {
      success: false,
      error: 'Өтө көп туура эмес аракет. Жаңы код суратыңыз.'
    };
  }

  // Код туурабы?
  if (entry.code !== inputCode) {
    entry.attempts++;
    otpStore.set(identifier, entry);
    return {
      success: false,
      error: 'Туура эмес код',
      attemptsRemaining: maxAttempts - entry.attempts
    };
  }

  // Ийгиликтүү!
  entry.verified = true;
  otpStore.set(identifier, entry);

  return { success: true };
}

/**
 * OTP тастыкталганын текшерүү
 */
export function isOTPVerified(identifier: string): boolean {
  const entry = otpStore.get(identifier);
  return entry?.verified === true && Date.now() <= entry.expiresAt;
}

/**
 * OTP тазалоо
 */
export function clearOTP(identifier: string): void {
  otpStore.delete(identifier);
}

/**
 * OTP калган убакытын алуу
 */
export function getOTPTimeRemaining(identifier: string): number | null {
  const entry = otpStore.get(identifier);
  if (!entry) return null;

  const remaining = entry.expiresAt - Date.now();
  return remaining > 0 ? Math.ceil(remaining / 1000) : null;
}

/**
 * SMS жөнөтүү - SMSPRO.kg интеграциясы
 *
 * .env.local файлына кошуңуз:
 * SMSPRO_API_KEY=сиздин_api_ачкыч
 * SMSPRO_SENDER=Arashan
 */
export async function sendSMS(phone: string, message: string): Promise<boolean> {
  // Демо режимде консолго жазуу
  if (process.env.NODE_ENV === 'development' && !process.env.SMSPRO_API_KEY) {
    console.log('═'.repeat(50));
    console.log(`📱 SMS DEMO MODE`);
    console.log(`📞 Телефон: ${phone}`);
    console.log(`💬 Билдирүү: ${message}`);
    console.log('═'.repeat(50));
    return true;
  }

  // SMSPRO.kg API
  const apiKey = process.env.SMSPRO_API_KEY;
  const sender = process.env.SMSPRO_SENDER || 'Arashan';

  if (!apiKey) {
    console.error('SMSPRO_API_KEY .env файлында жок!');
    // Development'те demo режимде иштейт
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEMO SMS] ${phone}: ${message}`);
      return true;
    }
    return false;
  }

  try {
    // Телефон форматын тазалоо (+996 болушу керек)
    const cleanPhone = phone.replace(/[^0-9+]/g, '');

    const response = await fetch('https://api.smspro.kg/v2/sms/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [{
          recipient: cleanPhone,
          message_id: `arashan_${Date.now()}`,
          text: message,
          originator: sender
        }]
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log(`[SMSPRO] SMS жөнөтүлдү: ${cleanPhone}`);
      return true;
    } else {
      console.error('[SMSPRO] Ката:', data);
      return false;
    }
  } catch (error) {
    console.error('SMS жөнөтүү катасы:', error);
    return false;
  }
}

/**
 * Верификация коду бар SMS жөнөтүү
 */
export async function sendOTPSMS(phone: string): Promise<{
  success: boolean;
  expiresAt?: number;
  error?: string;
}> {
  const { code, expiresAt } = createOTP(phone);

  const message = `Сиздин Arashan коду: ${code}. 5 мүнөт жарактуу.`;

  const sent = await sendSMS(phone, message);

  if (!sent) {
    clearOTP(phone);
    return {
      success: false,
      error: 'SMS жөнөтүүдө ката'
    };
  }

  return {
    success: true,
    expiresAt
  };
}

// Эски OTP'лерди тазалоо (ар бир мүнөт)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of otpStore.entries()) {
      // Мөөнөтү өткөндөрдү өчүрүү
      if (now > entry.expiresAt + 5 * 60 * 1000) {
        otpStore.delete(key);
      }
    }
  }, 60 * 1000);
}