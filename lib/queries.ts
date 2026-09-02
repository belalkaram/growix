import { db } from '../db';
import * as schema from '../db/schema';
import { eq, asc, desc } from 'drizzle-orm';
import { SITE_CONFIG, SITE_PRICING, PROMO_BAR_CONFIG, MarketingTool, PricingPackage, FAQItem, Testimonial } from '../config/site';
import { TOOLS_SEO, ToolSeoData } from '../config/seo';

// 1. Fetch all active packages with DB fallback to static SITE_CONFIG
export async function getPackages(): Promise<PricingPackage[]> {
  try {
    const dbPackages = await db
      .select()
      .from(schema.packages)
      .where(eq(schema.packages.isActive, true))
      .orderBy(asc(schema.packages.sortOrder));

    if (dbPackages && dbPackages.length > 0) {
      return dbPackages.map((pkg) => ({
        id: pkg.id,
        name: pkg.name,
        badge: pkg.badge || undefined,
        isPopular: pkg.isPopular,
        originalPrice: pkg.originalPrice,
        discountedPrice: pkg.discountedPrice,
        currency: pkg.currency,
        period: pkg.period,
        description: pkg.description,
        features: (pkg.features as { text: string; included: boolean; highlight?: boolean }[]) || [],
        ctaText: pkg.ctaText,
      }));
    }
  } catch (error) {
    console.error('Database fetch error (getPackages), falling back to static config:', error);
  }
  return [...SITE_CONFIG.packages, ...(SITE_CONFIG.standalonePackages || [])];
}

// 1.1. Fetch single package by id with DB fallback
export async function getPackageById(id: string): Promise<PricingPackage | null> {
  try {
    const [dbPkg] = await db
      .select()
      .from(schema.packages)
      .where(eq(schema.packages.id, id))
      .limit(1);

    if (dbPkg) {
      return {
        id: dbPkg.id,
        name: dbPkg.name,
        badge: dbPkg.badge || undefined,
        isPopular: dbPkg.isPopular,
        originalPrice: dbPkg.originalPrice,
        discountedPrice: dbPkg.discountedPrice,
        currency: dbPkg.currency,
        period: dbPkg.period,
        description: dbPkg.description,
        features: (dbPkg.features as { text: string; included: boolean; highlight?: boolean }[]) || [],
        ctaText: dbPkg.ctaText,
      };
    }
  } catch (error) {
    console.error(`Database fetch error (getPackageById: ${id}), falling back to static config:`, error);
  }
  return SITE_CONFIG.packages.find((p) => p.id === id) || SITE_CONFIG.standalonePackages?.find((p) => p.id === id) || null;
}

// 2. Fetch all active tools with DB fallback
export async function getTools(): Promise<MarketingTool[]> {
  try {
    const dbTools = await db
      .select()
      .from(schema.tools)
      .where(eq(schema.tools.isActive, true))
      .orderBy(asc(schema.tools.sortOrder));

    if (dbTools && dbTools.length > 0) {
      return dbTools
        .filter((t) => t.category !== 'other')
        .map((t) => ({
          id: t.id,
          number: t.number,
          name: t.name,
          category: t.category as MarketingTool['category'],
          badge: t.badge || undefined,
          shortDesc: t.shortDesc,
          longDesc: t.longDesc || undefined,
          features: (t.features as string[]) || [],
          iconName: t.iconName,
        }));
    }
  } catch (error) {
    console.error('Database fetch error (getTools), falling back to static config:', error);
  }
  return SITE_CONFIG.tools;
}

// 3. Fetch tool by slug or id with full SEO data
export async function getToolSeoBySlug(slug: string): Promise<ToolSeoData | null> {
  try {
    const dbSeo = await db
      .select()
      .from(schema.toolsSeo)
      .where(eq(schema.toolsSeo.slug, slug))
      .limit(1);

    if (dbSeo && dbSeo.length > 0) {
      const item = dbSeo[0];
      return {
        slug: item.slug,
        toolId: item.toolId,
        metaTitle: item.metaTitle,
        metaDescription: item.metaDescription,
        h1: item.h1,
        h2Keywords: (item.h2Keywords as string[]) || [],
        keywords: (item.keywords as string[]) || [],
        faqItems: (item.faqItems as { question: string; answer: string }[]) || [],
        schemaName: item.schemaName,
        schemaDescription: item.schemaDescription,
      };
    }
  } catch (error) {
    console.error(`Database fetch error (getToolSeoBySlug: ${slug}), falling back to static config:`, error);
  }
  return TOOLS_SEO.find((t) => t.slug === slug) || null;
}

