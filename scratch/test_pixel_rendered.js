require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function checkPixelConfig() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    const res = await client.query(`
      SELECT key, value FROM site_settings 
      WHERE key IN ('facebook_pixel_id', 'facebook_pixel_enabled');
    `);
    
    console.log('--- Database Site Settings ---');
    console.log(res.rows);

    console.log('--- Environment Variables ---');
    console.log('NEXT_PUBLIC_FACEBOOK_PIXEL_ID:', process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID);

    const pixelIdInDb = res.rows.find(r => r.key === 'facebook_pixel_id')?.value;
    const isEnabled = res.rows.find(r => r.key === 'facebook_pixel_enabled')?.value !== 'false';

    if (pixelIdInDb === '1628429855364583' && isEnabled) {
      console.log('✅ Pixel configuration is 100% active and correctly matched with ID 1628429855364583');
    } else {
      console.error('❌ Mismatch in Pixel configuration');
    }
  } catch (err) {
    console.error('Error checking DB:', err);
  } finally {
    await client.end();
  }
}

checkPixelConfig();
