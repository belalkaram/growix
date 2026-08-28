'use client';

/**
 * Converts a base64 string to a Uint8Array for PushManager subscription
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Feature detection for Push Notifications & Service Worker support
 */
export function isPushSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Detects if the browser is running on iOS (iPhone / iPad / iPod)
 */
export function isIosDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua);
  const isIpadOs = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return isIos || isIpadOs;
}

/**
 * Detects if the application is running in Standalone PWA mode
 */
export function isStandalonePwa(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

/**
 * Returns the current notification permission status
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Registers the Service Worker at /sw.js
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    });
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Fetches the active push subscription on this device, if any
 */
export async function getActiveSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (err) {
    console.error('Error fetching push subscription:', err);
    return null;
  }
}

/**
 * Subscribes the user to Web Push notifications
 * Must be triggered directly by a user action (e.g. click button)
 */
export async function subscribeUserToPush(): Promise<{
  success: boolean;
  subscription?: PushSubscription;
  error?: string;
  permission?: NotificationPermission | 'unsupported';
}> {
  if (!isPushSupported()) {
    return {
      success: false,
      error: 'المتصفح أو الجهاز الحالي لا يدعم إشعارات Web Push.',
      permission: 'unsupported',
    };
  }

  try {
    // 1. Request Permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return {
        success: false,
        permission,
        error: permission === 'denied'
          ? 'تم رفض إذن الإشعارات من إعدادات المتصفح.'
          : 'لم يتم منح إذن الإشعارات.',
      };
    }

    // 2. Register / Ensure Service Worker is ready
    let registration = await registerServiceWorker();
    if (!registration) {
      registration = await navigator.serviceWorker.ready;
    }
    await navigator.serviceWorker.ready;

    // 3. Get VAPID Public Key
    let publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) {
      const res = await fetch('/api/push/public-key');
      const data = await res.json();
      if (data.success && data.publicKey) {
        publicKey = data.publicKey;
      }
    }

    if (!publicKey) {
      return { success: false, error: 'مفتاح VAPID العام غير متوفر' };
    }

    // 4. Subscribe with PushManager
    const applicationServerKey = urlBase64ToUint8Array(publicKey);
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
    });

    // 5. Send subscription to backend
    const subJSON = subscription.toJSON();
    const saveRes = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subJSON),
    });

    const saveData = await saveRes.json();
    if (!saveData.success) {
      return {
        success: false,
        error: saveData.error || 'فشل في حفظ بيانات الاشتراك بالخادم',
      };
    }

    return {
      success: true,
      subscription,
      permission: 'granted',
    };
  } catch (err: any) {
    console.error('Error during push subscription flow:', err);
    return {
      success: false,
      error: err?.message || 'حدث خطأ أثناء الاشتراك في الإشعارات',
    };
  }
}

/**
 * Unsubscribes the user from Web Push notifications
 */
export async function unsubscribeUserFromPush(): Promise<{ success: boolean; error?: string }> {
  try {
    const subscription = await getActiveSubscription();
    if (subscription) {
      await fetch('/api/push/subscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
      await subscription.unsubscribe();
    }
    return { success: true };
  } catch (err: any) {
    console.error('Error unsubscribing from push:', err);
    return { success: false, error: err?.message };
  }
}
