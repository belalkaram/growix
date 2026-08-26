import React from 'react';
import { Metadata } from 'next';
import { SITE_CONFIG, SITE_PRICING } from '@/config/site';
import { getSiteSettings, getPackages } from '@/lib/queries';
import { auth } from '@/lib/auth';
import { MaintenanceScreen } from '@/components/MaintenanceScreen';
import { HeaderNavbar } from '@/components/HeaderNavbar';
import { Footer } from '@/components/Footer';
import { 
  GraduationCap, 
  Check, 
  Video, 
  Clock, 
  Layers, 
  BookOpen, 
  Award, 
  Sparkles, 
  ArrowLeft,
  CheckCircle2,
  Users,
  PlayCircle
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'كورس التسويق الإلكتروني الشامل | منهج تطبيقي كامل | GROWIX',
  description: 'تعلم التسويق الإلكتروني من الصفر حتى الاحتراف — خطط التسويق، أتمتة الواتساب، إعلانات الممولة، سحب الداتا، والمونتاج. كورس تطبيقي 100% بدون تعقيد.',
  keywords: [
    'كورس تسويق إلكتروني', 'دورة تسويق رقمي', 'تعلم التسويق الإلكتروني',
    'أتمتة التسويق', 'استراتيجيات التسويق', 'إعلانات ممولة', 'تسويق واتساب',
    'GROWIX course', 'Digital Marketing Course Egypt'
  ],
  alternates: { canonical: '/course' },
  openGraph: {
    title: 'كورس التسويق الإلكتروني الشامل | GROWIX',
    description: 'منهج تطبيقي عملي لبناء حملاتك وتكبير مبيعاتك أوتوماتيكياً.',
    url: 'https://growix.belalkaram.dev/course',
    siteName: 'GROWIX',
    locale: 'ar_EG',
    type: 'website',
  },
};

