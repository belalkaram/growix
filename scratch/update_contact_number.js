require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log('Fetching existing site_settings...');
  const rows = await sql`SELECT * FROM site_settings`;
  console.log('Current site_settings count:', rows.length);

  const updates = [
    { key: 'whatsapp_number', value: '966507988705' },
    { key: 'whatsapp_display_number', value: '+966507988705' },
    { key: 'support_phone', value: '+966507988705' },
  ];

  for (const item of updates) {
    await sql`
      INSERT INTO site_settings (key, value, updated_at)
      VALUES (${item.key}, ${item.value}, NOW())
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value, updated_at = NOW()
    `;
    console.log(`Updated ${item.key} = ${item.value}`);
  }

  const check = await sql`SELECT * FROM site_settings WHERE key IN ('whatsapp_number', 'whatsapp_display_number', 'support_phone')`;
  console.log('Updated rows:', check);
}

main().catch(console.error);
