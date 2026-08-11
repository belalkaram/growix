import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import bcrypt from 'bcryptjs';
import * as schema from './schema';
import { SITE_CONFIG, SITE_PRICING, PROMO_BAR_CONFIG } from '../config/site';
import { TOOLS_SEO } from '../config/seo';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function main() {
  console.log('🌱 Starting database seeding for GROWIX...');

  // 1. Seed Packages
  console.log('📦 Seeding packages...');
  for (let i = 0; i < SITE_CONFIG.packages.length; i++) {
    const pkg = SITE_CONFIG.packages[i];
    await db.insert(schema.packages).values({
      id: pkg.id,
      name: pkg.name,
      badge: pkg.badge,
      isPopular: pkg.isPopular ?? false,
      originalPrice: pkg.originalPrice,
      discountedPrice: pkg.discountedPrice,
      currency: pkg.currency,
      period: pkg.period,
      description: pkg.description,
      features: pkg.features,
      ctaText: pkg.ctaText,
      sortOrder: i,
      isActive: true,
    }).onConflictDoUpdate({
      target: schema.packages.id,
      set: {
        name: pkg.name,
        originalPrice: pkg.originalPrice,
        discountedPrice: pkg.discountedPrice,
        features: pkg.features,
        updatedAt: new Date(),
      },
    });
  }

  // 2. Seed Tools & Tools SEO Data
  console.log('🛠️ Seeding 12 marketing tools & SEO data...');
  for (let i = 0; i < SITE_CONFIG.tools.length; i++) {
    const tool = SITE_CONFIG.tools[i];
    const seoData = TOOLS_SEO.find((s) => s.toolId === tool.id);
    const slug = seoData?.slug || tool.id;

    await db.insert(schema.tools).values({
      id: tool.id,
      slug: slug,
      number: tool.number,
      name: tool.name,
      category: tool.category,
      badge: tool.badge,
      shortDesc: tool.shortDesc,
      features: tool.features,
      iconName: tool.iconName,
      sortOrder: i,
      isActive: true,
    }).onConflictDoUpdate({
      target: schema.tools.id,
      set: {
        name: tool.name,
        shortDesc: tool.shortDesc,
        features: tool.features,
        updatedAt: new Date(),
      },
    });

    if (seoData) {
      await db.insert(schema.toolsSeo).values({
        toolId: tool.id,
        slug: seoData.slug,
        metaTitle: seoData.metaTitle,
        metaDescription: seoData.metaDescription,
        h1: seoData.h1,
        h2Keywords: seoData.h2Keywords,
        keywords: seoData.keywords,
        faqItems: seoData.faqItems,
        schemaName: seoData.schemaName,
        schemaDescription: seoData.schemaDescription,
      }).onConflictDoUpdate({
        target: schema.toolsSeo.toolId,
        set: {
          metaTitle: seoData.metaTitle,
          metaDescription: seoData.metaDescription,
          updatedAt: new Date(),
        },
      });
    }
  }

  // Also seed standalone SEO pages like 'digital-marketing-course' & 'egypt-marketing-data'
  for (const seoData of TOOLS_SEO) {
    if (seoData.toolId === 'course' || seoData.toolId === 'data-egypt') {
      await db.insert(schema.tools).values({
        id: seoData.toolId,
        slug: seoData.slug,
        number: 99,
        name: seoData.schemaName.split('—')[0].trim(),
        category: 'other',
        shortDesc: seoData.metaDescription,
        features: [],
        iconName: 'sparkles',
        sortOrder: 99,
        isActive: true,
      }).onConflictDoNothing();

      await db.insert(schema.toolsSeo).values({
        toolId: seoData.toolId,
        slug: seoData.slug,
        metaTitle: seoData.metaTitle,
        metaDescription: seoData.metaDescription,
        h1: seoData.h1,
        h2Keywords: seoData.h2Keywords,
        keywords: seoData.keywords,
        faqItems: seoData.faqItems,
        schemaName: seoData.schemaName,
        schemaDescription: seoData.schemaDescription,
      }).onConflictDoNothing();
    }
  }

  // 3. Seed Site Settings
  console.log('⚙️ Seeding site settings...');
  const settingsList = [
    { key: 'site_name', value: SITE_CONFIG.name },
    { key: 'site_tagline', value: SITE_CONFIG.tagline },
    { key: 'hero_title', value: SITE_CONFIG.heroTitle },
    { key: 'hero_subtitle', value: SITE_CONFIG.heroSubtitle },
    { key: 'whatsapp_number', value: SITE_CONFIG.whatsappNumber },
    { key: 'whatsapp_display_number', value: SITE_CONFIG.whatsappDisplayNumber },
    { key: 'telegram_username', value: SITE_CONFIG.telegramUsername },
    { key: 'support_email', value: SITE_CONFIG.supportEmail },
    { key: 'working_hours', value: SITE_CONFIG.workingHours },
    { key: 'full_package_price', value: SITE_PRICING.fullPackagePrice },
    { key: 'full_package_original_price', value: SITE_PRICING.fullPackageOriginalPrice },
    { key: 'single_tool_price', value: SITE_PRICING.singleToolPrice },
    { key: 'single_tool_original_price', value: SITE_PRICING.singleToolOriginalPrice },
    { key: 'promo_discount', value: PROMO_BAR_CONFIG.discount },
    { key: 'promo_customer_limit', value: PROMO_BAR_CONFIG.customerLimit },
    { key: 'payment_methods', value: JSON.stringify(SITE_CONFIG.paymentMethods) },
  ];

  for (const item of settingsList) {
    await db.insert(schema.siteSettings).values({
      key: item.key,
      value: item.value,
    }).onConflictDoUpdate({
      target: schema.siteSettings.key,
      set: { value: item.value, updatedAt: new Date() },
    });
  }

  // 4. Seed Testimonials
  console.log('💬 Seeding testimonials...');
  for (let i = 0; i < SITE_CONFIG.testimonials.length; i++) {
    const item = SITE_CONFIG.testimonials[i];
    await db.insert(schema.testimonials).values({
      id: item.id,
      name: item.name,
      role: item.role,
      company: item.company,
      avatar: item.avatar,
      content: item.content,
      rating: item.rating,
      verified: item.verified,
      packageTaken: item.packageTaken,
      sortOrder: i,
      isActive: true,
    }).onConflictDoNothing();
  }

  // 5. Seed FAQs
  console.log('❓ Seeding FAQs...');
  for (let i = 0; i < SITE_CONFIG.faqs.length; i++) {
    const faq = SITE_CONFIG.faqs[i];
    await db.insert(schema.faqs).values({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || 'عام',
      sortOrder: i,
      isActive: true,
    });
  }

  // 6. Seed Default Admin User
  console.log('🔑 Seeding Admin user...');
  const adminEmail = 'admin@growix.com';
  const defaultPassword = 'AdminPassword2026!';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  await db.insert(schema.users).values({
    name: 'GROWIX Admin',
    email: adminEmail,
    passwordHash: hashedPassword,
    role: 'admin',
    phone: '01019033661',
  }).onConflictDoUpdate({
    target: schema.users.email,
    set: {
      passwordHash: hashedPassword,
      role: 'admin',
    },
  });

  console.log('🎉 Seeding completed successfully!');
  console.log(`📌 Admin Credentials: Email: ${adminEmail} | Password: ${defaultPassword}`);
}

main().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
