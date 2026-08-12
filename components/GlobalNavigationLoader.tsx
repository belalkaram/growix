'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Sparkles, Loader2 } from 'lucide-react';

export const GlobalNavigationLoader: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  const lastPathnameRef = useRef(pathname);
  const searchParamsString = searchParams?.toString();

  // Reset/Complete loading when route or search params change
  useEffect(() => {
    lastPathnameRef.current = pathname;

    if (!isNavigating) return;

    setProgress(100);
    const fadeTimer = setTimeout(() => {
      setIsNavigating(false);
      setProgress(0);
    }, 250);

    return () => clearTimeout(fadeTimer);
  }, [pathname, searchParamsString]);

  // Global Link Click Listener & Browser History Interceptor
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const anchor = target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Ignore download links, target="_blank", and API download endpoints
      if (
        anchor.getAttribute('target') === '_blank' ||
        anchor.hasAttribute('download') ||
        href.includes('/api/download') ||
        href.includes('/api/')
      ) {
        return;
      }

      // Ignore anchor links starting with # directly
      if (href.startsWith('#')) return;

      // Ignore external links, mailto, tel, whatsapp, javascript
      if (
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:')
      ) {
        return;
      }

      try {
        const targetUrl = new URL(href, window.location.origin);

        // If target pathname is the exact same as current page pathname (e.g. #hero, #tools, /#course, /), DO NOT show loader!
        if (targetUrl.pathname === window.location.pathname) {
          return;
        }

        // Target is a different page (e.g., /checkout) -> Trigger loader!
        setIsNavigating(true);
        setProgress(35);

        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(() => {
          setProgress((prev) => (prev >= 85 ? 85 : prev + 10));
        }, 120);
      } catch (err) {
        return;
      }
    };

    const handleCustomNavStart = () => {
      setIsNavigating(true);
      setProgress(35);
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(() => {
        setProgress((prev) => (prev >= 85 ? 85 : prev + 10));
      }, 120);
    };

    const handlePopState = () => {
      // Ignore popstate if the pathname did not change (e.g., hash change / anchor scroll)
      if (lastPathnameRef.current === window.location.pathname) {
        return;
      }

      lastPathnameRef.current = window.location.pathname;
      setIsNavigating(true);
      setProgress(40);
    };

    document.addEventListener('click', handleAnchorClick);
    window.addEventListener('growix-nav-start', handleCustomNavStart);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      window.removeEventListener('growix-nav-start', handleCustomNavStart);
      window.removeEventListener('popstate', handlePopState);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  if (!isNavigating) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none dir-rtl">
      {/* Top glowing green progress bar */}
      <div 
        className="h-1 sm:h-1.5 bg-growix-gradient transition-all duration-200 ease-out shadow-[0_0_15px_#2ECC8F]"
        style={{ width: `${progress}%` }}
      />

      {/* Floating GROWIX Loading Badge */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-[#0B1220]/95 text-white px-4 py-2 rounded-2xl shadow-2xl border border-[#0F9D58]/40 backdrop-blur-md flex items-center gap-2.5 animate-bounce">
        <Loader2 className="w-4 h-4 text-[#2ECC8F] animate-spin shrink-0" />
        <span className="text-xs font-black tracking-wide text-gray-100">
          جاري تحميل الصفحة...
        </span>
        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      </div>
    </div>
  );
};

// Helper function to trigger loader when navigating programmatically via router.push
export function triggerGlobalNavigation() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('growix-nav-start'));
  }
}
