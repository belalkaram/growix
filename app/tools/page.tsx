import { Metadata } from 'next';
import { getTools, getAllToolsSeo, getSiteSettings, getPackages } from '@/lib/queries';
import { auth } from '@/lib/auth';
import { HeaderNavbar } from '@/components/HeaderNavbar';
import { Footer } from '@/components/Footer';
import { ToolsPageClient } from '@/components/ToolsPageClient';

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
  const [toolsList, allSeo, siteSettings, packages, session] = await Promise.all([
    getTools(),
    getAllToolsSeo(),
    getSiteSettings(),
    getPackages(),
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

  // Attach slug to each tool
  const toolsWithSlug = toolsList.map((tool) => {
    const seo = allSeo.find((s) => s.toolId === tool.id);
    return { ...tool, slug: seo?.slug };
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <main className="min-h-screen bg-[#F7F9FA] text-[#0B1220] font-sans" dir="rtl">
        <HeaderNavbar session={session} settings={siteSettings} />

        {/* Hero */}
        <section className="bg-[#0B1220] text-white pt-32 pb-20 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-[#0F9D58]/15 blur-3xl pointer-events-none" />
          
          <div className="max-w-4xl mx-auto px-4 relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-[#2ECC8F]/30 text-[#2ECC8F] text-xs font-black">
              <span>حزمة GROWIX الشاملة</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight">
              جميع أدوات التسويق الإلكتروني{' '}
              <span className="text-[#2ECC8F]">الـ 12 أداة الاحترافية</span>
            </h1>

            <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              واتساب ماركتنج، تليجرام، فيسبوك، انستجرام، تيك توك، سحب داتا، Socinator Dominator، Keyword Researcher ومزيد — كل ذلك في باقة متكاملة واحدة.
            </p>
          </div>
        </section>

        {/* Interactive Client-side Search, Category Filter and Rich Cards */}
        <section className="pb-24">
          <ToolsPageClient tools={toolsWithSlug} packages={packages} />
        </section>

        <Footer settings={siteSettings} />
      </main>
    </>
  );
}
