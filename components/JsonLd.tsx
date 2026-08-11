import { SITE_CONFIG, SITE_PRICING } from '@/config/site';
import { TOOLS_SEO, ToolSeoData } from '@/config/seo';

interface JsonLdProps {
  toolsSeo?: ToolSeoData[];
}

export const JsonLd: React.FC<JsonLdProps> = ({ toolsSeo }) => {
  const seoList = toolsSeo && toolsSeo.length > 0 ? toolsSeo : TOOLS_SEO;
  const baseUrl = 'https://growix.belalkaram.dev';

  // 1. Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'GROWIX',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: SITE_CONFIG.tagline,
    sameAs: [
      `https://wa.me/${SITE_CONFIG.whatsappNumber}`,
      `https://t.me/${SITE_CONFIG.telegramUsername}`,
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: `+${SITE_CONFIG.whatsappNumber}`,
      contactType: 'customer service',
      areaServed: 'EG',
      availableLanguage: ['Arabic'],
    },
  };

  // 2. WebSite Schema
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'GROWIX',
    url: baseUrl,
    inLanguage: 'ar-EG',
    description: SITE_CONFIG.heroSubtitle,
  };

  // 3. Course Schema
  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: SITE_CONFIG.course.title,
    description: SITE_CONFIG.course.description,
    provider: {
      '@type': 'Organization',
      name: 'GROWIX',
      sameAs: baseUrl,
    },
    educationalCredentialAwarded: 'شهادة إتمام كورس التسويق الإلكتروني من GROWIX',
    inLanguage: 'ar-EG',
    offers: {
      '@type': 'Offer',
      price: SITE_PRICING.fullPackagePrice,
      priceCurrency: 'EGP',
      availability: 'https://schema.org/InStock',
      url: `${baseUrl}/checkout`,
    },
  };

  // 4. Product Schema (Full VIP Package + 12 Tools)
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'GROWIX VIP Package - كورس التسويق الإلكتروني وحزمة الـ 12 أداة',
    image: [`${baseUrl}/logo.png`],
    description: 'باقة النجاح المتكاملة: كورس تسويق من الصفر للاحتراف + 12 برنامج تسويق آلي وتسويق بالواتساب وفيس بوك وتليجرام + داتا مصر التسويقية.',
    brand: {
      '@type': 'Brand',
      name: 'GROWIX',
    },
    offers: {
      '@type': 'Offer',
      price: SITE_PRICING.fullPackagePrice,
      priceCurrency: 'EGP',
      priceValidUntil: '2026-12-31',
      availability: 'https://schema.org/InStock',
      url: `${baseUrl}/checkout`,
      itemCondition: 'https://schema.org/NewCondition',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '128',
    },
  };

  // 5. FAQ Page Schema (Rich Snippets in Google Search)
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: SITE_CONFIG.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'أدوات التسويق الإلكتروني من GROWIX',
            description: '12 أداة تسويقية احترافية لأتمتة التسويق وتكبير الأعمال',
            numberOfItems: seoList.filter((t) => t.toolId !== 'course' && t.toolId !== 'data-egypt').length,
            itemListElement: seoList
              .filter((t) => t.toolId !== 'course' && t.toolId !== 'data-egypt')
              .map((tool, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: tool.schemaName,
                url: `https://growix.belalkaram.dev/tools/${tool.slug}`,
              })),
          }),
        }}
      />
    </>
  );
};
