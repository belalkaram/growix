import { Metadata } from 'next';
import { getTools, getAllToolsSeo, getSiteSettings } from '@/lib/queries';
import { auth } from '@/lib/auth';
import { HeaderNavbar } from '@/components/HeaderNavbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'جميع أدوات التسويق الإلكتروني | 12 برنامج تسويق احترافي | GROWIX',
  description: 'اكتشف الـ 12 أداة تسويقية الاحترافية من GROWIX — واتساب ماركتنج، تليجرام، فيسبوك بوت، انستجرام، Data Scraper، Socinator Dominator، Keyword Researcher ومزيد. أدوات التسويق الإلكتروني الشاملة.',
  keywords: [
    'أدوات التسويق الإلكتروني', 'برامج التسويق الإلكتروني', 'أدوات تسويق رقمي',
    'واتساب ماركتنج', 'تليجرام ماركتنج', 'فيسبوك بوت', 'انستجرام بوت',
    'سحب الداتا', 'Data Scraper', 'AI Marketing Tools', 'Socinator Dominator', 'Keyword Researcher Pro',
    'مونتاج فيديو', 'أتمتة السوشيال ميديا', 'GROWIX tools',
    'Marketing Tools Egypt', 'أفضل أدوات التسويق',
  ],
  alternates: { canonical: '/tools' },
  openGraph: {
    title: 'جميع أدوات التسويق الإلكتروني | 12 برنامج | GROWIX',
    description: 'الـ 12 أداة تسويقية الاحترافية من GROWIX لأتمتة وتكبير عملك.',
    url: 'https://growix.belalkaram.dev/tools',
    siteName: 'GROWIX',
    locale: 'ar_EG',
    type: 'website',
  },
};

export default async function ToolsIndexPage() {
  const [toolsList, allSeo, siteSettings, session] = await Promise.all([
    getTools(),
    getAllToolsSeo(),
    getSiteSettings(),
    auth(),
  ]);

  // JSON-LD ItemList schema for all 12 tools
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'أدوات التسويق الإلكتروني من GROWIX',
    description: '12 أداة تسويقية احترافية لأتمتة التسويق وزيادة المبيعات',
    numberOfItems: allSeo.length,
    itemListElement: allSeo.map((tool, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: tool.schemaName,
      description: tool.schemaDescription,
      url: `https://growix.belalkaram.dev/tools/${tool.slug}`,
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://growix.belalkaram.dev' },
      { '@type': 'ListItem', position: 2, name: 'جميع الأدوات', item: 'https://growix.belalkaram.dev/tools' },
    ],
  };

  // Group tools by category
  const toolsWithSlug = toolsList.map((tool) => {
    const seo = allSeo.find((s) => s.toolId === tool.id);
    return { ...tool, slug: seo?.slug };
  });

  const categoryGroups: Record<string, typeof toolsWithSlug> = {};
  toolsWithSlug.forEach((tool) => {
    if (!categoryGroups[tool.category]) categoryGroups[tool.category] = [];
    categoryGroups[tool.category].push(tool);
  });

  const categoryLabels: Record<string, string> = {
    messaging: 'أدوات المراسلة والإرسال الجماعي',
    social: 'أدوات السوشيال ميديا والأتمتة',
    data: 'أدوات سحب الداتا وتوليد العملاء',
    design: 'أدوات التصميم والمونتاج',
    ai: 'أدوات الذكاء الاصطناعي',
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <main className="min-h-screen bg-[#F7F9FA] text-[#0B1220] font-sans" dir="rtl">
        <HeaderNavbar session={session} />

        {/* Hero */}
        <section className="bg-[#0B1220] text-white pt-32 pb-16 text-center">
          <div className="max-w-4xl mx-auto px-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B1220] border border-[#2ECC8F]/30 text-[#2ECC8F] text-xs font-black mb-5">
              <span>حزمة GROWIX الشاملة</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-5 leading-tight">
              جميع أدوات التسويق الإلكتروني{' '}
              <span className="text-[#2ECC8F]">الـ 12 أداة الاحترافية</span>
            </h1>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-8">
              واتساب ماركتنج، تليجرام، فيسبوك، انستجرام، تيك توك، سحب داتا، Socinator Dominator، مونتاج فيديو، AI وأكثر — كل ده في مكان واحد.
            </p>
            <a
              href="/checkout?package=bundle-vip"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-l from-[#0F9D58] to-[#2ECC8F] text-white font-extrabold text-sm shadow-xl shadow-[#0F9D58]/30 hover:scale-105 transition-transform"
            >
              احصل على الباقة الكاملة — 500 جنيه فقط
            </a>
          </div>
        </section>

        {/* Tools by Category */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            {Object.entries(categoryGroups).map(([category, tools]) => (
              <div key={category}>
                <h2 className="text-xl sm:text-2xl font-black text-[#0B1220] mb-6 pb-3 border-b-2 border-[#0F9D58]/20">
                  {categoryLabels[category] ?? category}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {tools.map((tool) => (
                    <a
                      key={tool.id}
                      href={tool.slug ? `/tools/${tool.slug}` : '/checkout'}
                      className="group p-6 rounded-2xl bg-white border border-gray-200 hover:border-[#0F9D58] hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start gap-3 mb-4">
                        <span className="text-xs font-mono font-extrabold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg shrink-0">
                          #{tool.number}
                        </span>
                        {tool.badge && (
                          <span className="text-[11px] font-extrabold px-2.5 py-1 bg-[#0F9D58] text-white rounded-full">
                            {tool.badge}
                          </span>
                        )}
                      </div>
                      <h3 className="font-black text-[#0B1220] text-sm sm:text-base mb-2 group-hover:text-[#0F9D58] transition-colors leading-snug">
                        {tool.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{tool.shortDesc}</p>
                      <div className="mt-4 text-[#0F9D58] text-xs font-bold flex items-center gap-1">
                        <span>اعرف أكثر</span>
                        <span className="group-hover:-translate-x-1 transition-transform">←</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Bottom */}
        <section className="py-16 bg-[#0B1220] text-white text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-black mb-4">
              احصل على الـ <span className="text-[#2ECC8F]">12 أداة كاملة</span> بـ 500 جنيه فقط
            </h2>
            <p className="text-gray-300 mb-8">تفعيل فوري خلال أقل من 60 دقيقة مع دعم فني 24/7 وتحديثات مجانية مدى الحياة.</p>
            <a
              href="/checkout?package=bundle-vip"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-gradient-to-l from-[#0F9D58] to-[#2ECC8F] text-white font-extrabold text-base shadow-xl hover:scale-105 transition-transform"
            >
              اشترك الآن واستلم فوراً
            </a>
          </div>
        </section>

        <Footer settings={siteSettings} />
      </main>
    </>
  );
}
