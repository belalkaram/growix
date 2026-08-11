'use client';

import React from 'react';
import Link from 'next/link';
import { GrowixLogo } from '@/components/GrowixLogo';
import { Wrench, MessageSquare, Send, ShieldCheck, Lock } from 'lucide-react';
import { SITE_CONFIG } from '@/config/site';

interface MaintenanceScreenProps {
  message?: string;
  whatsappNumber?: string;
  telegramUsername?: string;
}

export const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({
  message = 'الموقع حالياً خاضع للصيانة والتحديثات الدورية لتوفير أفضل تجربة لكم. سنعود للعمل قريباً جداً!',
  whatsappNumber = SITE_CONFIG.whatsappNumber,
  telegramUsername = SITE_CONFIG.telegramUsername,
}) => {
  return (
    <div
      className="min-h-screen bg-[#0B1220] text-white flex flex-col justify-between items-center p-4 sm:p-8 dir-rtl font-sans relative overflow-hidden selection:bg-[#2ECC8F]/30"
    >
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#0F9D58]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar Logo */}
      <header className="w-full max-w-5xl flex items-center justify-between z-10 pt-2">
        <GrowixLogo />
        <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black flex items-center gap-1.5 animate-pulse">
          <Wrench className="w-3.5 h-3.5" />
          <span>وضع الصيانة مُفعل</span>
        </span>
      </header>

      {/* Main Content Box */}
      <main className="max-w-2xl w-full my-auto text-center space-y-8 z-10 py-12">
        <div className="relative inline-block">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-2xl shadow-amber-500/20">
            <Wrench className="w-12 h-12 sm:w-14 sm:h-14 animate-bounce" />
          </div>
          <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-[#0F9D58] text-white text-[10px] font-black border border-[#0B1220]">
            GROWIX
          </span>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight text-white">
            الموقع حالياً قيد <span className="text-amber-400">الصيانة والتطوير</span> 🛠️
          </h1>

          <div className="p-6 rounded-3xl bg-[#0F172A] border border-white/10 text-sm sm:text-base text-gray-200 leading-relaxed font-medium shadow-xl">
            {message}
          </div>
        </div>

        {/* Live Support Buttons */}
        <div className="space-y-3">
          <span className="text-xs text-gray-400 block font-bold">
            هل تحتاج لمساعدة فورية أثناء الصيانة؟ تواصل مع الدعم المباشر:
          </span>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#0F9D58] hover:bg-[#0D8B4E] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#0F9D58]/20 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>التواصل عبر الواتساب المباشر</span>
            </a>

            {telegramUsername && (
              <a
                href={`https://t.me/${telegramUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 border border-white/15 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4 text-blue-400" />
                <span>قناة التليجرام الرسمية</span>
              </a>
            )}
          </div>
        </div>
      </main>

      {/* Footer & Admin Pass Code */}
      <footer className="w-full max-w-5xl flex items-center justify-between text-xs text-gray-400 z-10 pt-4 border-t border-white/10">
        <span>© {new Date().getFullYear()} GROWIX. جميع الحقوق محفوظة.</span>

        <Link
          href="/login"
          className="text-gray-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors text-[11px] font-bold"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>تسجيل دخول الأدمن</span>
        </Link>
      </footer>
    </div>
  );
};
