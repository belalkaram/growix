import { db } from '../db/index.js';
import { sql } from 'drizzle-orm';

async function addColumn() {
  try {
    await db.execute(sql`ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS reference_id VARCHAR(100);`);
    console.log("Column added successfully!");
  } catch (err) {
    console.error(err);
  }
}

addColumn().catch(console.error).finally(() => process.exit(0));
