import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getToolSeoBySlug, getAllToolsSeo, getTools, getSiteSettings, getPackages } from '@/lib/queries';
import { auth } from '@/lib/auth';
import { MaintenanceScreen } from '@/components/MaintenanceScreen';
import { HeaderNavbar } from '@/components/HeaderNavbar';
import { Footer } from '@/components/Footer';
import { SITE_CONFIG, SITE_PRICING } from '@/config/site';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const toolSeo = await getToolSeoBySlug(slug);

  if (!toolSeo) {
    return {
      title: 'الأداة غير موجودة | GROWIX',
      robots: { index: false, follow: false },
    };
  }

  return {
    title: toolSeo.metaTitle,
    description: toolSeo.metaDescription,
    keywords: toolSeo.keywords,
    alternates: {
      canonical: `/tools/${slug}`,
    },
    openGraph: {
      title: toolSeo.metaTitle,
      description: toolSeo.metaDescription,
      url: `https://growix.belalkaram.dev/tools/${slug}`,
      siteName: 'GROWIX',
      locale: 'ar_EG',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: toolSeo.metaTitle,
      description: toolSeo.metaDescription,
    },
  };
}

export default async function ToolDetailPage({ params }: Props) {
  const { slug } = await params;
  const [toolSeo, toolsList, siteSettings, packages, session] = await Promise.all([
    getToolSeoBySlug(slug),
    getTools(),
    getSiteSettings(),
    getPackages(),
    auth(),
  ]);

  if (!toolSeo) {
    notFound();
  }

  if (siteSettings?.maintenance_mode === 'true' && (session?.user as { role?: string })?.role !== 'admin') {
    return (
      <MaintenanceScreen
        message={siteSettings.maintenance_message}
        whatsappNumber={siteSettings.whatsapp_number}
        telegramUsername={siteSettings.telegram_username}
      />
    );
  }

  const singlePkg = packages.find((p) => p.id === 'single-tool') || SITE_CONFIG.packages.find((p) => p.id === 'single-tool') || SITE_CONFIG.packages[2];
  const vipPkg = packages.find((p) => p.id === 'bundle-vip') || SITE_CONFIG.packages.find((p) => p.id === 'bundle-vip') || SITE_CONFIG.packages[0];
  const singlePrice = singlePkg?.discountedPrice || SITE_PRICING.singleToolPrice;
  const vipPrice = vipPkg?.discountedPrice || SITE_PRICING.vipPackagePrice;
  const vipOriginalPrice = vipPkg?.originalPrice || SITE_PRICING.vipPackageOriginalPrice;

  // Find matching tool entity to get features and long description
  const toolData = toolsList.find((t) => t.id === toolSeo.toolId);

  // Dynamic Image mapping fallback based on toolId
  const toolImageUrl = `/tools/${toolSeo.toolId}.png`;

  // JSON-LD Product Schema
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: toolSeo.schemaName,
    description: toolSeo.schemaDescription,
    image: `https://growix.belalkaram.dev/tools/${toolSeo.toolId}.png`,
    brand: {
      '@type': 'Brand',
      name: 'GROWIX',
    },
    offers: {
      '@type': 'Offer',
      price: singlePrice,
      priceCurrency: 'EGP',
      availability: 'https://schema.org/InStock',
      url: `https://growix.belalkaram.dev/tools/${slug}`,
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: toolSeo.faqItems.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://growix.belalkaram.dev' },
      { '@type': 'ListItem', position: 2, name: 'الأدوات', item: 'https://growix.belalkaram.dev/tools' },
      { '@type': 'ListItem', position: 3, name: toolSeo.schemaName, item: `https://growix.belalkaram.dev/tools/${slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <main
        className="min-h-screen bg-[#F7F9FA] text-[#0B1220] font-sans"
        dir="rtl"
      >
        <HeaderNavbar session={session} settings={siteSettings} />

        <section className="bg-[#0B1220] text-white pt-32 pb-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0F9D58]/10 to-transparent pointer-events-none" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <nav className="mb-6 text-sm text-gray-400" aria-label="Breadcrumb">
              <ol className="flex items-center gap-2">
                <li><a href="/" className="hover:text-[#2ECC8F] transition-colors">الرئيسية</a></li>
                <li className="text-gray-600">/</li>
                <li><a href="/tools" className="hover:text-[#2ECC8F] transition-colors">الأدوات</a></li>
                <li className="text-gray-600">/</li>
                <li className="text-[#2ECC8F] font-semibold truncate max-w-xs">{toolSeo.schemaName}</li>
              </ol>
            </nav>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0F9D58]/20 text-[#2ECC8F] text-xs font-black border border-[#2ECC8F]/30 mb-5">
              <span>GROWIX — أداة تسويقية احترافية</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-5">
              {toolSeo.h1}
            </h1>

            <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-3xl mb-8">
              {toolSeo.metaDescription}
            </p>

            {/* H2 Keywords as feature pills */}
            <div className="flex flex-wrap gap-2 mb-10">
              {toolSeo.h2Keywords.map((kw, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-white text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC8F] shrink-0" />
                  {kw}
                </span>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={`/checkout?package=single-tool&tool=${toolSeo.toolId}`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-l from-[#0F9D58] to-[#2ECC8F] text-white font-extrabold text-sm shadow-xl shadow-[#0F9D58]/30 hover:scale-105 transition-transform"
              >
                <span>احصل على الأداة الآن — {singlePrice} جنيه فقط</span>
              </a>
              <a
                href="/checkout?package=bundle-vip"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/10 border border-white/20 text-white font-semibold text-sm hover:bg-white/15 transition-colors"
              >
                <span>أو احصل على الباقة الكاملة (12 أداة + كورس)</span>
              </a>
            </div>

            {/* Tool Preview Image Card */}
            <div className="mt-12 rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl bg-[#0B1220] max-w-3xl mx-auto">
              <img 
                src={toolImageUrl} 
                alt={toolSeo.schemaName} 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </section>

        {/* ─── Tool Features ─── */}
        {toolData && (
          <section className="py-20 bg-white">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl sm:text-3xl font-black text-[#0B1220] mb-6 text-center">
                مميزات واستخدامات {toolData.name}
              </h2>

              {toolData.longDesc && (
                <div className="max-w-3xl mx-auto mb-10 p-6 rounded-3xl bg-[#F7F9FA] border border-gray-200 text-sm text-gray-700 leading-relaxed font-medium text-center">
                  {toolData.longDesc}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {toolData.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3 p-5 rounded-2xl bg-[#F7F9FA] border border-gray-200">
                    <span className="w-6 h-6 rounded-full bg-[#0F9D58] text-white flex items-center justify-center shrink-0 text-xs font-black">✓</span>
                    <p className="text-sm sm:text-base font-medium text-gray-700 leading-relaxed">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ─── FAQ (Rich Snippets) ─── */}
        <section className="py-20 bg-[#F7F9FA]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B1220] mb-10 text-center">
              أسئلة شائعة حول{' '}
              <span className="text-[#0F9D58]">{toolSeo.schemaName.split('—')[0].trim()}</span>
            </h2>
            <div className="space-y-4">
              {toolSeo.faqItems.map((faq, i) => (
                <details
                  key={i}
                  className="group p-6 rounded-2xl bg-white border border-gray-200 hover:border-[#0F9D58]/40 transition-colors"
                >
                  <summary className="cursor-pointer font-bold text-[#0B1220] text-sm sm:text-base flex items-center justify-between gap-4 list-none">
                    <span>{faq.question}</span>
                    <span className="text-[#0F9D58] shrink-0 group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-4 text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Internal Link to Bundle ─── */}
        <section className="py-16 bg-[#0B1220] text-white text-center">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-black mb-4">
              وفّر أكثر مع <span className="text-[#2ECC8F]">الباقة الكاملة</span>
            </h2>
            <p className="text-gray-300 mb-8 text-sm sm:text-base">
              احصل على جميع الأدوات الـ 12 + كورس التسويق الإلكتروني + داتا مصر التسويقية — كل ده بـ {vipPrice} جنيه فقط بدل {vipOriginalPrice} جنيه.
            </p>
            <a
              href="/checkout?package=bundle-vip"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-gradient-to-l from-[#0F9D58] to-[#2ECC8F] text-white font-extrabold text-base shadow-xl shadow-[#0F9D58]/30 hover:scale-105 transition-transform"
            >
              احصل على الباقة الكاملة — {vipPrice} ج فقط
            </a>
          </div>
        </section>

        <Footer settings={siteSettings} />
      </main>
    </>
  );
}
