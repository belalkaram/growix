import { db } from '../db';
import { users } from '../db/schema';
import { createMagicLoginToken } from '../lib/magic-auth';

async function main() {
  const [u] = await db.select().from(users).limit(1);
  console.log('Testing token for user:', u.id);
  const token = await createMagicLoginToken(u.id);
  console.log('Generated token:', token);
}

main().catch(console.error);
