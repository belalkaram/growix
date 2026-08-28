import webpush from 'web-push';
import { db } from '@/db';
import { pushSubscriptions, users, siteSettings } from '@/db/schema';
import { eq, and, or, inArray } from 'drizzle-orm';
import { decryptSensitiveData } from '@/lib/encryption';

export interface WebPushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  url?: string;
  eventId?: string;
  type?: 'order' | 'order_status' | 'login' | 'user' | 'test' | 'general';
  tag?: string;
  metadata?: Record<string, any>;
  timestamp?: number;
}

export interface PushSubscriptionClientInput {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
}

/**
 * Configure VAPID credentials securely
 */
export async function getVapidCredentials(): Promise<{
  publicKey: string;
  privateKey: string;
  subject: string;
  configured: boolean;
}> {
  let publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
  let privateKey = process.env.VAPID_PRIVATE_KEY || '';
  let subject = process.env.VAPID_SUBJECT || 'mailto:admin@growix.app';

  // Check if keys are overridden in siteSettings
  try {
    const settings = await db
      .select()
      .from(siteSettings)
      .where(inArray(siteSettings.key, ['vapid_public_key', 'vapid_private_key', 'vapid_subject']));

    for (const s of settings) {
      if (s.key === 'vapid_public_key' && s.value) {
        publicKey = s.value.trim();
      }
      if (s.key === 'vapid_private_key' && s.value) {
        privateKey = decryptSensitiveData(s.value.trim());
      }
      if (s.key === 'vapid_subject' && s.value) {
        subject = s.value.trim();
      }
    }
  } catch (err) {
    console.error('[WebPush] Error reading VAPID keys from DB:', err);
  }

  const configured = Boolean(publicKey && privateKey);

  if (configured) {
    try {
      webpush.setVapidDetails(subject, publicKey, privateKey);
    } catch (err) {
      console.error('[WebPush] Failed to set VAPID details:', err);
    }
  }

  return { publicKey, privateKey, subject, configured };
}

/**
 * Save or update a client push subscription in the database
 */
export async function savePushSubscription(
  sub: PushSubscriptionClientInput,
  userId?: string | null,
  userRole?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!sub || !sub.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
      return { success: false, error: 'Invalid push subscription data' };
    }

    let role = userRole || 'user';
    if (userId && !userRole) {
      const [u] = await db.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1);
      if (u) role = u.role;
    }

    await db
      .insert(pushSubscriptions)
      .values({
        userId: userId || null,
        userRole: role,
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
        userAgent: sub.userAgent || null,
        isActive: true,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: pushSubscriptions.endpoint,
        set: {
          userId: userId || null,
          userRole: role,
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth,
          userAgent: sub.userAgent || null,
          isActive: true,
          updatedAt: new Date(),
        },
      });

    console.log(`[WebPush] Subscription saved successfully for role: ${role}`);
    return { success: true };
  } catch (err: any) {
    console.error('[WebPush] Error saving push subscription:', err);
    return { success: false, error: err?.message || 'Database error' };
  }
}

/**
 * Remove or deactivate a push subscription
 */
export async function removePushSubscription(endpoint: string): Promise<{ success: boolean }> {
  try {
    await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
    return { success: true };
  } catch (err) {
    console.error('[WebPush] Error deleting push subscription:', err);
    return { success: false };
  }
}

/**
 * Get active admin subscriptions (for dispatching system alerts to iPhone/devices)
 */
export async function getActiveAdminSubscriptions() {
  try {
    // 1. Get subscriptions with role = 'admin'
    // 2. Or subscriptions joined with users where users.role = 'admin'
    // 3. Fallback: all active subscriptions if system has single-admin setup
    const subs = await db
      .select({
        id: pushSubscriptions.id,
        endpoint: pushSubscriptions.endpoint,
        p256dh: pushSubscriptions.p256dh,
        auth: pushSubscriptions.auth,
        userRole: pushSubscriptions.userRole,
        userId: pushSubscriptions.userId,
      })
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.isActive, true));

    const adminSubs = subs.filter((s) => s.userRole === 'admin');
    
    // If specific admin subs exist, return them. Otherwise return all active to ensure notifications reach configured devices.
    return adminSubs.length > 0 ? adminSubs : subs;
  } catch (err) {
    console.error('[WebPush] Error fetching admin subscriptions:', err);
    return [];
  }
}

