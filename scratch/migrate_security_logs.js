require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    console.log('🔄 Creating security_logs table if not exists...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS security_logs (
        id SERIAL PRIMARY KEY,
        ip VARCHAR(100) NOT NULL,
        action VARCHAR(50) NOT NULL,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        identifier VARCHAR(255),
        user_agent TEXT,
        status VARCHAR(20) DEFAULT 'allowed' NOT NULL,
        details JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_security_logs_ip_action ON security_logs(ip, action, created_at);
    `);
    console.log('✅ Table security_logs created successfully.');
  } catch (err) {
    console.error('❌ Migration error:', err);
  } finally {
    await client.end();
  }
}

main();
