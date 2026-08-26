import React from 'react';
import { Metadata } from 'next';
import { SITE_CONFIG } from '@/config/site';
import { getSiteSettings } from '@/lib/queries';
import { auth } from '@/lib/auth';
import { MaintenanceScreen } from '@/components/MaintenanceScreen';
import { HeaderNavbar } from '@/components/HeaderNavbar';
import { Footer } from '@/components/Footer';
import { 
  ShieldCheck, 
  Users, 
  Award, 
  Clock, 
  Headphones, 
  Target, 
  Sparkles, 
  Zap, 
  TrendingUp, 
  CheckCircle2 
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'عن منصة GROWIX | الرؤية والقصة والمصداقية',
  description: 'تعرف على قصة منصة GROWIX — المنصة العربية الأولى لتقديم كورسات التسويق التطبيقية وأدوات الأتمتة المتقدمة بدون اشتراكات شهرية.',
  keywords: [
    'عن منصة growix', 'قصة growix', 'أدوات التسويق growix',
    'منصة التسويق الإلكتروني', 'مصداقية growix'
  ],
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'عن منصة GROWIX | رؤيتنا وقصتنا',
    description: 'شريكك في التوسع الرقمي وأتمتة التسويق بدون اشتراكات شهرية.',
    url: 'https://growix.belalkaram.dev/about',
    siteName: 'GROWIX',
    locale: 'ar_EG',
    type: 'website',
  },
};

export default async function AboutPage() {
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

  const pillars = [
    {
      title: 'بدون اشتراكات شهرية',
      desc: 'نحن نؤمن بحق العميل في امتلاك الأدوات والتطبيقات مدى الحياة بـ استثمار واحد شفاف دون رسوم خفية.',
      icon: Zap
    },
    {
      title: 'تطبيق عملي مبسط',
      desc: 'جميع شروحاتنا وكورساتنا تركز على التطبيق المباشر بالأمثلة الحية من السوق العربي لتسهيل الفهم والممارسة.',
      icon: Target
    },
    {
      title: 'أتمتة ذكية متكاملة',
      desc: 'أدواتنا تغطي المراسلات المباشرة (واتساب/تليجرام)، سحب الداتا، السوشيال ميديا، المونتاج، والذكاء الاصطناعي.',
      icon: TrendingUp
    },
    {
      title: 'دعم فني وتحديثات مستمرة',
      desc: 'فريق دعم فني متواجد لمساعدتك في التثبيت والحل الفوري لأي عقبة، مع تقديم تحديثات مجانية مدى الحياة.',
      icon: Headphones
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
              <li className="text-[#2ECC8F] font-semibold">عن منصة GROWIX</li>
            </ol>
          </nav>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0F9D58]/20 text-[#2ECC8F] text-xs font-black border border-[#2ECC8F]/30 mb-5">
            <ShieldCheck className="w-4 h-4" />
            <span>من نحن والرؤية</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-5 leading-tight text-white">
            منصة GROWIX... <span className="text-[#2ECC8F]">شركاؤك في صناعة النجاح الرقمي</span>
          </h1>

          <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            منصة عربية رائدة مكرسة لتمكين أصحاب الأعمال، المسوقين، والفريلانسرز من امتلاك أفضل ترسانة تسويقية تضمن مضاعفة المبيعات وأتمتة المهام بأقل مجهود.
          </p>
        </div>
      </section>

      {/* Story & Vision */}
      <section className="py-20 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
            
            <div className="md:col-span-7 space-y-5">
              <h2 className="text-2xl sm:text-3xl font-black text-[#0B1220]">
                قصتنا وهدفنا
              </h2>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-medium">
                تأسست منصة GROWIX لمعالجة مشكلتين رئيسيتين يواجههما رواد الأعمال والمسوقون في العالم العربي: **الارتفاع الباهظ لرسوم برامج التسويق والأتمتة الشهرية**، و**صعوبة الشروحات النظرية المعقدة**.
              </p>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-medium">
                لذا قمنا بجمع الـ 12 أداة تسويق الأكثر طلباً وإقرانها بكورس تطبيق عميق بصوت وصورة وداتا استهداف جاهزة — كل ذلك في باقة واحدة شفافة تدفع مرّة واحدة وتملكها مدى الحياة.
              </p>
            </div>

            <div className="md:col-span-5">
              <div className="p-8 rounded-3xl bg-[#0B1220] text-white shadow-xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#2ECC8F]/20 rounded-full blur-xl pointer-events-none" />
                <h3 className="text-xl font-extrabold text-[#2ECC8F]">أرقام وإنجازات GROWIX</h3>
                <div className="space-y-4 text-sm font-semibold">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-gray-300">العملاء والطلاب:</span>
                    <span className="text-white font-mono font-bold">+5,000 عميل</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-gray-300">الأدوات الاحترافية:</span>
                    <span className="text-white font-mono font-bold">12 أداة شتغّل 100%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-gray-300">سرعة التفعيل:</span>
                    <span className="text-[#2ECC8F] font-mono font-bold">أقل من 60 دقيقة</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-gray-300">قاعدة بيانات هدية:</span>
                    <span className="text-white font-mono font-bold">+500,000 رقم</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Core Pillars */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B1220] mb-3">
              ركائز منصة GROWIX
            </h2>
            <p className="text-sm text-gray-600">
              المبادئ التي نلتزم بها لتقديم أعلى قيمة لعملائنا في كل خطوة:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div key={idx} className="p-6 rounded-3xl bg-white border border-gray-200 hover:border-[#0F9D58] shadow-sm hover:shadow-md transition-all space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#0B1220] text-[#2ECC8F] flex items-center justify-center font-black">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-extrabold text-[#0B1220]">{pillar.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium">{pillar.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#0B1220] text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-black mb-4">
            انضم الآن إلى <span className="text-[#2ECC8F]">+5,000 مسوّق وتاجر</span>
          </h2>
          <p className="text-gray-300 mb-8 text-sm sm:text-base">
            امتلك الـ 12 أداة مع الكورس والداتا بـ 300 جنيه فقط واستلم تفعيلك فوراً.
          </p>
          <a
            href="/checkout?package=bundle-vip"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-gradient-to-l from-[#0F9D58] to-[#2ECC8F] text-white font-extrabold text-base shadow-xl shadow-[#0F9D58]/30 hover:scale-105 transition-transform"
          >
            <Sparkles className="w-5 h-5" />
            <span>اشترك الآن واستلم التفعيل</span>
          </a>
        </div>
      </section>

      <Footer settings={siteSettings} />
    </main>
  );
}
