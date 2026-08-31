import { db } from '../db';
import { users, orders, magicTokens } from '../db/schema';
import { desc } from 'drizzle-orm';

async function main() {
  const latestUsers = await db.select().from(users).orderBy(desc(users.createdAt)).limit(5);
  console.log('Latest Users:', latestUsers.map(u => ({ id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role, createdAt: u.createdAt })));

  const latestOrders = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(5);
  console.log('Latest Orders:', latestOrders.map(o => ({ id: o.id, userId: o.userId, packageId: o.packageId, senderNumber: o.senderNumber, amount: o.amount, status: o.status, receiptUrl: o.receiptUrl, createdAt: o.createdAt })));

  const latestTokens = await db.select().from(magicTokens).orderBy(desc(magicTokens.createdAt)).limit(5);
  console.log('Latest Magic Tokens:', latestTokens.map(t => ({ id: t.id, userId: t.userId, usedAt: t.usedAt, expiresAt: t.expiresAt, createdAt: t.createdAt })));
}

main().catch(console.error);
