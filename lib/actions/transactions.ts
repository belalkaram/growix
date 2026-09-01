'use server';

import { db } from '@/db';
import { paymentTransactions, orders, users } from '@/db/schema';
import { desc, eq, and, sql, ilike, or } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function getAllTransactionsForAdmin(filter?: {
  provider?: string;
  status?: string;
  search?: string;
}) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    throw new Error('غير مصرح بالوصول');
  }

  const conditions: any[] = [];

  if (filter?.provider && filter.provider !== 'all') {
    conditions.push(eq(paymentTransactions.provider, filter.provider));
  }

  if (filter?.status && filter.status !== 'all') {
    conditions.push(eq(paymentTransactions.status, filter.status));
  }

  if (filter?.search && filter.search.trim() !== '') {
    const q = `%${filter.search.trim()}%`;
    conditions.push(
      or(
        ilike(paymentTransactions.transactionId, q),
        ilike(paymentTransactions.senderPhone, q),
        ilike(paymentTransactions.rawMessage, q),
        ilike(paymentTransactions.amount, q)
      )
    );
  }

  const query = db
    .select({
      id: paymentTransactions.id,
      transactionId: paymentTransactions.transactionId,
      provider: paymentTransactions.provider,
      amount: paymentTransactions.amount,
      amountCents: paymentTransactions.amountCents,
      senderPhone: paymentTransactions.senderPhone,
      senderName: paymentTransactions.senderName,
      walletPhone: paymentTransactions.walletPhone,
      referenceId: paymentTransactions.referenceId,
      rawTransactionDate: paymentTransactions.rawTransactionDate,
      rawTransactionTime: paymentTransactions.rawTransactionTime,
      rawMessage: paymentTransactions.rawMessage,
      status: paymentTransactions.status,
      matchedOrderId: paymentTransactions.matchedOrderId,
      reviewReason: paymentTransactions.reviewReason,
      metadata: paymentTransactions.metadata,
      isDryRun: paymentTransactions.isDryRun,
      createdAt: paymentTransactions.createdAt,
      // Joined order details if matched
      orderAmount: orders.amount,
      orderStatus: orders.status,
      orderPackageId: orders.packageId,
      orderUserName: users.name,
      orderUserEmail: users.email,
      orderUserPhone: users.phone,
    })
    .from(paymentTransactions)
    .leftJoin(orders, eq(paymentTransactions.matchedOrderId, orders.id))
    .leftJoin(users, eq(orders.userId, users.id))
    .orderBy(desc(paymentTransactions.createdAt));

  if (conditions.length > 0) {
    return await query.where(and(...conditions));
  }

  return await query;
}

export async function deleteTransactionAction(transactionId: number) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  try {
    await db.delete(paymentTransactions).where(eq(paymentTransactions.id, transactionId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return { success: false, error: 'حدث خطأ أثناء حذف المعاملة' };
  }
}

