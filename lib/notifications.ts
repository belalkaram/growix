import {
  sendTelegramOrderAlert as rawSendTelegramOrderAlert,
  sendTelegramOrderStatusAlert as rawSendTelegramOrderStatusAlert,
  sendTelegramLoginAlert as rawSendTelegramLoginAlert,
  sendTelegramNewUserAlert as rawSendTelegramNewUserAlert,
  sendTelegramSecurityAlert as rawSendTelegramSecurityAlert,
  sendTelegramTransactionAlert as rawSendTelegramTransactionAlert,
  TelegramOrderPayload,
  TelegramOrderStatusPayload,
  TelegramLoginPayload,
  TelegramNewUserPayload,
  TelegramSecurityPayload,
  TelegramTransactionPayload,
} from '@/lib/telegram';
import { sendWebPushToAdmins, sendWebPushToUser } from '@/lib/push';

export type {
  TelegramOrderPayload as OrderNotificationPayload,
  TelegramOrderStatusPayload as OrderStatusNotificationPayload,
  TelegramLoginPayload as LoginNotificationPayload,
  TelegramNewUserPayload as NewUserNotificationPayload,
  TelegramSecurityPayload as SecurityNotificationPayload,
  TelegramTransactionPayload as TransactionNotificationPayload,
};

/**
 * Central Multi-Channel Dispatcher: Dispatches notifications to both Telegram and Web Push (iPhone / PWA)
 * Neither channel failure affects the delivery or execution of the other.
 */

// 1. Order Alert (New Order)
export async function sendOrderNotification(
  payload: TelegramOrderPayload
): Promise<{ telegram: boolean; push: boolean; error?: string }> {
  console.log(`[NotificationDispatcher] Dispatching New Order Notification (#${payload.orderId})...`);

  const results = await Promise.allSettled([
    // Channel 1: Telegram
    rawSendTelegramOrderAlert(payload),

    // Channel 2: Web Push to Admins (iPhone / Devices)
    sendWebPushToAdmins({
      title: `🚀 طلب اشتراك جديد #${payload.orderId.slice(0, 8)}`,
      body: `قام ${payload.userName} بطلب ${payload.packageName} بقيمة ${payload.amount} ج (${payload.paymentMethod})`,
      url: `/admin/orders?orderId=${payload.orderId}`,
      eventId: payload.orderId,
      type: 'order',
      tag: `order-${payload.orderId}`,
      timestamp: Date.now(),
      metadata: {
        orderId: payload.orderId,
        userName: payload.userName,
        amount: payload.amount,
      },
    }),
  ]);

  const telegramSuccess = results[0].status === 'fulfilled' && (results[0].value as any)?.success === true;
  const pushSuccess = results[1].status === 'fulfilled' && (results[1].value as any)?.success === true;

  if (results[0].status === 'rejected') {
    console.error('[NotificationDispatcher] Telegram delivery threw an error:', results[0].reason);
  }
  if (results[1].status === 'rejected') {
    console.error('[NotificationDispatcher] Web Push delivery threw an error:', results[1].reason);
  }

  return {
    telegram: telegramSuccess,
    push: pushSuccess,
  };
}

// 2. Order Status Alert (Approved / Rejected)
export async function sendOrderStatusNotification(
  payload: TelegramOrderStatusPayload
): Promise<{ telegram: boolean; push: boolean; error?: string }> {
  console.log(`[NotificationDispatcher] Dispatching Order Status Notification (#${payload.orderId} -> ${payload.status})...`);

  const isApproved = payload.status === 'approved';
  const isAuto = payload.approvalType === 'auto';
  const shortId = payload.orderId.slice(0, 8);

  const pushTitle = isApproved
    ? `✅ تم قبول وتفعيل طلب الاشتراك #${shortId}`
    : `❌ تم رفض طلب الاشتراك #${shortId}`;

  const pushBody = isApproved
    ? `تم تفعيل اشتراك ${payload.userName || 'العميل'} في ${payload.packageName || 'الباقة'} بنجاح ${isAuto ? '(تلقائياً)' : ''}`
    : `تم رفض الطلب #${shortId} للعميل ${payload.userName || ''} ${payload.adminNotes ? `(${payload.adminNotes})` : ''}`;

  const results = await Promise.allSettled([
    // Channel 1: Telegram
    rawSendTelegramOrderStatusAlert(payload),

    // Channel 2: Web Push to Admins (iPhone / Devices)
    sendWebPushToAdmins({
      title: pushTitle,
      body: pushBody,
      url: `/admin/orders?orderId=${payload.orderId}`,
      eventId: payload.orderId,
      type: 'order_status',
      tag: `order-status-${payload.orderId}`,
      timestamp: Date.now(),
      metadata: {
        orderId: payload.orderId,
        status: payload.status,
      },
    }),
  ]);

  const telegramSuccess = results[0].status === 'fulfilled' && (results[0].value as any)?.success === true;
  const pushSuccess = results[1].status === 'fulfilled' && (results[1].value as any)?.success === true;

  return {
    telegram: telegramSuccess,
    push: pushSuccess,
  };
}

