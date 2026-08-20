import { db } from '@/db';
import { securityLogs } from '@/db/schema';
import { eq, and, gte, count } from 'drizzle-orm';
import { headers } from 'next/headers';

// In-memory cache for fast rate limiting check before hitting DB
interface RateRecord {
  count: number;
  resetAt: number;
}
const memoryRateMap = new Map<string, RateRecord>();

export interface RateLimitOptions {
  action: 'register' | 'login' | 'order' | 'reset_password' | 'api';
  maxRequests: number;
  windowMs: number; // in milliseconds
  customIdentifier?: string;
  errorMessage?: string;
}

export async function getClientIp(): Promise<string> {
  try {
    const headersList = await headers();
    const forwarded = headersList.get('x-forwarded-for');
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    const realIp = headersList.get('x-real-ip') || headersList.get('cf-connecting-ip');
    if (realIp) {
      return realIp.trim();
    }
  } catch (e) {
    // fallback if headers() not available in current scope
  }
  return '127.0.0.1';
}

export async function checkRateLimit(options: RateLimitOptions): Promise<{
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
  error?: string;
}> {
  const ip = await getClientIp();
  const now = Date.now();
  const key = `${options.action}:${ip}`;

  // 1. Fast in-memory check
  const record = memoryRateMap.get(key);
  if (record && record.resetAt > now) {
    if (record.count >= options.maxRequests) {
      const resetSeconds = Math.ceil((record.resetAt - now) / 1000);
      
      // Log blocked attempt to DB asynchronously
      logSecurityAttempt({
        ip,
        action: options.action,
        status: 'throttled',
        identifier: options.customIdentifier,
        details: { count: record.count, max: options.maxRequests, resetSeconds },
      }).catch(console.error);

      const defaultMsg = `تم تجاوز الحد المسموح به للعمليات (${options.maxRequests} محاولات). يرجى الانتظار لمدة ${Math.ceil(resetSeconds / 60)} دقيقة قبل إعادة المحاولة.`;
      return {
        allowed: false,
        remaining: 0,
        resetSeconds,
        error: options.errorMessage || defaultMsg,
      };
    }
    record.count += 1;
  } else {
    memoryRateMap.set(key, {
      count: 1,
      resetAt: now + options.windowMs,
    });
  }

  // 2. Database verification check for persistent multi-instance safety
  const windowStart = new Date(now - options.windowMs);
  try {
    const dbCountRes = await db
      .select({ value: count() })
      .from(securityLogs)
      .where(
        and(
          eq(securityLogs.ip, ip),
          eq(securityLogs.action, options.action),
          gte(securityLogs.createdAt, windowStart)
        )
      );

    const pastAttempts = Number(dbCountRes[0]?.value || 0);
    if (pastAttempts >= options.maxRequests) {
      const resetSeconds = Math.ceil(options.windowMs / 1000);
      const defaultMsg = `تم تجاوز الحد المسموح به للعمليات. يرجى الانتظار لمدة ${Math.ceil(resetSeconds / 60)} دقيقة قبل إعادة المحاولة.`;
      return {
        allowed: false,
        remaining: 0,
        resetSeconds,
        error: options.errorMessage || defaultMsg,
      };
    }
  } catch (err) {
    // If DB check fails, continue with in-memory result
  }

  // Log allowed attempt
  logSecurityAttempt({
    ip,
    action: options.action,
    status: 'allowed',
    identifier: options.customIdentifier,
  }).catch(console.error);

  const currentCount = memoryRateMap.get(key)?.count || 1;
  return {
    allowed: true,
    remaining: Math.max(0, options.maxRequests - currentCount),
    resetSeconds: Math.ceil(options.windowMs / 1000),
  };
}

async function logSecurityAttempt(params: {
  ip: string;
  action: string;
  status: 'allowed' | 'throttled' | 'blocked';
  identifier?: string;
  details?: Record<string, any>;
}) {
  try {
    let userAgent = '';
    try {
      const headersList = await headers();
      userAgent = headersList.get('user-agent') || '';
    } catch {}

    await db.insert(securityLogs).values({
      ip: params.ip,
      action: params.action,
      identifier: params.identifier || null,
      userAgent: userAgent || null,
      status: params.status,
      details: params.details || null,
    });
  } catch (err) {
    console.error('Failed to log security attempt:', err);
  }
}
