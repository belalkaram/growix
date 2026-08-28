import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { encryptSensitiveData } from '../lib/encryption';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log('Seeding VAPID keys into site_settings...');
  
  const pubKey = 'BFbxB4bgdf7Gma1CyYovMBWe5oHKQ7Q6qvw_m5jJnAidpqq2IgqoHPmp2al8r_Pv-xbOzmmWl2CqMgRkWP8HvYg';
  const privKey = 'qltKO-8K6dM7vhLki5VONBiG-Sgl9VgyzS8SZ4mESBs';
  const encryptedPrivKey = encryptSensitiveData(privKey);
  const subject = 'mailto:admin@growix.app';

  await sql`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES ('vapid_public_key', ${pubKey}, now())
    ON CONFLICT (key) DO UPDATE SET value = ${pubKey}, updated_at = now();
  `;

  await sql`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES ('vapid_private_key', ${encryptedPrivKey}, now())
    ON CONFLICT (key) DO UPDATE SET value = ${encryptedPrivKey}, updated_at = now();
  `;

  await sql`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES ('vapid_subject', ${subject}, now())
    ON CONFLICT (key) DO UPDATE SET value = ${subject}, updated_at = now();
  `;

  console.log('✅ VAPID keys seeded into site_settings successfully!');
}

main().catch(err => {
  console.error('Error seeding VAPID keys:', err);
  process.exit(1);
});
