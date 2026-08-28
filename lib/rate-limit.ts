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

// Traffic Spike Detector – tracks high-frequency requests per IP
// Separate map: key = ip, value = { timestamps[] }
const trafficLog = new Map<string, number[]>();

// Throttle security alerts per IP to avoid notification spam
// key = ip, value = last alert timestamp
const alertThrottle = new Map<string, number>();

const SPIKE_WINDOW_MS = 10_000;    // 10 seconds sliding window
const SPIKE_THRESHOLD = 10;        // > 10 requests/10s  ⇒ alert
const ALERT_COOLDOWN_MS = 600_000; // 10 minutes between alerts for same IP

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

/**
 * Detect traffic spikes and fire a security alert if threshold is exceeded.
 * Runs entirely asynchronously (never blocks the request path).
 */
async function detectTrafficSpike(ip: string, endpoint?: string): Promise<void> {
  const now = Date.now();

  // Maintain sliding window of timestamps per IP
  const timestamps = (trafficLog.get(ip) || []).filter(t => now - t < SPIKE_WINDOW_MS);
  timestamps.push(now);
  trafficLog.set(ip, timestamps);

  if (timestamps.length < SPIKE_THRESHOLD) return;

  // Check alert throttle – fire at most once per ALERT_COOLDOWN_MS per IP
  const lastAlert = alertThrottle.get(ip) || 0;
  if (now - lastAlert < ALERT_COOLDOWN_MS) return;

  alertThrottle.set(ip, now);

  // Fire-and-forget: import lazily to avoid circular deps at module load time
  try {
    const { sendSecurityNotification } = await import('@/lib/notifications');
    await sendSecurityNotification({
      ip,
      action: 'traffic_spike',
      requestCount: timestamps.length,
      timeWindow: `${SPIKE_WINDOW_MS / 1000} ثانية`,
      endpoint,
      details: `رصد ${timestamps.length} طلب في ${SPIKE_WINDOW_MS / 1000} ثانية — يُرجَّح هجوم DDoS أو بوت مؤتمَت`,
      detectedAt: new Date(),
    });
  } catch (err) {
    console.error('[TrafficSpike] Error sending security notification:', err);
  }
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

  // Fire spike detector asynchronously (non-blocking)
  detectTrafficSpike(ip).catch(console.error);

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
