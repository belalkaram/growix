import { db } from '../db/index.js';
import { sql } from 'drizzle-orm';

async function migrateOrdersReceipt() {
  try {
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS receipt_url VARCHAR(1000);`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS receipt_key VARCHAR(500);`);
    console.log('Orders receipt columns added successfully!');
  } catch (err) {
    console.error('Migration error:', err);
  }
}

migrateOrdersReceipt().catch(console.error).finally(() => process.exit(0));
