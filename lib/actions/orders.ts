'use server';

import { db } from '@/db';
import { orders, users, packages, tools, coupons, couponUsages } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createOrderAction(data: {
  packageId: string;
  toolId?: string;
  paymentMethod: string;
  senderNumber: string;
  amount: string;
  originalAmount?: string;
  discountAmount?: string;
  couponCode?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'يجب تسجيل الدخول أولاً لإرسال الطلب' };
  }

  if (!data.senderNumber || data.senderNumber.trim().length < 6) {
    return { success: false, error: 'يرجى كتابة رقم الهاتف أو المحفظة المحوّل منها بشكل صحيح' };
  }

  try {
    const [newOrder] = await db
      .insert(orders)
      .values({
        userId: session.user.id,
        packageId: data.packageId,
        toolId: data.toolId || null,
        paymentMethod: data.paymentMethod,
        senderNumber: data.senderNumber.trim(),
        amount: data.amount,
        originalAmount: data.originalAmount || null,
        discountAmount: data.discountAmount || null,
        couponCode: data.couponCode ? data.couponCode.trim().toUpperCase() : null,
        status: 'pending',
      })
      .returning();

    // If coupon code was provided, record coupon usage and increment used_count
    if (data.couponCode) {
      try {
        const cleanCode = data.couponCode.trim().toUpperCase();
        const matchedCoupon = await db
          .select()
          .from(coupons)
          .where(eq(sql`UPPER(${coupons.code})`, cleanCode))
          .limit(1);

        if (matchedCoupon.length > 0) {
          const c = matchedCoupon[0];
          // Record usage in coupon_usages
          await db.insert(couponUsages).values({
            couponId: c.id,
            userId: session.user.id,
            orderId: newOrder.id,
            discountApplied: data.discountAmount || `${c.discountPercent}%`,
          });

          // Increment coupon used count
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

    revalidatePath('/checkout');
    revalidatePath('/my-orders');
    revalidatePath('/admin/orders');
    revalidatePath('/admin/coupons');

    return { success: true, orderId: newOrder.id };
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, error: 'حدث خطأ أثناء حفظ الطلب، يرجى المحاولة مرة أخرى' };
  }
}

export async function updateOrderStatusAction(orderId: string, newStatus: 'approved' | 'rejected', adminNotes?: string) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  try {
    await db
      .update(orders)
      .set({
        status: newStatus,
        adminNotes: adminNotes || null,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    revalidatePath('/admin/orders');
    revalidatePath('/my-orders');
    return { success: true };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, error: 'حدث خطأ أثناء تحديث حالة الطلب' };
  }
}

export async function getUserOrders() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  return await db
    .select({
      id: orders.id,
      packageId: orders.packageId,
      toolId: orders.toolId,
      paymentMethod: orders.paymentMethod,
      senderNumber: orders.senderNumber,
      amount: orders.amount,
      originalAmount: orders.originalAmount,
      discountAmount: orders.discountAmount,
      couponCode: orders.couponCode,
      status: orders.status,
      adminNotes: orders.adminNotes,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.userId, session.user.id))
    .orderBy(desc(orders.createdAt));
}

export async function getAllOrdersForAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    throw new Error('غير مصرح بالوصول');
  }

  return await db
    .select({
      id: orders.id,
      userId: orders.userId,
      userName: users.name,
      userEmail: users.email,
      userPhone: users.phone,
      packageId: orders.packageId,
      toolId: orders.toolId,
      paymentMethod: orders.paymentMethod,
      senderNumber: orders.senderNumber,
      amount: orders.amount,
      originalAmount: orders.originalAmount,
      discountAmount: orders.discountAmount,
      couponCode: orders.couponCode,
      status: orders.status,
      adminNotes: orders.adminNotes,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .orderBy(desc(orders.createdAt));
}

