import React from 'react';
import { Metadata } from 'next';
import { SITE_CONFIG } from '@/config/site';
import { getSiteSettings, getPackages, getTools } from '@/lib/queries';
import { auth } from '@/lib/auth';
import { MaintenanceScreen } from '@/components/MaintenanceScreen';
import { HeaderNavbar } from '@/components/HeaderNavbar';
import { Footer } from '@/components/Footer';
import { PricingSection } from '@/components/PricingSection';
import { FaqSection } from '@/components/FaqSection';
import { FloatingElements } from '@/components/FloatingElements';
import { Zap, ShieldCheck, Check, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'أسعار وباقات التسويق الإلكتروني والأدوات | GROWIX',
  description: 'قارن بين باقات GROWIX — باقة VIP الشاملة (500 ج)، باقة Premium (300 ج)، أو باقة أداة واحدة (200 ج). تفعيل فوري وبدون اشتراكات شهرية.',
  keywords: [
    'أسعار برامج التسويق', 'باقات التسويق الإلكتروني', 'سعر أداة التسويق',
    'خصم GROWIX', 'باقة VIP تسويق', 'أدوات تسويق بدون اشتراك شهري'
  ],
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'أسعار وباقات التسويق الإلكتروني | GROWIX',
    description: 'اختر الباقة المناسبة لأعمالك واستلم برامجك وتفعيل حسابك خلال ساعة.',
    url: 'https://growix.belalkaram.dev/pricing',
    siteName: 'GROWIX',
    locale: 'ar_EG',
    type: 'website',
  },
};

