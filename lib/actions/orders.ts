'use server';

import { db } from '@/db';
import { orders, users, packages, tools, coupons, couponUsages, paymentTransactions } from '@/db/schema';
import { eq, desc, sql, and, gte, lte } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { sendTelegramOrderAlert } from '@/lib/telegram';
import { checkRateLimit } from '@/lib/rate-limit';
import { matchOrderWithRecentTransactions } from '@/lib/payments/matcher';

export async function createOrderAction(data: {
  packageId: string;
  toolId?: string;
  paymentMethod: string;
  paymentProvider?: string;
  senderNumber: string;
  amount: string;
  originalAmount?: string;
  discountAmount?: string;
  couponCode?: string;
  receiptUrl?: string;
  receiptKey?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'يجب تسجيل الدخول أولاً لإرسال الطلب' };
  }

  // Rate Limiting on order submissions (Max 5 orders per 15 mins per user/IP)
  const rateLimit = await checkRateLimit({
    action: 'order',
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,
    customIdentifier: session.user.id,
    errorMessage: 'تم إرسال عدة طلبات مؤخراً. يرجى الانتظار قليلاً أو التواصل مع الدعم الفني.',
  });

  if (!rateLimit.allowed) {
    return { success: false, error: rateLimit.error };
  }

  if (!data.senderNumber || data.senderNumber.trim().length < 4) {
    return { success: false, error: 'يرجى كتابة رقم الهاتف أو المحفظة المحوّل منها بشكل صحيح' };
  }

  try {
    // Fetch user details first to check for test role and Telegram alert
    const [userRecord] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    const isTestUser = userRecord?.role === 'test';

    const [newOrder] = await db
      .insert(orders)
      .values({
        userId: session.user.id,
        packageId: data.packageId,
        toolId: data.toolId || null,
        paymentMethod: data.paymentMethod,
        paymentProvider: data.paymentProvider || (data.paymentMethod === 'instapay' ? 'instapay' : 'vodafone_cash'),
        senderNumber: data.senderNumber.trim(),
        amount: data.amount,
        originalAmount: data.originalAmount || data.amount,
        discountAmount: data.discountAmount || null,
        couponCode: data.couponCode ? data.couponCode.trim().toUpperCase() : null,
        receiptUrl: data.receiptUrl || null,
        receiptKey: data.receiptKey || null,
        isTest: isTestUser,
        status: 'pending',
      })
      .returning();

    // Fetch package / tool names
    let packageName = 'باقة غير محددة';
    if (data.packageId === 'bundle-vip') packageName = 'باقة VIP الشاملة (كورسات + 12 أداة + داتا)';
    else if (data.packageId === 'bundle-premium') packageName = 'باقة Premium (الـ 12 أداة + داتا مصر)';
    else {
      const [customPkg] = await db.select().from(packages).where(eq(packages.id, data.packageId)).limit(1);
      if (customPkg) packageName = customPkg.name;
    }

    let toolName: string | undefined = undefined;
    if (data.toolId) {
      const matchedTool = await db.select().from(tools).where(eq(tools.id, data.toolId)).limit(1);
      if (matchedTool.length > 0) {
        toolName = matchedTool[0].name;
      }
    }

    // If coupon code was provided, record coupon usage and increment used_count
    if (data.couponCode && data.couponCode.trim()) {
      try {
        const cleanCode = data.couponCode.trim().toUpperCase();
        const matchedCoupon = await db
          .select()
          .from(coupons)
          .where(eq(sql`UPPER(${coupons.code})`, cleanCode))
          .limit(1);

        if (matchedCoupon.length > 0) {
          const c = matchedCoupon[0];
          await db.insert(couponUsages).values({
            couponId: c.id,
            userId: session.user.id,
            orderId: newOrder.id,
            discountApplied: data.discountAmount || `${c.discountPercent}%`,
          });

          await db
            .update(coupons)
            .set({
              usedCount: c.usedCount + 1,
              updatedAt: new Date(),
            })
            .where(eq(coupons.id, c.id));
        }
      } catch (couponErr) {
        console.error('Error recording coupon usage:', couponErr);
      }
    }

    // 🚀 Send Instant Telegram Bot Alert (Non-blocking / Background safe)
    sendTelegramOrderAlert({
      orderId: newOrder.id,
      userName: userRecord?.name || session.user.name || 'عميل GROWIX',
      userEmail: userRecord?.email || session.user.email || '—',
      userPhone: userRecord?.phone || undefined,
      packageName,
      toolName,
      amount: data.amount,
      originalAmount: data.originalAmount,
      discountAmount: data.discountAmount,
      couponCode: data.couponCode,
      paymentMethod: data.paymentMethod,
      senderNumber: data.senderNumber.trim(),
      createdAt: newOrder.createdAt,
    }).catch((err) => console.error('Telegram dispatch error in order action:', err));

    // 🚀 Bidirectional Matching (Reverse Matching on checkout submit):
    // If the customer transferred money before clicking submit, link the transaction and auto-approve instantly!
    let isAutoApproved = false;
    try {
      const reverseMatch = await matchOrderWithRecentTransactions({
        id: newOrder.id,
        amount: newOrder.amount,
        paymentProvider: newOrder.paymentProvider || 'vodafone_cash',
        senderNumber: newOrder.senderNumber,
        createdAt: newOrder.createdAt,
      });

      if (reverseMatch.match && reverseMatch.transaction) {
        // 1. Link transaction in database
        await db
          .update(paymentTransactions)
          .set({
            status: 'AUTO_APPROVED',
            matchedOrderId: newOrder.id,
            isDryRun: false,
            reviewReason: 'EXACT_REVERSE_MATCH_ON_ORDER_CREATION',
            processedAt: new Date(),
          })
          .where(eq(paymentTransactions.id, reverseMatch.transaction.id));

        // 2. Auto-approve the order and activate all tools/videos
        await approveOrderCore({
          orderId: newOrder.id,
          approvalType: 'auto',
          matchedTransactionId: reverseMatch.transaction.transactionId,
          adminNotes: 'تم التفعيل التلقائي الفوري لمطابقة تحويل مالي سابق من الـ Webhook',
        });

        isAutoApproved = true;
      }
    } catch (matchErr) {
      console.error('Error during reverse auto-matching in createOrderAction:', matchErr);
    }

    revalidatePath('/checkout');
    revalidatePath('/my-orders');
    revalidatePath('/admin/orders');
    revalidatePath('/admin/coupons');
    revalidatePath('/admin');

    return { success: true, orderId: newOrder.id, isAutoApproved };
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, error: 'حدث خطأ أثناء حفظ الطلب، يرجى المحاولة مرة أخرى' };
  }
}

