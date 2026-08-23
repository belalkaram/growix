require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    console.log('🔄 Updating Meta Pixel ID in site_settings...');
    await client.query(`
      INSERT INTO site_settings (key, value, updated_at)
      VALUES 
        ('facebook_pixel_id', '1628429855364583', NOW()),
        ('facebook_pixel_enabled', 'true', NOW())
      ON CONFLICT (key) DO UPDATE SET 
        value = EXCLUDED.value,
        updated_at = NOW();
    `);
    console.log('✅ Meta Pixel ID updated successfully in database.');
  } catch (err) {
    console.error('❌ Error updating pixel settings:', err);
  } finally {
    await client.end();
  }
}

main();