// 4. Fetch all Tool SEO items (for sitemaps and index routes)
export async function getAllToolsSeo(): Promise<ToolSeoData[]> {
  try {
    const dbSeoList = await db.select().from(schema.toolsSeo);
    if (dbSeoList && dbSeoList.length > 0) {
      return dbSeoList.map((item) => ({
        slug: item.slug,
        toolId: item.toolId,
        metaTitle: item.metaTitle,
        metaDescription: item.metaDescription,
        h1: item.h1,
        h2Keywords: (item.h2Keywords as string[]) || [],
        keywords: (item.keywords as string[]) || [],
        faqItems: (item.faqItems as { question: string; answer: string }[]) || [],
        schemaName: item.schemaName,
        schemaDescription: item.schemaDescription,
      }));
    }
  } catch (error) {
    console.error('Database fetch error (getAllToolsSeo), falling back to static config:', error);
  }
  return TOOLS_SEO;
}

// 5. Fetch Site Settings (Key-Value)
export async function getSiteSettings(): Promise<Record<string, string>> {
  const fallbackSettings: Record<string, string> = {
    site_name: SITE_CONFIG.name,
    site_tagline: SITE_CONFIG.tagline,
    hero_title: SITE_CONFIG.heroTitle,
    hero_subtitle: SITE_CONFIG.heroSubtitle,
    whatsapp_number: SITE_CONFIG.whatsappNumber,
    whatsapp_display_number: SITE_CONFIG.whatsappDisplayNumber,
    telegram_username: SITE_CONFIG.telegramUsername,
    support_email: SITE_CONFIG.supportEmail,
    working_hours: SITE_CONFIG.workingHours,
    full_package_price: SITE_PRICING.fullPackagePrice,
    full_package_original_price: SITE_PRICING.fullPackageOriginalPrice,
    single_tool_price: SITE_PRICING.singleToolPrice,
    single_tool_original_price: SITE_PRICING.singleToolOriginalPrice,
    promo_bar_enabled: String(PROMO_BAR_CONFIG.enabled),
    promo_discount: PROMO_BAR_CONFIG.discount,
    promo_customer_limit: PROMO_BAR_CONFIG.customerLimit,
    promo_tool_count: PROMO_BAR_CONFIG.toolCount,
    promo_price: PROMO_BAR_CONFIG.price,
    promo_cta_text: 'احجز الآن مع التفعيل الفوري',
    promo_cta_link: '/checkout?package=bundle-vip',
    promo_custom_text: '',
  };

  try {
    const settingsList = await db.select().from(schema.siteSettings);
    if (settingsList && settingsList.length > 0) {
      const result: Record<string, string> = { ...fallbackSettings };
      settingsList.forEach((row) => {
        result[row.key] = row.value;
      });
      return result;
    }
  } catch (error) {
    console.error('Database fetch error (getSiteSettings), falling back to static config:', error);
  }
  return fallbackSettings;
}

// 6. Fetch active FAQs
export async function getFaqs(): Promise<FAQItem[]> {
  try {
    const dbFaqs = await db
      .select()
      .from(schema.faqs)
      .where(eq(schema.faqs.isActive, true))
      .orderBy(asc(schema.faqs.sortOrder));

    if (dbFaqs && dbFaqs.length > 0) {
      return dbFaqs.map((f) => ({
        question: f.question,
        answer: f.answer,
        category: f.category || undefined,
      }));
    }
  } catch (error) {
    console.error('Database fetch error (getFaqs), falling back to static config:', error);
  }
  return SITE_CONFIG.faqs;
}

// 7. Fetch active Testimonials
export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const dbTestimonials = await db
      .select()
      .from(schema.testimonials)
      .where(eq(schema.testimonials.isActive, true))
      .orderBy(asc(schema.testimonials.sortOrder));

    if (dbTestimonials && dbTestimonials.length > 0) {
      return dbTestimonials.map((t) => ({
        id: t.id,
        name: t.name,
        role: t.role,
        company: t.company || undefined,
        avatar: t.avatar,
        content: t.content,
        rating: t.rating,
        verified: t.verified,
        packageTaken: t.packageTaken,
      }));
    }
  } catch (error) {
    console.error('Database fetch error (getTestimonials), falling back to static config:', error);
  }
  return SITE_CONFIG.testimonials;
}