// 3. Login Alert
export async function sendLoginNotification(
  payload: TelegramLoginPayload
): Promise<{ telegram: boolean; push: boolean; error?: string }> {
  console.log(`[NotificationDispatcher] Dispatching Login Notification (${payload.userEmail})...`);

  const roleLabel = payload.role === 'admin' ? 'مسؤول (Admin)' : 'مستخدم (User)';

  const results = await Promise.allSettled([
    // Channel 1: Telegram
    rawSendTelegramLoginAlert(payload),

    // Channel 2: Web Push to Admins
    sendWebPushToAdmins({
      title: `🔐 تسجيل دخول جديد: ${payload.userName}`,
      body: `قام ${payload.userName} (${payload.userEmail}) بتسجيل الدخول كـ ${roleLabel}`,
      url: `/admin/users`,
      eventId: payload.userId,
      type: 'login',
      tag: `login-${payload.userId}-${Date.now()}`,
      timestamp: Date.now(),
      metadata: {
        userId: payload.userId,
        email: payload.userEmail,
        role: payload.role,
      },
    }),
  ]);

  const telegramSuccess = results[0].status === 'fulfilled' && (results[0].value as any)?.success === true;
  const pushSuccess = results[1].status === 'fulfilled' && (results[1].value as any)?.success === true;

  return {
    telegram: telegramSuccess,
    push: pushSuccess,
  };
}

// 4. New User Alert
export async function sendNewUserNotification(
  payload: TelegramNewUserPayload
): Promise<{ telegram: boolean; push: boolean; error?: string }> {
  console.log(`[NotificationDispatcher] Dispatching New User Notification (${payload.userEmail})...`);

  let sourceLabel = 'تسجيل عبر الموقع';
  if (payload.source === 'admin_manual') sourceLabel = 'إنشاء يدوي من الإدارة';
  if (payload.source === 'admin_auto') sourceLabel = 'توليد تلقائي 1-Click';

  const results = await Promise.allSettled([
    // Channel 1: Telegram
    rawSendTelegramNewUserAlert(payload),

    // Channel 2: Web Push to Admins
    sendWebPushToAdmins({
      title: `🎉 مستخدم جديد في المنصة: ${payload.userName}`,
      body: `تم تسجيل حساب جديد: ${payload.userEmail} (${sourceLabel})`,
      url: `/admin/users`,
      eventId: payload.userId,
      type: 'user',
      tag: `user-${payload.userId}`,
      timestamp: Date.now(),
      metadata: {
        userId: payload.userId,
        email: payload.userEmail,
        source: payload.source,
      },
    }),
  ]);

  const telegramSuccess = results[0].status === 'fulfilled' && (results[0].value as any)?.success === true;
  const pushSuccess = results[1].status === 'fulfilled' && (results[1].value as any)?.success === true;

  return {
    telegram: telegramSuccess,
    push: pushSuccess,
  };
}

// 5. Security Attack & High-Traffic Alert
export async function sendSecurityNotification(
  payload: TelegramSecurityPayload
): Promise<{ telegram: boolean; push: boolean }> {
  console.log(`[NotificationDispatcher] 🚨 Dispatching Security Alert (${payload.ip} - ${payload.requestCount} requests)...`);

  const results = await Promise.allSettled([
    // Channel 1: Telegram
    rawSendTelegramSecurityAlert(payload),

    // Channel 2: Web Push to Admins (High Priority Alert on iPhone)
    sendWebPushToAdmins({
      title: `🚨 تنبيه أمني: رصد هجوم أو نشاط مفرط!`,
      body: `الـ IP (${payload.ip}) أرسل ${payload.requestCount} طلب خلال ${payload.timeWindow} على ${payload.endpoint || 'الموقع'}. تم التقييد تلقائياً.`,
      url: `/admin/analytics`,
      eventId: `sec-${payload.ip}-${Date.now()}`,
      type: 'general',
      tag: `security-${payload.ip}`,
      timestamp: Date.now(),
      metadata: {
        ip: payload.ip,
        action: payload.action,
        count: payload.requestCount,
      },
    }),
  ]);

  const telegramSuccess = results[0].status === 'fulfilled' && (results[0].value as any)?.success === true;
  const pushSuccess = results[1].status === 'fulfilled' && (results[1].value as any)?.success === true;

  return {
    telegram: telegramSuccess,
    push: pushSuccess,
  };
}

// 6. Webhook Transaction Alert (Vodafone Cash & InstaPay)
export async function sendTransactionNotification(
  payload: TelegramTransactionPayload
): Promise<{ telegram: boolean; push: boolean }> {
  console.log(`[NotificationDispatcher] Dispatching Transaction Alert (${payload.provider} - ${payload.amount} EGP)...`);

  const isAuto = payload.status === 'AUTO_APPROVED';
  const providerName = payload.provider === 'vodafone_cash' ? 'فودافون كاش' : 'إنستاباي';
  const title = isAuto
    ? `⚡ تحويل تلقائي ناجح: ${payload.amount} ج (${providerName})`
    : `⚠️ تحويل مالي وارد يتطلب المراجعة: ${payload.amount} ج (${providerName})`;

  const body = isAuto
    ? `تم استقبال وتفعيل اشتراك العميل (${payload.senderPhone}) تلقائياً. المعاملة #${payload.transactionId.slice(0, 10)}`
    : `تحويل بقيمة ${payload.amount} ج من ${payload.senderPhone}. ${payload.reviewReason || 'يرجى المطابقة يدوياً'}`;

  const results = await Promise.allSettled([
    // Channel 1: Telegram
    rawSendTelegramTransactionAlert(payload),

    // Channel 2: Web Push to Admins
    sendWebPushToAdmins({
      title,
      body,
      url: `/admin/transactions`,
      eventId: payload.transactionId,
      type: 'general',
      tag: `tx-${payload.transactionId}`,
      timestamp: Date.now(),
      metadata: {
        transactionId: payload.transactionId,
        amount: payload.amount,
        status: payload.status,
      },
    }),
  ]);

  const telegramSuccess = results[0].status === 'fulfilled' && (results[0].value as any)?.success === true;
  const pushSuccess = results[1].status === 'fulfilled' && (results[1].value as any)?.success === true;

  return {
    telegram: telegramSuccess,
    push: pushSuccess,
  };
}
