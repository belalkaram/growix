// Script to migrate coupons and fix Data Masr file key in DB
// Run: node scratch/migrate_coupons_and_fix_data.js

require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    console.log('--- 1. Creating coupons table ---');
    await client.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(50) NOT NULL UNIQUE,
        discount_percent INTEGER NOT NULL,
        valid_from TIMESTAMP NOT NULL DEFAULT NOW(),
        valid_until TIMESTAMP NOT NULL,
        usage_limit INTEGER DEFAULT 100,
        used_count INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        description TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ coupons table ready!');

    console.log('--- 2. Updating orders table columns ---');
    await client.query(`
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS original_amount VARCHAR(50);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount VARCHAR(50);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50);
    `);
    console.log('✅ orders table columns updated!');

    console.log('--- 3. Creating coupon_usages table ---');
    await client.query(`
      CREATE TABLE IF NOT EXISTS coupon_usages (
        id SERIAL PRIMARY KEY,
        coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
        discount_applied VARCHAR(50) NOT NULL,
        used_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ coupon_usages table ready!');

    console.log('--- 4. Updating Egypt Marketing Data file key ---');
    const updateRes = await client.query(`
      UPDATE package_files 
      SET file_key = 'data/Data masr.rar', 
          file_type = 'rar',
          file_name = 'هدية داتا مصر التسويقية الشاملة',
          description = 'قاعدة بيانات تسويقية ضخمة محدثة ومقسمة بدقة عالية حسب المحافظات والأنشطة.'
      WHERE file_key = 'DOC-20250827-WA0081._' OR category = 'data';
    `);
    console.log(`✅ Updated ${updateRes.rowCount} rows for Egypt Marketing Data in package_files!`);

    // Insert sample promo coupon if none exists
    const existing = await client.query(`SELECT id FROM coupons LIMIT 1;`);
    if (existing.rows.length === 0) {
      await client.query(`
        INSERT INTO coupons (code, discount_percent, valid_from, valid_until, usage_limit, used_count, is_active, description)
        VALUES 
          ('GROWIX20', 20, NOW(), NOW() + INTERVAL '30 days', 50, 0, TRUE, 'كوبون خصم 20% ترحيبي لجميع الباقات'),
          ('VIP50', 50, NOW(), NOW() + INTERVAL '15 days', 20, 0, TRUE, 'خصم خاص 50% للمشتركين الأوائل');
      `);
      console.log('✅ Sample coupons inserted (GROWIX20, VIP50)!');
    }

  } catch (err) {
    console.error('❌ Error executing migration:', err.message);
  } finally {
    await client.end();
  }
}

main();
