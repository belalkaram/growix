import { db } from '../db/index.js';
import { paymentTransactions } from '../db/schema.js';
import { desc } from 'drizzle-orm';

async function checkRecentTransactions() {
  const recent = await db
    .select()
    .from(paymentTransactions)
    .orderBy(desc(paymentTransactions.createdAt))
    .limit(5);

  if (recent.length === 0) {
    console.log("No transactions found in the database.");
  } else {
    console.log("Most recent transactions:");
    recent.forEach((t) => {
      console.log(`- ID: ${t.id} | Date: ${t.createdAt} | Provider: ${t.provider} | Status: ${t.status} | Amount: ${t.amount}`);
      console.log(`  Raw Message: ${t.rawMessage.substring(0, 50)}...`);
      console.log('--------------------------------------------------');
    });
  }
}

checkRecentTransactions().catch(console.error).finally(() => process.exit(0));
