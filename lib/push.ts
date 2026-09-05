import webpush from 'web-push';
import { db } from '@/db';
import { pushSubscriptions, users, siteSettings } from '@/db/schema';
import { eq, and, or, inArray } from 'drizzle-orm';
import { decryptSensitiveData } from '@/lib/encryption';
import { isProtectedSuperAdmin } from '@/lib/super-admins';

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
  const DEFAULT_PUB_KEY = 'BFbxB4bgdf7Gma1CyYovMBWe5oHKQ7Q6qvw_m5jJnAidpqq2IgqoHPmp2al8r_Pv-xbOzmmWl2CqMgRkWP8HvYg';
  const DEFAULT_PRIV_KEY = 'qltKO-8K6dM7vhLki5VONBiG-Sgl9VgyzS8SZ4mESBs';
  const DEFAULT_SUB = 'mailto:belalkaram50@gmail.com';

  let publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || DEFAULT_PUB_KEY;
  let privateKey = process.env.VAPID_PRIVATE_KEY || DEFAULT_PRIV_KEY;
  let subject = process.env.VAPID_SUBJECT || DEFAULT_SUB;

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
    
    // Check if user ID or super admin
    if (userId) {
      if (isProtectedSuperAdmin(userId)) {
        role = 'admin';
      } else {
        const [u] = await db
          .select({ role: users.role, email: users.email })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);
        if (u) {
          if (u.role === 'admin' || isProtectedSuperAdmin(u.email)) {
            role = 'admin';
          } else {
            role = u.role;
          }
        }
      }
    }

    // Check existing subscription to retain userId if not passed
    const existing = await db
      .select({ id: pushSubscriptions.id, userId: pushSubscriptions.userId, userRole: pushSubscriptions.userRole })
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, sub.endpoint))
      .limit(1);

    const finalUserId = userId || (existing.length > 0 ? existing[0].userId : null);
    const finalRole = (role === 'admin' || (existing.length > 0 && existing[0].userRole === 'admin')) ? 'admin' : role;

    await db
      .insert(pushSubscriptions)
      .values({
        userId: finalUserId,
        userRole: finalRole,
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
          userId: finalUserId,
          userRole: finalRole,
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth,
          userAgent: sub.userAgent || null,
          isActive: true,
          updatedAt: new Date(),
        },
      });

    console.log(`[WebPush] Subscription saved successfully (Role: ${finalRole}, User: ${finalUserId || 'guest'})`);
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
    // 1. Fetch all active subscriptions joined with users
    const allSubs = await db
      .select({
        id: pushSubscriptions.id,
        endpoint: pushSubscriptions.endpoint,
        p256dh: pushSubscriptions.p256dh,
        auth: pushSubscriptions.auth,
        userRole: pushSubscriptions.userRole,
        userId: pushSubscriptions.userId,
        userEmail: users.email,
        dbUserRole: users.role,
      })
      .from(pushSubscriptions)
      .leftJoin(users, eq(pushSubscriptions.userId, users.id))
      .where(eq(pushSubscriptions.isActive, true));

    // 2. Filter for admin devices
    const adminSubs = allSubs.filter((s) => {
      if (s.userRole === 'admin') return true;
      if (s.dbUserRole === 'admin') return true;
      if (isProtectedSuperAdmin(s.userId)) return true;
      if (isProtectedSuperAdmin(s.userEmail)) return true;
      return false;
    });

    // 3. Fallback: If no dedicated admin subs matched, return all active subs so devices never miss alerts
    const targetSubs = adminSubs.length > 0 ? adminSubs : allSubs;

    // 4. Deduplicate by endpoint
    const uniqueSubsMap = new Map<string, typeof targetSubs[0]>();
    for (const sub of targetSubs) {
      if (!uniqueSubsMap.has(sub.endpoint)) {
        uniqueSubsMap.set(sub.endpoint, sub);
      }
    }

    return Array.from(uniqueSubsMap.values());
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
    return { success: false, sentCount: 0, failedCount: 0, error: 'لم يتم العثور على أجهزة مشتركة نشطة حالياً في قاعدة البيانات.' };
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
  let lastErrorMessage = '';
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
        lastErrorMessage = err?.message || String(err);
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
    success: sentCount > 0,
    sentCount,
    failedCount,
    error: sentCount === 0 && failedCount > 0 ? `تعذر تسليم الإشعار (${failedCount} جهاز لم يستجب - ${lastErrorMessage || 'يرجى إعادة تفعيل الإشعارات'})` : undefined,
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
