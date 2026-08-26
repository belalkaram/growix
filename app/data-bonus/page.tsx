import React from 'react';
import { Metadata } from 'next';
import { SITE_CONFIG, SITE_PRICING } from '@/config/site';
import { getSiteSettings, getPackages } from '@/lib/queries';
import { auth } from '@/lib/auth';
import { MaintenanceScreen } from '@/components/MaintenanceScreen';
import { HeaderNavbar } from '@/components/HeaderNavbar';
import { Footer } from '@/components/Footer';
import { 
  Database, 
  Gift, 
  Check, 
  Sparkles, 
  MapPin, 
  Briefcase, 
  FileSpreadsheet, 
  ShieldCheck, 
  Download,
  CheckCircle2
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'هدية داتا مصر التسويقية | أكثر من 500 ألف جهة اتصال | GROWIX',
  description: 'احصل مجاناً على قاعدة بيانات مصر التسويقية مصنفة حسب المحافظات والقطاعات التجارية بصيغة Excel — عقارات، أطباء، تجارة إلكترونية، مهندسين، ومحلات.',
  keywords: [
    'داتا مصر التسويقية', 'قاعدة بيانات عملاء مصر', 'سحب داتا عملاء',
    'داتا عقارات مصر', 'داتا تجار وأطباء', 'داتا Excel مصر',
    'GROWIX data bonus', 'داتا تسويقية مجانية'
  ],
  alternates: { canonical: '/data-bonus' },
  openGraph: {
    title: 'هدية داتا مصر التسويقية | GROWIX',
    description: 'أكثر من 500,000 رقم وجهة اتصال مصنفة ومجهزة للاستخدام الإعلاني الفوري.',
    url: 'https://growix.belalkaram.dev/data-bonus',
    siteName: 'GROWIX',
    locale: 'ar_EG',
    type: 'website',
  },
};

