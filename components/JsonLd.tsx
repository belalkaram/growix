import React from 'react';
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
    inLanguage: 'ar-EG',
    offers: {
      '@type': 'Offer',
      price: SITE_PRICING.fullPackagePrice,
      priceCurrency: 'EGP',
      availability: 'https://schema.org/InStock',
      url: `${baseUrl}/checkout?package=bundle-vip`,
    },
  };

  // 4. Product Schema (Full VIP Package)
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'GROWIX VIP Package - كورس التسويق الإلكتروني وحزمة الأدوات',
    description: 'باقة رقمية تشمل كورس التسويق الإلكتروني والأدوات التسويقية والدعم الفني.',
    image: [`${baseUrl}/images/packages/growix-vip-package.webp`],
    brand: {
      '@type': 'Brand',
      name: 'GROWIX',
    },
    sku: 'growix-vip-package',
    url: `${baseUrl}/`,
    offers: {
      '@type': 'Offer',
      price: SITE_PRICING.fullPackagePrice,
      priceCurrency: 'EGP',
      availability: 'https://schema.org/InStock',
      url: `${baseUrl}/checkout?package=bundle-vip`,
      itemCondition: 'https://schema.org/NewCondition',
    },
    review: SITE_CONFIG.testimonials.map((t) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: t.name,
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: t.rating.toString(),
        bestRating: '5',
        worstRating: '1',
      },
      reviewBody: t.content,
    })),
  };

  // 5. FAQ Page Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: SITE_CONFIG.faqs.slice(0, 4).map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  // 6. ItemList Schema (Exact 12 Tools)
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'أدوات التسويق الإلكتروني من GROWIX',
    description: '12 أداة تسويقية احترافية لأتمتة التسويق وتكبير الأعمال',
    numberOfItems: seoList.length,
    itemListElement: seoList.map((tool, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: tool.schemaName,
      url: `${baseUrl}/tools/${tool.slug}`,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
    </>
  );
};
