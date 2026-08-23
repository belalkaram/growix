require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    console.log('🔄 Creating abandoned_checkouts table if not exists...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS abandoned_checkouts (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(100) NOT NULL,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        phone VARCHAR(50) NOT NULL,
        package_id VARCHAR(100),
        tool_id VARCHAR(100),
        amount VARCHAR(50),
        coupon_code VARCHAR(50),
        ip VARCHAR(100),
        user_agent TEXT,
        is_completed BOOLEAN DEFAULT FALSE NOT NULL,
        last_step INTEGER DEFAULT 3 NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_abandoned_checkouts_phone ON abandoned_checkouts(phone);
      CREATE INDEX IF NOT EXISTS idx_abandoned_checkouts_session ON abandoned_checkouts(session_id);
      CREATE INDEX IF NOT EXISTS idx_abandoned_checkouts_completed ON abandoned_checkouts(is_completed, updated_at DESC);
    `);
    console.log('✅ Table abandoned_checkouts created successfully.');
  } catch (err) {
    console.error('❌ Migration error:', err);
  } finally {
    await client.end();
  }
}

main();
