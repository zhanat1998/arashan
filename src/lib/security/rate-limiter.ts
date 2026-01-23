/**
 * Rate Limiter - Brute force чабуулдарынан коргоо
 *
 * Колдонуу:
 * - Логин аракеттерин чектөө
 * - API чакырууларын чектөө
 * - SMS жөнөтүүлөрүн чектөө
 */

interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  blockedUntil: number | null;
}

// In-memory store (production'до Redis колдонуу керек)
const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitConfig {
  maxAttempts: number;      // Максималдуу аракет саны
  windowMs: number;         // Убакыт терезеси (ms)
  blockDurationMs: number;  // Блоктоо узактыгы (ms)
}

// Демейки конфигурациялар
export const RATE_LIMIT_CONFIGS = {
  login: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000,      // 15 мүнөт
    blockDurationMs: 30 * 60 * 1000 // 30 мүнөт блок
  },
  register: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000,      // 1 саат
    blockDurationMs: 60 * 60 * 1000 // 1 саат блок
  },
  sms: {
    maxAttempts: 3,
    windowMs: 10 * 60 * 1000,      // 10 мүнөт
    blockDurationMs: 60 * 60 * 1000 // 1 саат блок
  },
  passwordReset: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000,      // 1 саат
    blockDurationMs: 2 * 60 * 60 * 1000 // 2 саат блок
  },
  api: {
    maxAttempts: 100,
    windowMs: 60 * 1000,           // 1 мүнөт
    blockDurationMs: 5 * 60 * 1000 // 5 мүнөт блок
  }
};

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  blockedUntil: number | null;
  retryAfterSeconds: number | null;
}

/**
 * Rate limit текшерүү
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // Эгер блоктолгон болсо
  if (entry?.blockedUntil && entry.blockedUntil > now) {
    const retryAfterSeconds = Math.ceil((entry.blockedUntil - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.blockedUntil,
      blockedUntil: entry.blockedUntil,
      retryAfterSeconds
    };
  }

  // Эски жазууну тазалоо
  if (entry && (now - entry.firstAttempt > config.windowMs)) {
    rateLimitStore.delete(key);
  }

  const currentEntry = rateLimitStore.get(key);

  if (!currentEntry) {
    // Биринчи аракет
    rateLimitStore.set(key, {
      count: 1,
      firstAttempt: now,
      blockedUntil: null
    });
    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
      resetAt: now + config.windowMs,
      blockedUntil: null,
      retryAfterSeconds: null
    };
  }

  // Аракетти көбөйтүү
  currentEntry.count++;

  if (currentEntry.count > config.maxAttempts) {
    // Блоктоо
    currentEntry.blockedUntil = now + config.blockDurationMs;
    rateLimitStore.set(key, currentEntry);

    const retryAfterSeconds = Math.ceil(config.blockDurationMs / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetAt: currentEntry.blockedUntil,
      blockedUntil: currentEntry.blockedUntil,
      retryAfterSeconds
    };
  }

  rateLimitStore.set(key, currentEntry);
  return {
    allowed: true,
    remaining: config.maxAttempts - currentEntry.count,
    resetAt: currentEntry.firstAttempt + config.windowMs,
    blockedUntil: null,
    retryAfterSeconds: null
  };
}

/**
 * Ийгиликтүү аракеттен кийин тазалоо
 */
export function clearRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * IP жана колдонуучу үчүн ачкыч түзүү
 */
export function createRateLimitKey(
  type: string,
  identifier: string,
  ip?: string
): string {
  const parts = [type, identifier];
  if (ip) {
    parts.push(ip);
  }
  return parts.join(':');
}

/**
 * Request'тен IP алуу
 */
export function getClientIP(request: Request): string {
  // Cloudflare
  const cfIP = request.headers.get('cf-connecting-ip');
  if (cfIP) return cfIP;

  // X-Forwarded-For (proxy артында)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  // X-Real-IP
  const realIP = request.headers.get('x-real-ip');
  if (realIP) return realIP;

  return 'unknown';
}

// Эски жазууларды тазалоо (ар бир 5 мүнөт)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      // 2 сааттан эски жазууларды өчүрүү
      if (now - entry.firstAttempt > 2 * 60 * 60 * 1000) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}