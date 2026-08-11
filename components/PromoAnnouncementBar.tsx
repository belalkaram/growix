'use client';

import React from 'react';
import Link from 'next/link';
import { PROMO_BAR_CONFIG } from '@/config/site';
import { Sparkles, Flame, ArrowLeft } from 'lucide-react';

export const PromoAnnouncementBar: React.FC = () => {
  if (!PROMO_BAR_CONFIG.enabled) return null;

  // Single item block helper to render styled text with highlighted elements
  const renderItemContent = (keyPrefix: string, isDuplicate = false) => (
    <div key={keyPrefix} className="inline-flex items-center gap-3 sm:gap-6 px-4 shrink-0 font-bold text-xs sm:text-sm text-white">
      {/* Item 1: Discount & Customer limit */}
      <div className="inline-flex items-center gap-1.5">
        <Flame className="w-4 h-4 text-amber-400 shrink-0" />
        <span>خصم</span>
        <span className="bg-amber-400 text-[#0B1220] px-2 py-0.5 rounded-md font-black text-xs sm:text-sm shadow-sm">
          {PROMO_BAR_CONFIG.discount}
        </span>
        <span>لأول</span>
        <span className="text-[#2ECC8F] font-black underline underline-offset-2">
          {PROMO_BAR_CONFIG.customerLimit}
        </span>
        <span>فقط — الحق بسرعة!</span>
      </div>

      <span className="text-emerald-500/40 font-normal">|</span>

      {/* Item 2: Tools count & Price */}
      <div className="inline-flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-[#2ECC8F] shrink-0" />
        <span>احصل على</span>
        <span className="bg-[#0F9D58] text-white px-2 py-0.5 rounded-md font-black text-xs sm:text-sm shadow-sm border border-[#2ECC8F]/30">
          {PROMO_BAR_CONFIG.toolCount}
        </span>
        <span>بسعر</span>
        <span className="text-amber-300 font-black text-sm sm:text-base underline underline-offset-2">
          {PROMO_BAR_CONFIG.price}
        </span>
      </div>

      <span className="text-emerald-500/40 font-normal">|</span>

      {/* CTA Link */}
      <Link 
        href="/checkout?package=bundle-vip" 
        tabIndex={isDuplicate ? -1 : undefined}
        aria-hidden={isDuplicate ? true : undefined}
        className="inline-flex items-center gap-1 text-[#2ECC8F] hover:text-amber-300 transition-colors text-xs font-black underline"
      >
        <span>احجز الآن مع التفعيل الفوري</span>
        <ArrowLeft className="w-3 h-3" />
      </Link>

      <span className="text-emerald-500/40 font-normal">✦</span>
    </div>
  );

  return (
    <div 
      className="bg-[#060B15] text-white border-b border-[#0F9D58]/40 relative z-50 overflow-hidden select-none pause-on-hover shadow-md group w-full dir-ltr"
      title="شريط العروض - قف بالمؤشر لإيقاف الحركة مؤقتاً"
      dir="ltr"
    >
      {/* Inline style block to guarantee immediate browser update without cache delays */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes marquee-force-ltr {
              0% { transform: translate3d(-50%, 0, 0); }
              100% { transform: translate3d(0, 0, 0); }
            }
            .animate-marquee-force-ltr {
              animation: marquee-force-ltr 60s linear infinite !important;
            }
            .pause-on-hover:hover .animate-marquee-force-ltr {
              animation-play-state: paused !important;
            }
          `,
        }}
      />
      <div className="py-2.5 flex items-center justify-start overflow-hidden w-full max-w-full dir-ltr" dir="ltr">
        {/* Continuous track wrapper with dir="ltr" so duplicate half sits to the right of first half */}
        <div className="animate-marquee-force-ltr flex flex-row shrink-0 w-max dir-ltr" dir="ltr">
          {/* First Half */}
          <div className="flex items-center shrink-0 dir-rtl" dir="rtl">
            {renderItemContent('a1')}
            {renderItemContent('a2')}
            {renderItemContent('a3')}
          </div>

          {/* Second Half (Identical duplicate for seamless 100% -> 0% loop) */}
          <div className="flex items-center shrink-0 dir-rtl" dir="rtl" aria-hidden={true}>
            {renderItemContent('b1', true)}
            {renderItemContent('b2', true)}
            {renderItemContent('b3', true)}
          </div>
        </div>
      </div>
    </div>
  );
};
