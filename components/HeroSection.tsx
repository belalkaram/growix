'use client';

import React from 'react';
import { motion } from 'motion/react';
import { SITE_CONFIG } from '@/config/site';
import { 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  Play, 
  MessageSquare, 
  Database, 
  Zap, 
  ShieldCheck, 
  Users, 
  TrendingUp,
  Cpu,
  Gift
} from 'lucide-react';

interface HeroSectionProps {
  onOpenPaymentModal: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenPaymentModal }) => {
  return (
    <section id="hero" className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0B1220] text-white overflow-hidden">
      {/* Background Glow Blobs */}
      <div className="absolute top-1/4 right-10 w-96 h-96 bg-[#0F9D58]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#2ECC8F]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Right Column (Content) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-right">
            
            {/* Top Pill Badge */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-[#2ECC8F]/30 text-[#2ECC8F] text-xs sm:text-sm font-bold backdrop-blur-md shadow-inner"
            >
              <Sparkles className="w-4 h-4 text-[#2ECC8F] animate-pulse" />
              <span>كورس شامل + 12 أداة تسويق متقدمة + داتا مصر مجاناً</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight sm:leading-tight"
            >
              اتعلّم التسويق الإلكتروني... <br className="hidden sm:inline" />
              <span className="text-growix-gradient">وامتلك 12 أداة تسويق</span> في مكان واحد
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-gray-300 text-base sm:text-lg lg:text-xl font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0"
            >
              ضاعف مبيعات عملك وحجم وصول إعلاناتك أوتوماتيكياً! احصل على كورس تسويق إلكتروني تطبيقي من الصفر للاحتراف + باقة الـ 12 أداة الذكية لإرسال الرسائل، سحب الداتا، المونتاج، وأتمتة السوشيال ميديا.
            </motion.p>

            {/* Key Value Points */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs sm:text-sm text-gray-200 font-semibold pt-1"
            >
              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-[#2ECC8F]" />
                <span>شرح فيديو عملي لكل أداة</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-[#2ECC8F]" />
                <span>دعم فني وتفعيل خلال 60 دقيقة</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-[#2ECC8F]" />
                <span>بدون اشتراكات شهرية</span>
              </div>
            </motion.div>

            {/* Dual CTAs - Side by side on mobile and desktop */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-row items-center justify-center lg:justify-start gap-2.5 sm:gap-4 pt-4 w-full"
            >
              <button
                onClick={() => onOpenPaymentModal()}
                className="flex-1 sm:flex-none py-3.5 sm:py-4 px-3 sm:px-8 rounded-2xl bg-growix-gradient hover:bg-growix-gradient-hover text-white font-extrabold text-xs sm:text-lg flex items-center justify-center gap-1.5 sm:gap-3 shadow-xl shadow-[#0F9D58]/30 transition-all hover:scale-105 active:scale-95 group text-center whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0" />
                <span>اشترك الآن واستلم فوراً</span>
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform shrink-0 hidden xs:inline-block" />
              </button>

              <a
                href="#tools"
                className="flex-1 sm:flex-none py-3.5 sm:py-4 px-3 sm:px-8 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-base flex items-center justify-center gap-1.5 border border-white/15 backdrop-blur-md transition-all hover:border-white/30 text-center whitespace-nowrap"
              >
                <span>استكشف الـ 12 أداة</span>
              </a>
            </motion.div>

            {/* Trust Stats Counter Strip */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              {SITE_CONFIG.stats.map((stat, idx) => (
                <div key={idx} className="text-right">
                  <span className="text-xl sm:text-2xl font-black text-[#2ECC8F] block dir-ltr">{stat.value}</span>
                  <span className="text-xs text-gray-400 font-medium">{stat.label}</span>
                </div>
              ))}
            </motion.div>

          </div>

          {/* Left Column (Interactive Mockup Graphic) */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative rounded-3xl bg-gradient-to-b from-white/10 to-white/5 border border-white/15 p-4 sm:p-6 backdrop-blur-xl shadow-2xl glow-navy"
            >
              {/* Fake Application Window Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <div className="text-xs text-gray-400 font-mono bg-white/5 px-3 py-1 rounded-full border border-white/10">
                  GROWIX Suite v4.2 - Activated
                </div>
              </div>

              {/* Mock Dashboard Grid */}
              <div className="space-y-3">
                
                {/* Status Bar */}
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-growix-gradient flex items-center justify-center text-white">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block text-white">منظومة الأتمتة التلقائية</span>
                      <span className="text-[10px] text-[#2ECC8F]">12 أداة نشطة وجاهزة</span>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-[#2ECC8F]/20 text-[#2ECC8F] font-bold rounded-lg border border-[#2ECC8F]/30">
                    نشط الآن
                  </span>
                </div>

                {/* Mock Item 1: WhatsApp Sender */}
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-200 block">واتساب سندر (Anti-Block)</span>
                      <span className="text-[10px] text-gray-400">تم إرسال 840 رسالة اليوم</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">100% نجاح</span>
                </div>

                {/* Mock Item 2: Data Scraper Pro */}
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-200 block">سحب الداتا (Facebook & Maps)</span>
                      <span className="text-[10px] text-gray-400">تم استخراج +15,000 رقم مفلتر</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-sky-400">جاهز للتصدير</span>
                </div>

                {/* Mock Item 3: Course Video Masterclass */}
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                      <Play className="w-4 h-4 fill-current" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-200 block">كورس احتراف الإعلانات الممولّة</span>
                      <span className="text-[10px] text-gray-400">شرح صوت وصورة خطوة بخطوة</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-purple-300">مسجل كامل</span>
                </div>

                {/* Bonus Badge Callout inside graphic */}
                <div className="p-3 bg-gradient-to-r from-[#0F9D58]/20 to-[#2ECC8F]/20 rounded-2xl border border-[#2ECC8F]/40 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#2ECC8F] text-[#0B1220] flex items-center justify-center font-black text-sm shrink-0">
                    <Gift className="w-4 h-4 text-[#0B1220]" />
                  </div>
                  <div className="text-xs">
                    <span className="font-extrabold text-white block">مرفق مجاناً: داتا مصر التسويقية</span>
                    <span className="text-gray-300 text-[11px]">مقسمة بالمحافظات والأنشطة التجارية</span>
                  </div>
                </div>

              </div>

              {/* Floating Badge on Graphic */}
              <div className="absolute -bottom-5 -left-5 bg-[#0B1220] text-white p-3 rounded-2xl border border-[#2ECC8F]/40 shadow-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-growix-gradient flex items-center justify-center text-white">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold block text-white">تفعيل خلال 60 دقيقة</span>
                  <span className="text-[10px] text-[#2ECC8F]">دعم فني مباشر على الواتساب</span>
                </div>
              </div>

            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};
