'use server';

import { db } from '@/db';
import { orders, users, packages, tools } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createOrderAction(data: {
  packageId: string;
  toolId?: string;
  paymentMethod: string;
  senderNumber: string;
  amount: string;
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
        status: 'pending',
      })
      .returning();

    revalidatePath('/checkout');
    revalidatePath('/my-orders');
    revalidatePath('/admin/orders');

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
      status: orders.status,
      adminNotes: orders.adminNotes,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .orderBy(desc(orders.createdAt));
}
