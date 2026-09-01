'use server';

import { db } from '@/db';
import { users, orders, abandonedCheckouts, paymentTransactions, coupons, couponUsages } from '@/db/schema';
import { desc, eq, and, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';

/**
 * Ensures caller is an authorized admin
 */
async function ensureAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    throw new Error('غير مصرح بالوصول - يجب تسجيل الدخول كمدير نظام');
  }
}

/**
 * 👥 Export Users & Clients Data
 */
export async function getExportUsersData(filter?: { role?: string }) {
  await ensureAdmin();

  const query = db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      role: users.role,
      createdAt: users.createdAt,
      lastLoginAt: users.lastLoginAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  if (filter?.role && filter.role !== 'all') {
    return await query.where(eq(users.role, filter.role));
  }

  return await query;
}

/**
 * 📦 Export Subscription Orders Data
 */
export async function getExportOrdersData(filter?: { status?: string }) {
  await ensureAdmin();

  const query = db
    .select({
      id: orders.id,
      userId: orders.userId,
      userName: users.name,
      userEmail: users.email,
      userPhone: users.phone,
      senderNumber: orders.senderNumber,
      packageId: orders.packageId,
      toolId: orders.toolId,
      amount: orders.amount,
      originalAmount: orders.originalAmount,
      discountAmount: orders.discountAmount,
      couponCode: orders.couponCode,
      paymentMethod: orders.paymentMethod,
      paymentProvider: orders.paymentProvider,
      status: orders.status,
      approvalType: orders.approvalType,
      isTest: orders.isTest,
      adminNotes: orders.adminNotes,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .orderBy(desc(orders.createdAt));

  if (filter?.status && filter.status !== 'all') {
    return await query.where(eq(orders.status, filter.status));
  }

  return await query;
}

/**
 * 🛒 Export Abandoned Checkouts (Interested Leads)
 */
export async function getExportAbandonedCheckoutsData() {
  await ensureAdmin();

  return await db
    .select({
      id: abandonedCheckouts.id,
      phone: abandonedCheckouts.phone,
      packageId: abandonedCheckouts.packageId,
      toolId: abandonedCheckouts.toolId,
      amount: abandonedCheckouts.amount,
      couponCode: abandonedCheckouts.couponCode,
      isCompleted: abandonedCheckouts.isCompleted,
      createdAt: abandonedCheckouts.createdAt,
    })
    .from(abandonedCheckouts)
    .orderBy(desc(abandonedCheckouts.createdAt));
}

/**
 * 💳 Export Webhook Payment Transactions
 */
export async function getExportTransactionsData() {
  await ensureAdmin();

  return await db
    .select({
      id: paymentTransactions.id,
      transactionId: paymentTransactions.transactionId,
      provider: paymentTransactions.provider,
      amount: paymentTransactions.amount,
      senderPhone: paymentTransactions.senderPhone,
      senderName: paymentTransactions.senderName,
      walletPhone: paymentTransactions.walletPhone,
      referenceId: paymentTransactions.referenceId,
      status: paymentTransactions.status,
      reviewReason: paymentTransactions.reviewReason,
      rawMessage: paymentTransactions.rawMessage,
      createdAt: paymentTransactions.createdAt,
    })
    .from(paymentTransactions)
    .orderBy(desc(paymentTransactions.createdAt));
}

/**
 * ⚡ Quick Extraction: All Unique Verified Phone Numbers & Emails across the entire platform
 */
export async function getQuickExportStats() {
  await ensureAdmin();

  const [allUsers, allOrders, allAbandoned, allTransactions] = await Promise.all([
    db.select({ phone: users.phone, email: users.email, name: users.name }).from(users),
    db.select({ senderNumber: orders.senderNumber, status: orders.status, amount: orders.amount }).from(orders),
    db.select({ phone: abandonedCheckouts.phone }).from(abandonedCheckouts),
    db.select({ senderPhone: paymentTransactions.senderPhone }).from(paymentTransactions),
  ]);

  // Aggregate Unique Phones
  const phoneSet = new Set<string>();
  const customerPhonesSet = new Set<string>(); // Phones of customers who paid/ordered

  allUsers.forEach((u) => {
    if (u.phone && u.phone.trim().length >= 8) phoneSet.add(u.phone.trim());
  });

  allOrders.forEach((o) => {
    if (o.senderNumber && o.senderNumber.trim().length >= 8) {
      phoneSet.add(o.senderNumber.trim());
      if (o.status === 'approved') {
        customerPhonesSet.add(o.senderNumber.trim());
      }
    }
  });

  allAbandoned.forEach((a) => {
    if (a.phone && a.phone.trim().length >= 8) phoneSet.add(a.phone.trim());
  });

  allTransactions.forEach((t) => {
    if (t.senderPhone && t.senderPhone.trim().length >= 8 && t.senderPhone !== 'unknown') {
      phoneSet.add(t.senderPhone.trim());
    }
  });

  // Aggregate Unique Emails
  const emailSet = new Set<string>();
  allUsers.forEach((u) => {
    if (u.email && u.email.includes('@')) emailSet.add(u.email.trim().toLowerCase());
  });

  return {
    totalUniquePhones: phoneSet.size,
    totalCustomerPhones: customerPhonesSet.size,
    totalUniqueEmails: emailSet.size,
    totalUsers: allUsers.length,
    totalOrders: allOrders.length,
    totalAbandoned: allAbandoned.length,
    totalTransactions: allTransactions.length,
  };
}

/**
 * 📱 Direct Download Raw Phone List / Email List
 */
export async function getRawListForExport(type: 'all_phones' | 'customer_phones' | 'abandoned_phones' | 'all_emails') {
  await ensureAdmin();

  if (type === 'all_emails') {
    const userEmails = await db.select({ email: users.email }).from(users);
    const uniqueEmails = Array.from(
      new Set(userEmails.map((u) => u.email?.trim().toLowerCase()).filter(Boolean))
    );
    return uniqueEmails;
  }

  if (type === 'customer_phones') {
    const paidOrders = await db
      .select({ phone: orders.senderNumber })
      .from(orders)
      .where(eq(orders.status, 'approved'));
    const unique = Array.from(new Set(paidOrders.map((o) => o.phone?.trim()).filter(Boolean)));
    return unique;
  }

  if (type === 'abandoned_phones') {
    const abandoned = await db.select({ phone: abandonedCheckouts.phone }).from(abandonedCheckouts);
    const unique = Array.from(new Set(abandoned.map((a) => a.phone?.trim()).filter(Boolean)));
    return unique;
  }

  // 'all_phones'
  const [uList, oList, aList, tList] = await Promise.all([
    db.select({ phone: users.phone }).from(users),
    db.select({ phone: orders.senderNumber }).from(orders),
    db.select({ phone: abandonedCheckouts.phone }).from(abandonedCheckouts),
    db.select({ phone: paymentTransactions.senderPhone }).from(paymentTransactions),
  ]);

  const phoneSet = new Set<string>();
  [...uList, ...oList, ...aList, ...tList].forEach((item) => {
    if (item.phone && item.phone.trim().length >= 8 && item.phone !== 'unknown') {
      phoneSet.add(item.phone.trim());
    }
  });

  return Array.from(phoneSet);
}
