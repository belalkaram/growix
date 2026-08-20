import React from 'react';
import { getAllTransactionsForAdmin } from '@/lib/actions/transactions';
import { TransactionsClient } from './TransactionsClient';

export const dynamic = 'force-dynamic';

export default async function AdminTransactionsPage() {
  const transactions = await getAllTransactionsForAdmin();

  return <TransactionsClient initialTransactions={transactions} />;
}
