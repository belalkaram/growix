const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Read .env.local to get DATABASE_URL
const envPath = path.join(__dirname, '..', '.env.local');
let dbUrl = process.env.DATABASE_URL;

if (!dbUrl && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('DATABASE_URL=')) {
      dbUrl = trimmed.replace('DATABASE_URL=', '').replace(/["']/g, '');
      break;
    }
  }
}

if (!dbUrl) {
  console.error('DATABASE_URL is not set!');
  process.exit(1);
}

const sql = neon(dbUrl);

async function runMigration() {
  console.log('Running Phase 1 Migration for Payment Transactions & Orders...');

  // 1. Alter orders table
  console.log('1. Adding tracking columns to orders table...');
  await sql`
    ALTER TABLE orders 
    ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(50) DEFAULT 'vodafone_cash';
  `;
  await sql`
    ALTER TABLE orders 
    ADD COLUMN IF NOT EXISTS approval_type VARCHAR(20) DEFAULT 'manual';
  `;
  await sql`
    ALTER TABLE orders 
    ADD COLUMN IF NOT EXISTS matched_transaction_id VARCHAR(100);
  `;
  console.log('✔ orders table updated.');

  // 2. Create payment_transactions table
  console.log('2. Creating payment_transactions table...');
  await sql`
    CREATE TABLE IF NOT EXISTS payment_transactions (
      id SERIAL PRIMARY KEY,
      transaction_id VARCHAR(100) NOT NULL UNIQUE,
      provider VARCHAR(50) DEFAULT 'vodafone_cash' NOT NULL,
      amount VARCHAR(50) NOT NULL,
      amount_cents INTEGER NOT NULL,
      sender_phone VARCHAR(50) NOT NULL,
      sender_name VARCHAR(255),
      wallet_phone VARCHAR(50) NOT NULL,
      transaction_timestamp TIMESTAMP,
      raw_transaction_date VARCHAR(50),
      raw_transaction_time VARCHAR(50),
      raw_message TEXT NOT NULL,
      status VARCHAR(50) NOT NULL,
      matched_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
      review_reason TEXT,
      metadata JSONB,
      is_dry_run BOOLEAN DEFAULT true NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      processed_at TIMESTAMP
    );
  `;
  console.log('✔ payment_transactions table created.');

  // 3. Create helpful indexes
  console.log('3. Creating indexes for performance and rapid matching...');
  await sql`
    CREATE INDEX IF NOT EXISTS idx_payment_transactions_tx_id 
    ON payment_transactions(transaction_id);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_payment_transactions_phone_amount 
    ON payment_transactions(sender_phone, amount_cents);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_orders_phone_amount_status 
    ON orders(sender_number, amount, status);
  `;
  console.log('✔ Indexes verified.');

  // 4. Verify columns in payment_transactions
  const tableCheck = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'payment_transactions'
    ORDER BY ordinal_position;
  `;
  console.log('\nVerified payment_transactions columns:');
  tableCheck.forEach(col => console.log(` - ${col.column_name} (${col.data_type})`));

  console.log('\n✔ Phase 1 Database Migration Completed Successfully!');
}

runMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
