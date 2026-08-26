import React from 'react';
import { Metadata } from 'next';
import { SITE_CONFIG } from '@/config/site';
import { getSiteSettings } from '@/lib/queries';
import { auth } from '@/lib/auth';
import { MaintenanceScreen } from '@/components/MaintenanceScreen';
import { HeaderNavbar } from '@/components/HeaderNavbar';
import { Footer } from '@/components/Footer';
import { 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  CreditCard, 
  Send, 
  Sparkles, 
  ArrowLeft,
  Smartphone,
  MessageSquare,
  HelpCircle
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'طريقة الاشتراك والتفعيل والبيع | GROWIX',
  description: 'تعرف على خطوات الشراء والدفع والتفعيل لخدمات وأدوات GROWIX. الدفع عبر فودافون كاش، إنستا باي، أو الكروت البنكية والتفعيل خلال 60 دقيقة.',
  keywords: [
    'طريقة الاشتراك growix', 'كيفية الشراء growix', 'فودافون كاش growix',
    'إنستا باي growix', 'تفعيل حساب growix', 'دعم growix'
  ],
  alternates: { canonical: '/how-it-works' },
  openGraph: {
    title: 'طريقة الاشتراك والتفعيل | GROWIX',
    description: '4 خطوات بسيطة للتفعيل الفوري واستلام ترسانتك التسويقية.',
    url: 'https://growix.belalkaram.dev/how-it-works',
    siteName: 'GROWIX',
    locale: 'ar_EG',
    type: 'website',
  },
};