export default async function CoursePage() {
  const [siteSettings, packages, session] = await Promise.all([
    getSiteSettings(),
    getPackages(),
    auth(),
  ]);

  const vipPkg = packages.find((p) => p.id === 'bundle-vip') || SITE_CONFIG.packages.find((p) => p.id === 'bundle-vip');
  const vipPrice = vipPkg?.discountedPrice || SITE_PRICING.vipPackagePrice;

  if (siteSettings?.maintenance_mode === 'true' && (session?.user as { role?: string })?.role !== 'admin') {
    return (
      <MaintenanceScreen
        message={siteSettings.maintenance_message}
        whatsappNumber={siteSettings.whatsapp_number}
        telegramUsername={siteSettings.telegram_username}
      />
    );
  }

  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'كورس التسويق الإلكتروني الشامل والأتمتة من GROWIX',
    description: SITE_CONFIG.course.description,
    provider: {
      '@type': 'Organization',
      name: 'GROWIX',
      sameAs: 'https://growix.belalkaram.dev',
    },
    inLanguage: 'ar-EG',
    offers: {
      '@type': 'Offer',
      price: vipPrice,
      priceCurrency: 'EGP',
      availability: 'https://schema.org/InStock',
      url: 'https://growix.belalkaram.dev/checkout?package=bundle-vip',
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://growix.belalkaram.dev' },
      { '@type': 'ListItem', position: 2, name: 'كورس التسويق', item: 'https://growix.belalkaram.dev/course' },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <main className="min-h-screen bg-[#F7F9FA] text-[#0B1220] font-sans" dir="rtl">
        <HeaderNavbar session={session} settings={siteSettings} />

        {/* Hero Banner */}
        <section className="bg-[#0B1220] text-white pt-32 pb-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0F9D58]/15 via-transparent to-transparent pointer-events-none" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            
            <nav className="mb-6 text-xs sm:text-sm text-gray-400" aria-label="Breadcrumb">
              <ol className="flex items-center justify-center gap-2">
                <li><a href="/" className="hover:text-[#2ECC8F] transition-colors">الرئيسية</a></li>
                <li className="text-gray-600">/</li>
                <li className="text-[#2ECC8F] font-semibold">محتوى الكورس الشامل</li>
              </ol>
            </nav>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F9D58]/20 text-[#2ECC8F] text-xs font-black border border-[#2ECC8F]/30 mb-6">
              <GraduationCap className="w-4 h-4" />
              <span>منهج عملي تطبيق 100%</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-6">
              {SITE_CONFIG.course.title}
            </h1>

            <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto mb-10">
              {SITE_CONFIG.course.subtitle} — تعلم كيف تبني خطة تسويقية متكاملة، تستهدف عملاءك بدقة، وتستخدم برامج الأتمتة لزيادة المبيعات بأقل مجهود.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/checkout?package=bundle-vip"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-l from-[#0F9D58] to-[#2ECC8F] text-white font-extrabold text-sm sm:text-base shadow-xl shadow-[#0F9D58]/30 hover:scale-105 transition-transform"
              >
                <Sparkles className="w-5 h-5" />
                <span>اشترك في الباقة الكاملة (الكورس + 12 أداة) — 500 ج</span>
              </a>
              <a
                href="/pricing"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/10 border border-white/20 text-white font-bold text-sm hover:bg-white/15 transition-colors"
              >
                <span>استعرض الباقات والأسعار</span>
              </a>
            </div>
          </div>
        </section>

        {/* Highlights Bar */}
        <section className="py-8 bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-2xl bg-[#F7F9FA]">
              <Video className="w-6 h-6 text-[#0F9D58] mx-auto mb-2" />
              <div className="text-sm font-extrabold text-[#0B1220]">فيديوهات HD مسجلة</div>
              <div className="text-xs text-gray-500">شرح صوت وصورة خطوة بخطوة</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#F7F9FA]">
              <Clock className="w-6 h-6 text-[#0F9D58] mx-auto mb-2" />
              <div className="text-sm font-extrabold text-[#0B1220]">وصول مدى الحياة</div>
              <div className="text-xs text-gray-500">شاهد في أي وقت ومن أي جهاز</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#F7F9FA]">
              <Layers className="w-6 h-6 text-[#0F9D58] mx-auto mb-2" />
              <div className="text-sm font-extrabold text-[#0B1220]">تطبيق عملي مباشر</div>
              <div className="text-xs text-gray-500">تمارين وأمثلة واقعية للسوق</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#F7F9FA]">
              <BookOpen className="w-6 h-6 text-[#0F9D58] mx-auto mb-2" />
              <div className="text-sm font-extrabold text-[#0B1220]">تحديثات مجانية</div>
              <div className="text-xs text-gray-500">إضافة دروس وإستراتيجيات جديدة</div>
            </div>
          </div>
        </section>

        {/* Course Topics Detailed Curriculum */}
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-2xl sm:text-3xl font-black text-[#0B1220] mb-3">
                محتوى ومنهج الكورس بالتفصيل
              </h2>
              <p className="text-sm text-gray-600">
                تم تصميم المنهج ليغطي كافة جوانب التسويق الرقمي الحديث، من الفكرة والتخطيط إلى الأتمتة وإغلاق المبيعات:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SITE_CONFIG.course.topics.map((topic, idx) => (
                <div 
                  key={idx}
                  className="p-6 rounded-3xl bg-white border border-gray-200 hover:border-[#0F9D58] hover:shadow-lg transition-all flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#0B1220] text-[#2ECC8F] font-black flex items-center justify-center shrink-0 text-sm shadow-md">
                    0{idx + 1}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[#0B1220] text-base mb-2 leading-snug">
                      {topic}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      شرح تطبيقي بالأمثلة الحية مع استخدام أدوات GROWIX لتحقيق أقصى استجابة من العملاء.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Target Audience Section */}
        <section className="py-20 bg-white border-t border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0F9D58]/10 text-[#0F9D58] text-xs font-black mb-3">
                <Users className="w-4 h-4" />
                <span>الجمهور المستهدف</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0B1220] mb-3">
                لمن تم إعداد هذا الكورس؟
              </h2>
              <p className="text-sm text-gray-600">
                الكورس يناسب جميع المستويات بدون الحاجة لخبرة برمجية أو تسويقية سابقة:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {SITE_CONFIG.course.audience.map((item, idx) => (
                <div 
                  key={idx}
                  className="p-6 rounded-3xl bg-[#F7F9FA] border border-gray-200 hover:border-[#0F9D58] hover:bg-white transition-all space-y-3"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#0B1220] text-[#2ECC8F] flex items-center justify-center font-black text-base shadow-sm">
                    #{idx + 1}
                  </div>
                  <h3 className="text-lg font-extrabold text-[#0B1220]">{item.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Banner */}
        <section className="py-16 bg-[#0B1220] text-white text-center">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-black mb-4">
              احصل على <span className="text-[#2ECC8F]">الكورس الكامل + الـ 12 أداة</span> بـ {vipPrice} جنيه فقط
            </h2>
            <p className="text-gray-300 mb-8 text-sm sm:text-base">
              تفعيل فوري لحسابك بعد الاشتراك مباشرة، مع دعم فني دائم وتحديثات مجانية.
            </p>
            <a
              href="/checkout?package=bundle-vip"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-gradient-to-l from-[#0F9D58] to-[#2ECC8F] text-white font-extrabold text-base shadow-xl shadow-[#0F9D58]/30 hover:scale-105 transition-transform"
            >
              <Sparkles className="w-5 h-5" />
              <span>اشترك الآن واستلم فوراً</span>
            </a>
          </div>
        </section>

        <Footer settings={siteSettings} />
      </main>
    </>
  );
}
