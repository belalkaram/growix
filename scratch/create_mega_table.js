// Script to create mega_links table directly via SQL
// Run with: node scratch/create_mega_table.js

require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS mega_links (
        id SERIAL PRIMARY KEY,
        package_id VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        mega_url TEXT NOT NULL,
        size_label VARCHAR(50),
        content_count VARCHAR(100),
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ mega_links table created successfully!');
  } catch (err) {
    console.error('❌ Error creating table:', err.message);
  } finally {
    await client.end();
  }
}

main();