/**
 * Unified Approval Service (Phase 7)
 * Centralizes all side-effects and database updates for order approval.
 * Safe to call from Webhooks (Auto) or Admin Dashboard (Manual).
 */
export async function approveOrderCore(params: {
  orderId: string;
  approvalType: 'manual' | 'auto';
  provider?: string;
  matchedTransactionId?: string;
  adminNotes?: string;
}) {
  const { orderId, approvalType, matchedTransactionId, adminNotes } = params;

  try {
    await db
      .update(orders)
      .set({
        status: 'approved',
        approvalType: approvalType,
        matchedTransactionId: matchedTransactionId || null,
        adminNotes: adminNotes !== undefined ? adminNotes : undefined,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    // Note: Future integrations (Emails, SMS, access token generation) 
    // must be added here so both Manual and Auto approvals trigger them.

    return { success: true };
  } catch (error) {
    console.error('Error in approveOrderCore:', error);
    return { success: false, error: 'Failed to approve order core' };
  }
}

export async function updateOrderStatusAction(orderId: string, newStatus: 'approved' | 'rejected', adminNotes?: string) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  try {
    if (newStatus === 'approved') {
      await approveOrderCore({
        orderId,
        approvalType: 'manual',
        adminNotes
      });
    } else {
      await db
        .update(orders)
        .set({
          status: newStatus,
          adminNotes: adminNotes !== undefined ? adminNotes : undefined,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId));
    }

    revalidatePath('/admin/orders');
    revalidatePath('/my-orders');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, error: 'حدث خطأ أثناء تحديث حالة الطلب' };
  }
}

export async function deleteOrderAction(orderId: string) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  try {
    await db.delete(orders).where(eq(orders.id, orderId));
    revalidatePath('/admin/orders');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Error deleting order:', error);
    return { success: false, error: 'حدث خطأ أثناء حذف الطلب' };
  }
}

export async function getUserOrders(userId: string) {
  return await db
    .select({
      id: orders.id,
      packageId: orders.packageId,
      toolId: orders.toolId,
      paymentMethod: orders.paymentMethod,
      paymentProvider: orders.paymentProvider,
      senderNumber: orders.senderNumber,
      amount: orders.amount,
      originalAmount: orders.originalAmount,
      discountAmount: orders.discountAmount,
      couponCode: orders.couponCode,
      receiptUrl: orders.receiptUrl,
      receiptKey: orders.receiptKey,
      status: orders.status,
      adminNotes: orders.adminNotes,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));
}

export async function getAllOrdersForAdmin(filter?: {
  status?: string;
  startDate?: string;
  endDate?: string;
}) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    throw new Error('غير مصرح بالوصول');
  }

  const conditions: any[] = [];
  if (filter?.status && filter.status !== 'all') {
    conditions.push(eq(orders.status, filter.status));
  }
  if (filter?.startDate) {
    conditions.push(gte(orders.createdAt, new Date(filter.startDate)));
  }
  if (filter?.endDate) {
    conditions.push(lte(orders.createdAt, new Date(filter.endDate)));
  }

  const query = db
    .select({
      id: orders.id,
      userId: orders.userId,
      userName: users.name,
      userEmail: users.email,
      userPhone: users.phone,
      packageId: orders.packageId,
      toolId: orders.toolId,
      paymentMethod: orders.paymentMethod,
      paymentProvider: orders.paymentProvider,
      senderNumber: orders.senderNumber,
      amount: orders.amount,
      originalAmount: orders.originalAmount,
      discountAmount: orders.discountAmount,
      couponCode: orders.couponCode,
      receiptUrl: orders.receiptUrl,
      receiptKey: orders.receiptKey,
      isTest: orders.isTest,
      userRole: users.role,
      status: orders.status,
      adminNotes: orders.adminNotes,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .orderBy(desc(orders.createdAt));

  if (conditions.length > 0) {
    return await query.where(and(...conditions));
  }

  return await query;
}

export async function toggleOrderTestAction(orderId: string, isTest: boolean) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  try {
    await db
      .update(orders)
      .set({ isTest, updatedAt: new Date() })
      .where(eq(orders.id, orderId));

    revalidatePath('/admin/orders');
    revalidatePath('/admin/analytics');
    return { success: true };
  } catch (err: any) {
    console.error('Toggle order test error:', err);
    return { success: false, error: 'حدث خطأ أثناء تعديل حالة الطلب التجريبي' };
  }
}
