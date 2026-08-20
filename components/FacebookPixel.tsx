'use client';

import React, { useEffect } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';

interface FacebookPixelProps {
  pixelId?: string;
  enabled?: boolean;
}

/**
 * Standard Helper to fire Meta (Facebook) Pixel events safely from anywhere in the app.
 */
export function trackMetaEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
    if (params) {
      (window as any).fbq('track', eventName, params);
    } else {
      (window as any).fbq('track', eventName);
    }
  }
}

export const FacebookPixel: React.FC<FacebookPixelProps> = ({ pixelId, enabled = true }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track PageView on route changes
  useEffect(() => {
    if (pixelId && enabled && typeof (window as any).fbq === 'function') {
      (window as any).fbq('track', 'PageView');
    }
  }, [pathname, searchParams, pixelId, enabled]);

  if (!pixelId || !enabled) {
    return null;
  }

  const cleanPixelId = pixelId.trim();

  return (
    <>
      <Script
        id="fb-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${cleanPixelId}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${cleanPixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
};
