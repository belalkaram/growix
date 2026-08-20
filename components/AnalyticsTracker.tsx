'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

export const AnalyticsTracker: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const startTimeRef = useRef<number>(Date.now());
  const currentPathRef = useRef<string>(pathname);

  // Determine if this browser / session belongs to an Admin or Test user
  const userRole = (session?.user as { role?: string })?.role;
  const isCurrentlyAdmin = userRole === 'admin';
  const isCurrentlyTest = userRole === 'test';

  // Persist admin flag in localStorage so admin devices (laptop / phone) stay flagged
  useEffect(() => {
    if (isCurrentlyAdmin && typeof window !== 'undefined') {
      localStorage.setItem('gx_is_admin_device', 'true');
    }
  }, [isCurrentlyAdmin]);

  const isAdminDevice = (): boolean => {
    if (isCurrentlyAdmin) return true;
    if (typeof window !== 'undefined' && localStorage.getItem('gx_is_admin_device') === 'true') {
      return true;
    }
    return false;
  };

  // Initialize or get Session ID
  const getSessionId = (): string => {
    if (typeof window === 'undefined') return 'unknown';
    let sid = sessionStorage.getItem('growix_session_id');
    if (!sid) {
      sid = 'gx_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
      sessionStorage.setItem('growix_session_id', sid);
    }
    return sid;
  };

  // Helper to send duration ping
  const sendDurationPing = (path: string, durationSec: number) => {
    if (durationSec <= 0 || typeof window === 'undefined') return;
    const sid = getSessionId();
    const payload = JSON.stringify({
      type: 'ping',
      sessionId: sid,
      path,
      durationSeconds: durationSec,
      isAdmin: isAdminDevice(),
      isTest: isCurrentlyTest,
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', payload);
    } else {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  };

  // Track page view and handle duration on path changes
  useEffect(() => {
    // 1. Send duration for previous path
    const prevPath = currentPathRef.current;
    const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
    if (prevPath && duration > 0) {
      sendDurationPing(prevPath, duration);
    }

    // 2. Reset timer for new path
    startTimeRef.current = Date.now();
    currentPathRef.current = pathname;
    const sid = getSessionId();

    // 3. Extract UTM parameters
    const utmSource = searchParams?.get('utm_source') || undefined;
    const utmMedium = searchParams?.get('utm_medium') || undefined;
    const utmCampaign = searchParams?.get('utm_campaign') || undefined;
    const referrer = typeof document !== 'undefined' ? document.referrer : undefined;

    // 4. Send PageView to internal analytics with admin/test detection
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'view',
        sessionId: sid,
        path: pathname,
        referrer,
        utmSource,
        utmMedium,
        utmCampaign,
        durationSeconds: 0,
        isAdmin: isAdminDevice(),
        isTest: isCurrentlyTest,
      }),
    }).catch(() => {});

    // 5. Setup periodic ping for long sessions (every 20s)
    const interval = setInterval(() => {
      const currentDuration = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (currentDuration > 5) {
        sendDurationPing(pathname, currentDuration);
      }
    }, 20000);

    // 6. Handle beforeunload & visibility change
    const handleUnload = () => {
      const totalSec = Math.round((Date.now() - startTimeRef.current) / 1000);
      sendDurationPing(pathname, totalSec);
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleUnload);
      handleUnload();
    };
  }, [pathname, searchParams, userRole]);

  return null;
};
