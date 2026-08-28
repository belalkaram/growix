// GROWIX PWA & Web Push Notification Service Worker
// Version: 1.0.0

const CACHE_NAME = 'growix-sw-v1';

// 1. Service Worker Installation
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// 2. Service Worker Activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Claim all open clients immediately so the worker is active without reload
      await self.clients.claim();
    })()
  );
});

// 3. Web Push Notification Received
self.addEventListener('push', (event) => {
  if (!event.data) {
    console.log('[SW] Push received without payload.');
    return;
  }

  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    data = {
      title: 'GROWIX Notification',
      body: event.data.text(),
    };
  }

  const title = data.title || 'GROWIX | إشعار جديد';
  const options = {
    body: data.body || '',
    icon: data.icon || '/logo.png',
    badge: data.badge || '/logo.png',
    image: data.image || undefined,
    data: {
      url: data.url || '/',
      eventId: data.eventId || undefined,
      type: data.type || 'general',
      timestamp: data.timestamp || Date.now(),
      ...data.metadata,
    },
    vibrate: [200, 100, 200],
    tag: data.tag || `growix-${Date.now()}`,
    renotify: true,
    requireInteraction: true,
    dir: 'rtl',
    lang: 'ar',
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// 4. Notification Click Interaction (Deep-Linking & Window Focus)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) 
    ? event.notification.data.url 
    : '/';

  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      // Find an existing window from our origin
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          // If we can navigate the existing window to the destination URL
          if ('navigate' in client && targetUrl) {
            await client.navigate(targetUrl);
          }
          return client.focus();
        }
      }

      // If no window is open, open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })()
  );
});

// 5. Subscription Change (Auto-resubscribe if browser invalidates token)
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const sub = await self.registration.pushManager.subscribe(event.oldSubscription.options);
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sub),
        });
      } catch (err) {
        console.error('[SW] Failed to auto-renew push subscription:', err);
      }
    })()
  );
});