export default async function DataBonusPage() {
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

  const governorates = [
    { name: 'القاهرة الكبرى والجيزة', count: '+150,000 جهة اتصال' },
    { name: 'الإسكندرية والساحل الشمالي', count: '+80,000 جهة اتصال' },
    { name: 'محافظات الدلتا والوجه البحري', count: '+120,000 جهة اتصال' },
    { name: 'محافظات القناة والشرقية', count: '+70,000 جهة اتصال' },
    { name: 'محافظات الصعيد والوجه القبلي', count: '+80,000 جهة اتصال' }
  ];

  const sectors = [
    { title: 'قطاع العقارات والمطورين', desc: 'أرقام مهتمين بشراء العقارات، المستثمرين، وسماسرة العقارات' },
    { title: 'التجارة الإلكترونية والتسوق', desc: 'متسوقون أونلاين وأصحاب محلات الملابس والموضة' },
    { title: 'الأطباء والعيادات والمراكز الطبية', desc: 'أطباء وصيادلة ومدراء مراكز طبية ومستشفيات' },
    { title: 'المهندسين والمكاتب والشركات', desc: 'شركات مقاولات، مهندسين ديكور، ومكاتب استشارية' },
    { title: 'أصحاب الأعمال والأنشطة التجاريّة', desc: 'مدراء شركات، أصحاب محلات، ومستوردين' }
  ];

  return (
    <main className="min-h-screen bg-[#F7F9FA] text-[#0B1220] font-sans" dir="rtl">
      <HeaderNavbar session={session} settings={siteSettings} />

      {/* Hero Header */}
      <section className="bg-[#0B1220] text-white pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full bg-[#0F9D58]/10 blur-3xl pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          <nav className="mb-6 text-xs sm:text-sm text-gray-400" aria-label="Breadcrumb">
            <ol className="flex items-center justify-center gap-2">
              <li><a href="/" className="hover:text-[#2ECC8F] transition-colors">الرئيسية</a></li>
              <li className="text-gray-600">/</li>
              <li className="text-[#2ECC8F] font-semibold">هدية داتا مصر</li>
            </ol>
          </nav>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2ECC8F]/20 text-[#2ECC8F] text-xs font-black border border-[#2ECC8F]/30 mb-6">
            <Gift className="w-4 h-4" />
            <span>بونص مجاني 100% مرفق مع الباقة</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-6 text-white">
            {SITE_CONFIG.bonus.title}
          </h1>

          <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto mb-10">
            {SITE_CONFIG.bonus.subtitle}. قاعدة بيانات حقيقية تم مراجعتها وتصنيفها لتخدم حملاتك على الواتساب، تليجرام، والإعلانات المباشرة بأعلى كفاءة.
          </p>

          <a
            href="/checkout?package=bundle-vip"
            className="inline-flex items-center gap-3 px-9 py-4 rounded-2xl bg-gradient-to-l from-[#0F9D58] to-[#2ECC8F] text-white font-extrabold text-sm sm:text-base shadow-xl shadow-[#0F9D58]/30 hover:scale-105 transition-transform"
          >
            <Sparkles className="w-5 h-5" />
            <span>احصل على الباقة الكاملة وم معها الداتا مجاناً</span>
          </a>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-16 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-3xl bg-[#F7F9FA] border border-gray-200 text-center">
              <FileSpreadsheet className="w-10 h-10 text-[#0F9D58] mx-auto mb-4" />
              <h3 className="font-extrabold text-base text-[#0B1220] mb-2">صيغ ملفات جاهزة Excel / CSV</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                ملفات منسقة ومنظمة يمكنك رفعها مباشرة إلى برامج إرسال الواتساب أو استخدامها في برامج التسويق.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#F7F9FA] border border-gray-200 text-center">
              <MapPin className="w-10 h-10 text-[#0F9D58] mx-auto mb-4" />
              <h3 className="font-extrabold text-base text-[#0B1220] mb-2">تصنيف جغرافي دقيق</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                مقسمة حسب المحافظات والمدن الرئيسية في مصر لضمان الاستهداف الجغرافي الدقيق لعملاء منطقتك.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#F7F9FA] border border-gray-200 text-center">
              <ShieldCheck className="w-10 h-10 text-[#0F9D58] mx-auto mb-4" />
              <h3 className="font-extrabold text-base text-[#0B1220] mb-2">بيانات مراجعة ومحدثة</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                تم تصفية الأرقام المكررة وغير الصحيحة لضمان الوصول لأعلى معدل تسليم في حملاتك.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Governorates Breakdown */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B1220] mb-3">
              توزيع الداتا حسب المحافظات
            </h2>
            <p className="text-sm text-gray-600">
              تغطي كافة الأقاليم والمحافظات التجارية الرئيسية في جمهورية مصر العربية:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {governorates.map((gov, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-[#0B1220] text-sm mb-1">{gov.name}</h3>
                  <span className="text-xs text-[#0F9D58] font-mono font-bold">{gov.count}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#0F9D58]/10 text-[#0F9D58] flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sectors Breakdown */}
      <section className="py-20 bg-white border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B1220] mb-3">
              التصنيف حسب القطاعات والأنشطة
            </h2>
            <p className="text-sm text-gray-600">
              اختر الفئة التي تناسب مجال عملك وابدأ استهدافهم فوراً:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sectors.map((sec, idx) => (
              <div key={idx} className="p-6 rounded-3xl bg-[#F7F9FA] border border-gray-200 flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-[#0B1220] text-[#2ECC8F] font-black flex items-center justify-center shrink-0 text-sm">
                  0{idx + 1}
                </div>
                <div>
                  <h3 className="font-extrabold text-[#0B1220] text-base mb-1">{sec.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{sec.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-[#0B1220] text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-black mb-4">
            احصل على <span className="text-[#2ECC8F]">الداتا + الكورس + 12 أداة</span> بـ {vipPrice} جنيه فقط
          </h2>
          <p className="text-gray-300 mb-8 text-sm sm:text-base">
            تفعيل فوري ورابط تحميل مباشر لجميع الملفات والبرامج بعد تأكيد الاشتراك.
          </p>
          <a
            href="/checkout?package=bundle-vip"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-gradient-to-l from-[#0F9D58] to-[#2ECC8F] text-white font-extrabold text-base shadow-xl shadow-[#0F9D58]/30 hover:scale-105 transition-transform"
          >
            <Sparkles className="w-5 h-5" />
            <span>اشترك في الباقة الكاملة واستلم فوراً</span>
          </a>
        </div>
      </section>

      <Footer settings={siteSettings} />
    </main>
  );
}