export default async function PricingPage() {
  const [packages, tools, siteSettings, session] = await Promise.all([
    getPackages(),
    getTools(),
    getSiteSettings(),
    auth(),
  ]);

  const vipPkg = packages.find((p) => p.id === 'bundle-vip');
  const premiumPkg = packages.find((p) => p.id === 'bundle-premium');
  const singlePkg = packages.find((p) => p.id === 'single-tool');

  if (siteSettings?.maintenance_mode === 'true' && (session?.user as { role?: string })?.role !== 'admin') {
    return (
      <MaintenanceScreen
        message={siteSettings.maintenance_message}
        whatsappNumber={siteSettings.whatsapp_number}
        telegramUsername={siteSettings.telegram_username}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F9FA] text-[#0B1220] font-sans" dir="rtl">
      <HeaderNavbar session={session} settings={siteSettings} />

      {/* Hero */}
      <section className="bg-[#0B1220] text-white pt-32 pb-16 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          
          <nav className="mb-6 text-xs sm:text-sm text-gray-400" aria-label="Breadcrumb">
            <ol className="flex items-center justify-center gap-2">
              <li><a href="/" className="hover:text-[#2ECC8F] transition-colors">الرئيسية</a></li>
              <li className="text-gray-600">/</li>
              <li className="text-[#2ECC8F] font-semibold">الباقات والأسعار</li>
            </ol>
          </nav>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0F9D58]/20 text-[#2ECC8F] text-xs font-black border border-[#2ECC8F]/30 mb-5">
            <Zap className="w-4 h-4" />
            <span>بدون اشتراكات شهرية — دفعة واحدة مدى الحياة</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-5 leading-tight">
            باقات أسعار <span className="text-[#2ECC8F]">منصة GROWIX</span>
          </h1>

          <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            اختر الباقة المناسبة لاحتياجك واستمتع بتفعيل فوري مع ضمان الحصول على كافة التحديثات مجاناً.
          </p>
        </div>
      </section>

      {/* Interactive Pricing Component */}
      <PricingSection 
        packages={packages} 
        tools={tools} 
      />

      {/* Comparison Table Section */}
      <section className="py-20 bg-white border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B1220] mb-3">
              مقارنة تفصيلية بين الباقات
            </h2>
            <p className="text-sm text-gray-600">
              نوصي دائماً بـ **باقة VIP الشاملة** للحصول على الترسانة التسويقية الكاملة بأعلى توفير:
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-gray-200 shadow-md bg-white">
            <table className="w-full text-right text-xs sm:text-sm border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-[#0B1220] text-white">
                  <th className="p-4 sm:p-5 font-black">الميزة / الأداة</th>
                  <th className="p-4 sm:p-5 font-black text-center text-[#2ECC8F] bg-[#111C2E] border-x border-white/10">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">الأكثر طلباً ⭐</span>
                      <span>باقة VIP ({vipPkg?.discountedPrice || '500'}ج)</span>
                    </div>
                  </th>
                  <th className="p-4 sm:p-5 font-black text-center">باقة Premium ({premiumPkg?.discountedPrice || '350'}ج)</th>
                  <th className="p-4 sm:p-5 font-black text-center">برنامج واحد ({singlePkg?.discountedPrice || '150'}ج)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                <tr className="hover:bg-gray-50/60 transition-colors">
                  <td className="p-4 font-bold text-[#0B1220]">عدد الأدوات التسويقية</td>
                  <td className="p-4 text-center font-extrabold text-[#0F9D58] bg-emerald-50/60 border-x border-emerald-100">الـ 12 أداة كاملة</td>
                  <td className="p-4 text-center text-gray-700 font-bold">الـ 12 أداة كاملة</td>
                  <td className="p-4 text-center text-gray-500 font-medium">أداة واحدة اختيارية</td>
                </tr>
                <tr className="hover:bg-gray-50/60 transition-colors">
                  <td className="p-4 font-bold text-[#0B1220]">كورس التسويق الإلكتروني التطبيقي</td>
                  <td className="p-4 text-center font-extrabold text-[#0F9D58] bg-emerald-50/60 border-x border-emerald-100">
                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg">✓ متوفر بالكامل</span>
                  </td>
                  <td className="p-4 text-center text-rose-500 font-bold">✕ غير شامل الكورس</td>
                  <td className="p-4 text-center text-rose-500 font-bold">✕ غير شامل الكورس</td>
                </tr>
                <tr className="hover:bg-gray-50/60 transition-colors">
                  <td className="p-4 font-bold text-[#0B1220]">هدية داتا مصر (500 ألف رقم)</td>
                  <td className="p-4 text-center font-extrabold text-[#0F9D58] bg-emerald-50/60 border-x border-emerald-100">
                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg">✓ مجاناً مع الباقة</span>
                  </td>
                  <td className="p-4 text-center text-[#0F9D58] font-bold">✓ مجاناً مع الباقة</td>
                  <td className="p-4 text-center text-rose-500 font-bold">✕ غير متوفرة</td>
                </tr>
                <tr className="hover:bg-gray-50/60 transition-colors">
                  <td className="p-4 font-bold text-[#0B1220]">فيديوهات شرح الاستخدام وتثبيت البرامج</td>
                  <td className="p-4 text-center font-bold text-[#0F9D58] bg-emerald-50/60 border-x border-emerald-100">✓ شاملة وصوت وصورة</td>
                  <td className="p-4 text-center text-[#0F9D58] font-bold">✓ شاملة وصوت وصورة</td>
                  <td className="p-4 text-center text-[#0F9D58] font-bold">✓ شرح للأداة المحددة</td>
                </tr>
                <tr className="hover:bg-gray-50/60 transition-colors">
                  <td className="p-4 font-bold text-[#0B1220]">الدعم الفني المباشر لحل المشاكل</td>
                  <td className="p-4 text-center font-bold text-[#0F9D58] bg-emerald-50/60 border-x border-emerald-100">✓ دعم مباشر 24/7</td>
                  <td className="p-4 text-center text-[#0F9D58] font-bold">✓ دعم مباشر 24/7</td>
                  <td className="p-4 text-center text-[#0F9D58] font-bold">✓ دعم مباشر 24/7</td>
                </tr>
                <tr className="hover:bg-gray-50/60 transition-colors">
                  <td className="p-4 font-bold text-[#0B1220]">مدة الاشتراك والتفعيل</td>
                  <td className="p-4 text-center font-black text-[#0F9D58] bg-emerald-50/60 border-x border-emerald-100">مدى الحياة</td>
                  <td className="p-4 text-center font-bold text-gray-700">مدى الحياة</td>
                  <td className="p-4 text-center font-bold text-gray-700">مدى الحياة</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing FAQs */}
      <FaqSection />

      {/* Guarantee Section */}
      <section className="py-16 bg-[#0B1220] text-white text-center">
        <div className="max-w-3xl mx-auto px-4 space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#0F9D58]/20 text-[#2ECC8F] flex items-center justify-center mx-auto border border-[#2ECC8F]/30">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            ضمان وتفعيل آمن 100%
          </h2>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            استلم حسابك وبرامجك فوراً عبر واتساب مع فيديوهات الشرح والدعم الفني المباشر لحل أي استفسار.
          </p>
          <div className="pt-2">
            <a
              href="/checkout?package=bundle-vip"
              className="inline-flex items-center gap-2 px-9 py-4 rounded-2xl bg-gradient-to-l from-[#0F9D58] to-[#2ECC8F] text-white font-extrabold text-sm sm:text-base shadow-xl hover:scale-105 transition-transform"
            >
              <Sparkles className="w-5 h-5" />
              <span>اختر الباقة الكاملة VIP ({vipPkg?.discountedPrice || '500'}ج)</span>
            </a>
          </div>
        </div>
      </section>

      <Footer settings={siteSettings} />

      {/* Mobile & Desktop Floating Elements */}
      <FloatingElements 
        settings={siteSettings} 
        packages={packages} 
        onOpenPaymentModal={undefined as any}
      />
    </main>
  );
}
