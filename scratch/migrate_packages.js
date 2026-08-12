// Script: Migrate packages in DB + update old orders
// Run with: node scratch/migrate_packages.js

require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

const now = new Date().toISOString();

// The 3 new packages
const packages = [
  {
    id: 'bundle-vip',
    name: 'باقة VIP الشاملة (كورسات + الـ 12 أداة + الداتا)',
    badge: '💎 الأقوى - الكل في واحد',
    is_popular: true,
    original_price: '2000',
    discounted_price: '500',
    currency: 'جنية',
    period: 'تفعيل مدى الحياة بدون اشتراكات',
    description: 'الباقة الذهبية الشاملة: أكثر من 1 تيرابايت كورسات التسويق الكاملة على MEGA + جميع الأدوات الـ 12 + هدية داتا مصر. كل ما تحتاجه في مكان واحد.',
    features: JSON.stringify([
      { text: 'أكثر من 1 تيرابايت كورسات تسويق إلكتروني متكاملة على MEGA', included: true, highlight: true },
      { text: 'جميع الأدوات التسويقية الـ 12 كاملة بجميع مميزاتها', included: true, highlight: true },
      { text: 'شرح فيديو بصوت وصورة عملي لكل أداة وطريقة ربطها بالحملات', included: true },
      { text: 'هدية مجانية: داتا مصر التسويقية (مقسمة بالمحافظات والأنشطة)', included: true, highlight: true },
      { text: 'دعم فني مباشر 24/7 عبر الواتساب وتحديثات مجانية مستمرة', included: true }
    ]),
    cta_text: 'احصل على الباقة VIP بـ 500 ج',
    is_active: true,
    sort_order: 1,
  },
  {
    id: 'bundle-premium',
    name: 'باقة Premium (الـ 12 أداة + الداتا)',
    badge: '⭐ الأكثر طلباً - وفّر أكثر',
    is_popular: false,
    original_price: '1200',
    discounted_price: '300',
    currency: 'جنية',
    period: 'تفعيل مدى الحياة بدون اشتراكات',
    description: 'احصل على جميع الأدوات الـ 12 بالكامل + هدية داتا مصر التسويقية. بدون الكورسات.',
    features: JSON.stringify([
      { text: 'جميع الأدوات التسويقية الـ 12 كاملة بجميع مميزاتها', included: true, highlight: true },
      { text: 'شرح فيديو بصوت وصورة عملي لكل أداة وطريقة ربطها بالحملات', included: true },
      { text: 'هدية مجانية: داتا مصر التسويقية (مقسمة بالمحافظات والأنشطة)', included: true, highlight: true },
      { text: 'دعم فني مباشر 24/7 عبر الواتساب وتحديثات مجانية مستمرة', included: true },
      { text: 'كورسات التسويق الإلكتروني الشاملة (+1 TB)', included: false }
    ]),
    cta_text: 'احصل على باقة Premium بـ 300 ج',
    is_active: true,
    sort_order: 2,
  },
  {
    id: 'single-tool',
    name: 'باقة برنامج واحد فقط',
    badge: 'اختر برنامجك المفضل',
    is_popular: false,
    original_price: '700',
    discounted_price: '200',
    currency: 'جنية',
    period: 'تفعيل دائم للبرنامج المختار',
    description: 'اختر أي أداة واحدة محددة من ترسانة أدواتنا الـ 12 المتاحة واحصل على تفعيلها وشرحها فوراً.',
    features: JSON.stringify([
      { text: 'برنامج واحد فقط من اختيارك (من بين الـ 12 أداة)', included: true, highlight: true },
      { text: 'فيديو شرح كامل للبرنامج المختار خطوة بخطوة', included: true },
      { text: 'دعم فني وتفعيل سريع للبرنامج المختار', included: true },
      { text: 'هدية مجانية: داتا مصر التسويقية', included: true, highlight: true },
      { text: 'باقي البرامج الـ 11 والكورسات الشاملة', included: false }
    ]),
    cta_text: 'اختر برنامجك واشترك بـ 200 ج',
    is_active: true,
    sort_order: 3,
  }
];

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    console.log('🔄 Starting packages migration...\n');

    for (const pkg of packages) {
      // Upsert each package (insert or update if exists)
      await client.query(
        `INSERT INTO packages (id, name, badge, is_popular, original_price, discounted_price, currency, period, description, features, cta_text, is_active, sort_order, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           badge = EXCLUDED.badge,
           is_popular = EXCLUDED.is_popular,
           original_price = EXCLUDED.original_price,
           discounted_price = EXCLUDED.discounted_price,
           currency = EXCLUDED.currency,
           period = EXCLUDED.period,
           description = EXCLUDED.description,
           features = EXCLUDED.features,
           cta_text = EXCLUDED.cta_text,
           is_active = EXCLUDED.is_active,
           sort_order = EXCLUDED.sort_order,
           updated_at = EXCLUDED.updated_at`,
        [
          pkg.id, pkg.name, pkg.badge, pkg.is_popular,
          pkg.original_price, pkg.discounted_price, pkg.currency,
          pkg.period, pkg.description, pkg.features,
          pkg.cta_text, pkg.is_active, pkg.sort_order, now
        ]
      );
      console.log(`✅ Upserted package: ${pkg.id} - ${pkg.name}`);
    }

    // Migrate old orders: bundle-vip (old) → bundle-premium
    // Old "bundle-vip" was the 12-tools package (300 EGP), now renamed to bundle-premium
    // Only migrate orders where amount = '300' (old VIP price) to avoid touching new VIP orders
    const res = await client.query(
      `UPDATE orders SET package_id = 'bundle-premium', updated_at = $1
       WHERE package_id = 'bundle-vip' AND amount = '300'
       RETURNING id`,
      [now]
    );
    console.log(`\n🔄 Migrated ${res.rowCount} old 'bundle-vip' (300 EGP) orders → 'bundle-premium'`);

    console.log('\n🎉 Migration completed successfully!');
  } catch (err) {
    console.error('❌ Migration error:', err.message);
  } finally {
    await client.end();
  }
}

main();