export default async function HowItWorksPage() {
  const [siteSettings, session] = await Promise.all([
    getSiteSettings(),
    auth(),
  ]);

  if (siteSettings?.maintenance_mode === 'true' && (session?.user as { role?: string })?.role !== 'admin') {
    return (
      <MaintenanceScreen
        message={siteSettings.maintenance_message}
        whatsappNumber={siteSettings.whatsapp_number}
        telegramUsername={siteSettings.telegram_username}
      />
    );
  }

  const detailedSteps = [
    {
      num: '01',
      title: 'اختيار الباقة المناسبة',
      desc: 'اختر باقة VIP الشاملة (500 ج) للحصول على الـ 12 أداة + كورس التسويق + داتا مصر، أو اختر باقة Premium أو أداة واحدة من صفحة الباقات أو الدفع المباشر.',
      badge: 'الخطوة الأولى'
    },
    {
      num: '02',
      title: 'الدفع وتحويل المبلغ',
      desc: 'حّول قيمة الباقة عبر إحدى الوسائل المتاحة: فودافون كاش (Vodafone Cash)، أو تطبيق إنستا باي (InstaPay)، أو المحافظ الإلكترونية، أو الحساب البنكي.',
      badge: 'طرق متعددة'
    },
    {
      num: '03',
      title: 'رفع الإيصال أو إرساله على الواتساب',
      desc: 'قم برفع صورة إيصال التحويل عبر صفحة الدفع في الموقع، أو أرسل صورة الإيصال مع اسمك ورقمك مباشرة لدعم الواتساب الخاص بالمنصة.',
      badge: 'تأكيد الطلب'
    },
    {
      num: '04',
      title: 'تفعيل الحساب والاستلام خلال 60 دقيقة',
      desc: 'يقوم فريق الدعم بمراجعة الإيصال وتفعيل حسابك فوراً على الموقع، وتزويدك بروابط التحميل المباشرة والبرامج وفيديوهات الشرح الدقيقة.',
      badge: 'استلام فوري'
    }
  ];

  return (
    <main className="min-h-screen bg-[#F7F9FA] text-[#0B1220] font-sans" dir="rtl">
      <HeaderNavbar session={session} settings={siteSettings} />

      {/* Hero Header */}
      <section className="bg-[#0B1220] text-white pt-32 pb-20 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          
          <nav className="mb-6 text-xs sm:text-sm text-gray-400" aria-label="Breadcrumb">
            <ol className="flex items-center justify-center gap-2">
              <li><a href="/" className="hover:text-[#2ECC8F] transition-colors">الرئيسية</a></li>
              <li className="text-gray-600">/</li>
              <li className="text-[#2ECC8F] font-semibold">طريقة الاشتراك والتفعيل</li>
            </ol>
          </nav>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0F9D58]/20 text-[#2ECC8F] text-xs font-black border border-[#2ECC8F]/30 mb-5">
            <Clock className="w-4 h-4" />
            <span>تفعيل فوري خلال أقل من 60 دقيقة</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-5 leading-tight text-white">
            كيف تبدأ وتشترك في <span className="text-[#2ECC8F]">منصة GROWIX؟</span>
          </h1>

          <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            خطوات بسيطة ومباشرة تمكّنك من استلام أدواتك وكورسك والتفعيل في نفس اليوم وبدون تعقيد.
          </p>

          <a
            href="/checkout?package=bundle-vip"
            className="inline-flex items-center gap-2 px-9 py-4 rounded-2xl bg-gradient-to-l from-[#0F9D58] to-[#2ECC8F] text-white font-extrabold text-sm sm:text-base shadow-xl shadow-[#0F9D58]/30 hover:scale-105 transition-transform"
          >
            <Sparkles className="w-5 h-5" />
            <span>اختر باقتك وابدأ الدفع الآن</span>
          </a>
        </div>
      </section>

      {/* Detailed Stepper */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {detailedSteps.map((step, idx) => (
              <div 
                key={idx}
                className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200 hover:border-[#0F9D58] shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start gap-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#0B1220] text-[#2ECC8F] font-black text-xl flex items-center justify-center shrink-0 shadow-md">
                  {step.num}
                </div>

                <div className="space-y-2 flex-1">
                  <div className="inline-block text-[11px] font-extrabold px-3 py-1 bg-[#0F9D58]/10 text-[#0F9D58] rounded-full mb-1">
                    {step.badge}
                  </div>
                  <h3 className="text-xl font-extrabold text-[#0B1220]">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Options Available */}
      <section className="py-20 bg-white border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B1220] mb-3">
              وسائل الدفع المقبولة
            </h2>
            <p className="text-sm text-gray-600">
              نوفر لك أكثر وسائل التحويل سهولة داخل مصر لضمان سرعة إنجاز معاملتك:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-[#F7F9FA] border border-gray-200 text-center space-y-3">
              <Smartphone className="w-10 h-10 text-[#0F9D58] mx-auto" />
              <h3 className="font-extrabold text-base text-[#0B1220]">فودافون كاش (Vodafone Cash)</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                تحويل مباشر من محفظتك إلى رقم فودافون كاش الخاص بالمنصة.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#F7F9FA] border border-gray-200 text-center space-y-3">
              <CreditCard className="w-10 h-10 text-[#0F9D58] mx-auto" />
              <h3 className="font-extrabold text-base text-[#0B1220]">تطبيق إنستا باي (InstaPay)</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                تحويل لحظي مباشر عبر معرف إنستا باي أو رقم الهاتف البنكي.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#F7F9FA] border border-gray-200 text-center space-y-3">
              <MessageSquare className="w-10 h-10 text-[#0F9D58] mx-auto" />
              <h3 className="font-extrabold text-base text-[#0B1220]">المحافظ الإلكترونية الأخرى</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                تحويل من أورانج كاش، إتصالات كاش، أو محفظة البنك الأهلي وبنك مصر.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Support SLA Callout */}
      <section className="py-16 bg-[#0B1220] text-white text-center">
        <div className="max-w-3xl mx-auto px-4 space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#0F9D58]/20 text-[#2ECC8F] flex items-center justify-center mx-auto border border-[#2ECC8F]/30">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            هل تحتاج مساعدة أثناء الشراء؟
          </h2>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            فريق الدعم الفني متواجد معك خطوة بخطوة للإجابة على استفساراتك وتأكيد تفعيل حسابك فوراً.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-growix-gradient hover:bg-growix-gradient-hover text-white font-extrabold text-sm shadow-lg transition-transform hover:scale-105"
            >
              <MessageSquare className="w-4 h-4" />
              <span>تحدث مع الدعم الفني عبر واتساب</span>
            </a>
            <a
              href="/faq"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/10 border border-white/20 text-white font-bold text-sm hover:bg-white/15 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              <span>تصفح الأسئلة الشائعة</span>
            </a>
          </div>
        </div>
      </section>

      <Footer settings={siteSettings} />
    </main>
  );
}
