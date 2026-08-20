import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function main() {
  console.log('Fixing paymentProvider column in DB...');

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    // 1. Drop the default constraint
    await sql`ALTER TABLE orders ALTER COLUMN payment_provider DROP DEFAULT;`;
    console.log('✅ Dropped default constraint on payment_provider');

    // 2. Set existing values back to NULL for old orders.
    // If you want to be careful and only reset it for non-electronic wallets:
    // But since this was just added, and old ones shouldn't default to vodafone_cash, we will just set all to null.
    // They were added yesterday with the default 'vodafone_cash'.
    const result = await sql`UPDATE orders SET payment_provider = NULL;`;
    console.log(`✅ Reset payment_provider to NULL for existing orders.`);
    
    console.log('Done!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();
