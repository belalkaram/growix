import { db } from '../db';
import { users } from '../db/schema';
import { like, or } from 'drizzle-orm';

async function checkUsers() {
  const allUsers = await db.select().from(users);
  console.log('Total users:', allUsers.length);
  for (const u of allUsers) {
    console.log(`ID: ${u.id} | Email: ${u.email} | Name: ${u.name} | Role: ${u.role}`);
  }
}

checkUsers().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