/**
 * Send Web Push notification to a list of subscriptions
 */
export async function sendWebPushNotification(
  subscriptions: Array<{ endpoint: string; p256dh: string; auth: string; id?: number }>,
  payload: WebPushPayload
): Promise<{ success: boolean; sentCount: number; failedCount: number; error?: string }> {
  const { configured } = await getVapidCredentials();
  if (!configured) {
    console.warn('[WebPush] VAPID credentials not configured. Skipping push delivery.');
    return { success: false, sentCount: 0, failedCount: 0, error: 'VAPID not configured' };
  }

  if (!subscriptions || subscriptions.length === 0) {
    console.log('[WebPush] No active subscriptions found to deliver push notification.');
    return { success: true, sentCount: 0, failedCount: 0 };
  }

  const notificationString = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon || '/logo.png',
    badge: payload.badge || '/logo.png',
    image: payload.image,
    url: payload.url || '/',
    eventId: payload.eventId,
    type: payload.type || 'general',
    tag: payload.tag || `growix-${Date.now()}`,
    timestamp: payload.timestamp || Date.now(),
    metadata: payload.metadata || {},
  });

  let sentCount = 0;
  let failedCount = 0;
  const expiredEndpoints: string[] = [];

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          notificationString,
          {
            TTL: 60 * 60 * 24, // 24 hours retention on push service
            urgency: 'high',
          }
        );
        sentCount++;
      } catch (err: any) {
        failedCount++;
        const statusCode = err?.statusCode;
        console.error(`[WebPush] Delivery failed for endpoint (status ${statusCode}):`, err?.message || err);

        // 404 (Not Found) or 410 (Gone) indicates the subscription is expired / revoked by user or iOS
        if (statusCode === 404 || statusCode === 410) {
          expiredEndpoints.push(sub.endpoint);
        }
      }
    })
  );

  // Clean up invalid or expired endpoints automatically in background
  if (expiredEndpoints.length > 0) {
    try {
      console.log(`[WebPush] Cleaning up ${expiredEndpoints.length} expired subscription(s)...`);
      await db
        .update(pushSubscriptions)
        .set({ isActive: false, updatedAt: new Date() })
        .where(inArray(pushSubscriptions.endpoint, expiredEndpoints));
    } catch (cleanupErr) {
      console.error('[WebPush] Error marking expired subscriptions:', cleanupErr);
    }
  }

  return {
    success: sentCount > 0 || subscriptions.length === 0,
    sentCount,
    failedCount,
  };
}

/**
 * Send Web Push to all active admin devices (iPhone / Desktop)
 */
export async function sendWebPushToAdmins(payload: WebPushPayload) {
  try {
    const adminSubs = await getActiveAdminSubscriptions();
    return await sendWebPushNotification(adminSubs, payload);
  } catch (err: any) {
    console.error('[WebPush] Error sending push to admins:', err);
    return { success: false, sentCount: 0, failedCount: 0, error: err?.message };
  }
}

/**
 * Send Web Push to a specific user by userId
 */
export async function sendWebPushToUser(userId: string, payload: WebPushPayload) {
  try {
    const userSubs = await db
      .select({
        id: pushSubscriptions.id,
        endpoint: pushSubscriptions.endpoint,
        p256dh: pushSubscriptions.p256dh,
        auth: pushSubscriptions.auth,
      })
      .from(pushSubscriptions)
      .where(and(eq(pushSubscriptions.userId, userId), eq(pushSubscriptions.isActive, true)));

    if (userSubs.length === 0) return { success: true, sentCount: 0, failedCount: 0 };
    return await sendWebPushNotification(userSubs, payload);
  } catch (err: any) {
    console.error(`[WebPush] Error sending push to user ${userId}:`, err);
    return { success: false, sentCount: 0, failedCount: 0, error: err?.message };
  }
}
