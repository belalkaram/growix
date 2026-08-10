'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Sparkles, Loader2 } from 'lucide-react';

export const GlobalNavigationLoader: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  const searchParamsString = searchParams?.toString();

  // Reset loading when route or search params change
  useEffect(() => {
    let timer: NodeJS.Timeout;
    let fadeTimer: NodeJS.Timeout;

    timer = setTimeout(() => {
      setProgress(100);
      fadeTimer = setTimeout(() => {
        setIsNavigating(false);
        setProgress(0);
      }, 200);
    }, 0);

    return () => {
      clearTimeout(timer);
      clearTimeout(fadeTimer);
    };
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

      // Ignore external links, mailto, tel, whatsapp, or hash-only links on current page
      if (
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('https://wa.me') ||
        href.startsWith('#')
      ) {
        return;
      }

      // Check if destination differs from current path
      const currentUrl = window.location.pathname + window.location.search;
      if (href !== currentUrl) {
        setIsNavigating(true);
        setProgress(30);

        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(() => {
          setProgress((prev) => (prev >= 85 ? 85 : prev + 10));
        }, 150);
      }
    };

    const handlePopState = () => {
      setIsNavigating(true);
      setProgress(40);
    };

    document.addEventListener('click', handleAnchorClick);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
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
