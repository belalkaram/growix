'use client';

import React from 'react';
import { SITE_CONFIG, SITE_PRICING, PricingPackage } from '@/config/site';
import { MessageSquare, Sparkles, ArrowLeft } from 'lucide-react';

interface FloatingElementsProps {
  onOpenPaymentModal: () => void;
  settings?: Record<string, string>;
  packages?: PricingPackage[];
  vipPrice?: string;
}

export const FloatingElements: React.FC<FloatingElementsProps> = ({ 
  onOpenPaymentModal, 
  settings,
  packages,
  vipPrice
}) => {
  const whatsappNum = settings?.whatsapp_number || SITE_CONFIG.whatsappNumber;
  const vipPkg = packages?.find((p) => p.id === 'bundle-vip');
  const priceDisplay = vipPrice || vipPkg?.discountedPrice || SITE_PRICING.vipPackagePrice;
  const currencyDisplay = vipPkg?.currency || SITE_PRICING.currency;

  return (
    <>
      {/* Floating WhatsApp Button (Fixed Bottom-Right) */}
      <a
        href={`https://wa.me/${whatsappNum}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 sm:bottom-8 right-5 z-40 p-3.5 rounded-full bg-[#25D366] text-white shadow-2xl hover:scale-110 active:scale-95 transition-transform flex items-center justify-center group"
        aria-label="تواصل عبر الواتساب"
      >
        <MessageSquare className="w-7 h-7 fill-current" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 text-xs font-bold mr-0 group-hover:mr-2">
          تواصل معنا
        </span>
      </a>

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-[#0B1220]/95 backdrop-blur-md border-t border-white/10 flex items-center justify-between gap-3 shadow-2xl dir-rtl">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400">الباقة الشاملة VIP</span>
          <span className="text-base font-black text-[#2ECC8F] dir-rtl">
            {priceDisplay} {currencyDisplay}
          </span>
        </div>

        <button
          onClick={() => onOpenPaymentModal()}
          className="py-2.5 px-6 rounded-xl bg-growix-gradient text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-[#0F9D58]/30 active:scale-95 transition-transform cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>اشترك الآن</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
      </div>
    </>
  );
};

