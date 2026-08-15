'use client';

import React from 'react';
import { SITE_CONFIG } from '@/config/site';
import { GrowixLogo } from '@/components/GrowixLogo';
import { useRouter } from 'next/navigation';
import { MessageSquare, Send, Mail, ShieldCheck, Sparkles, ArrowUp } from 'lucide-react';

interface FooterProps {
  onOpenPaymentModal?: () => void;
  settings?: Record<string, string>;
  hideSalesBanner?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPaymentModal, settings, hideSalesBanner }) => {
  const router = useRouter();
  const whatsappNum = settings?.whatsapp_number || SITE_CONFIG.whatsappNumber;
  const telegramUser = settings?.telegram_username || SITE_CONFIG.telegramUsername;
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPayment = () => {
    if (onOpenPaymentModal) {
      onOpenPaymentModal();
    } else {
      router.push('/checkout');
    }
  };

  return (
    <footer className="bg-[#0B1220] text-white pt-16 pb-20 sm:pb-12 border-t border-white/10 relative overflow-hidden dir-rtl text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Banner inside Footer (Hidden for subscribers) */}
        {!hideSalesBanner && (
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-white/10 to-white/5 border border-white/15 backdrop-blur-xl mb-16 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2 text-center md:text-right">
              <h3 className="text-2xl sm:text-3xl font-black text-white">جاهز لامتلاك ترسانتك التسويقية وتكبير عملك؟</h3>
              <p className="text-gray-300 text-xs sm:text-sm">
                احصل على الكورس الشامل والـ 12 أداة مع داتا مصر والتفعيل الفوري خلال ساعة.
              </p>
            </div>

            <button
              onClick={handleOpenPayment}
              className="py-4 px-8 rounded-2xl bg-growix-gradient hover:bg-growix-gradient-hover text-white font-extrabold text-sm sm:text-base flex items-center gap-3 shadow-xl shadow-[#0F9D58]/30 transition-all hover:scale-105 shrink-0"
            >
              <Sparkles className="w-5 h-5" />
              <span>اشترك الآن واستلم فوراً</span>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Info */}
          <div className="md:col-span-4 space-y-4">
            <a href="#hero" className="inline-block">
              <GrowixLogo theme="dark" iconSize={42} showSubtitle />
            </a>

            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              GROWIX هي المنصة العربية الأولى المتخصصة في تقديم كورسات التسويق التطبيقية وأدوات الأتمتة المتقدمة بدون اشتراكات شهرية.
            </p>

            <div className="flex items-center gap-2 text-xs text-emerald-400 pt-1">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{SITE_CONFIG.workingHours}</span>
            </div>
          </div>

          {/* Quick Links - Organized in 2 side-by-side columns */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider">روابط سريعة</h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-gray-300 font-medium pt-1">
              {/* Right Column Links */}
              <div className="space-y-2.5">
                <a 
                  href="/" 
                  className="block text-gray-300 hover:text-[#2ECC8F] underline underline-offset-4 decoration-emerald-500/40 hover:decoration-emerald-400 transition-colors"
                >
                  الرئيسية
                </a>
                <a 
                  href="/tools" 
                  className="block text-gray-300 hover:text-[#2ECC8F] underline underline-offset-4 decoration-emerald-500/40 hover:decoration-emerald-400 transition-colors"
                >
                  الـ 12 أداة تسويق
                </a>
                <a 
                  href="/course" 
                  className="block text-gray-300 hover:text-[#2ECC8F] underline underline-offset-4 decoration-emerald-500/40 hover:decoration-emerald-400 transition-colors"
                >
                  كورس التسويق الكامل
                </a>
                <a 
                  href="/about" 
                  className="block text-gray-300 hover:text-[#2ECC8F] underline underline-offset-4 decoration-emerald-500/40 hover:decoration-emerald-400 transition-colors"
                >
                  عن منصة GROWIX
                </a>
              </div>

              {/* Left Column Links */}
              <div className="space-y-2.5">
                <a 
                  href="/data-bonus" 
                  className="block text-gray-300 hover:text-[#2ECC8F] underline underline-offset-4 decoration-emerald-500/40 hover:decoration-emerald-400 transition-colors"
                >
                  هدية داتا مصر
                </a>
                <a 
                  href="/pricing" 
                  className="block text-gray-300 hover:text-[#2ECC8F] underline underline-offset-4 decoration-emerald-500/40 hover:decoration-emerald-400 transition-colors"
                >
                  الباقات والأسعار
                </a>
                <a 
                  href="/how-it-works" 
                  className="block text-gray-300 hover:text-[#2ECC8F] underline underline-offset-4 decoration-emerald-500/40 hover:decoration-emerald-400 transition-colors"
                >
                  طريقة الاشتراك
                </a>
                <a 
                  href="/faq" 
                  className="block text-gray-300 hover:text-[#2ECC8F] underline underline-offset-4 decoration-emerald-500/40 hover:decoration-emerald-400 transition-colors"
                >
                  الأسئلة الشائعة
                </a>
              </div>
            </div>
          </div>

          {/* Direct Support */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider">تواصل والدعم الفني</h4>
            <div className="space-y-2.5 text-xs sm:text-sm text-gray-300">
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#2ECC8F] transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-[#2ECC8F] shrink-0" />
                <span>واتساب: {SITE_CONFIG.whatsappDisplayNumber}</span>
              </a>

              <a
                href={`https://t.me/${SITE_CONFIG.telegramUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-sky-400 transition-colors"
              >
                <Send className="w-4 h-4 text-sky-400 shrink-0" />
                <span>قناة وتواصل تليجرام: @{SITE_CONFIG.telegramUsername}</span>
              </a>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <span>البريد: {SITE_CONFIG.supportEmail}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright row with Back to Top button */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p suppressHydrationWarning>© {new Date().getFullYear()} جميع الحقوق محفوظة لمنصة GROWIX.</p>
          
          <button
            onClick={scrollToTop}
            className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold flex items-center gap-2 transition-all border border-white/15 shadow-lg active:scale-95 cursor-pointer z-20"
            aria-label="العودة للأعلى"
          >
            <span>العودة للأعلى</span>
            <ArrowUp className="w-4 h-4 text-[#2ECC8F]" />
          </button>
        </div>

      </div>
    </footer>
  );
};

