'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    // Generate or retrieve persistent sessionId
    let sessionId = sessionStorage.getItem('growix_analytics_sid');
    if (!sessionId) {
      sessionId = 'sid_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      sessionStorage.setItem('growix_analytics_sid', sessionId);
    }

    const currentPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

    // Skip if tracked already on same path
    if (lastTrackedPath.current === currentPath) return;
    lastTrackedPath.current = currentPath;

    // Send pageview payload via fetch beacon
    try {
      const payload = {
        path: currentPath,
        referrer: document.referrer || null,
        sessionId,
        utmSource: searchParams?.get('utm_source') || null,
        utmMedium: searchParams?.get('utm_medium') || null,
        utmCampaign: searchParams?.get('utm_campaign') || null,
      };

      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/track', JSON.stringify(payload));
      } else {
        fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // Ignore tracking errors gracefully
    }
  }, [pathname, searchParams]);

  return null;
}
