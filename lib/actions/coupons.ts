'use server';

import { db } from '@/db';
import { coupons, couponUsages, users, orders } from '@/db/schema';
import { eq, desc, sql, and, lte, gte } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// Helper to ensure tables exist in case of runtime initialization
export async function ensureCouponsTableExists() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS coupons (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(50) NOT NULL UNIQUE,
        discount_percent INTEGER NOT NULL,
        valid_from TIMESTAMP NOT NULL DEFAULT NOW(),
        valid_until TIMESTAMP NOT NULL,
        usage_limit INTEGER DEFAULT 100,
        used_count INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        description TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS coupon_usages (
        id SERIAL PRIMARY KEY,
        coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
        discount_applied VARCHAR(50) NOT NULL,
        used_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
  } catch (err) {
    console.error('Error ensuring coupons tables exist:', err);
  }
}

// 1. Admin: Get all coupons
export async function getAllCouponsAction() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    throw new Error('غير مصرح بالوصول');
  }

  await ensureCouponsTableExists();

  try {
    const allCoupons = await db
      .select()
      .from(coupons)
      .orderBy(desc(coupons.createdAt));

    return { success: true, coupons: allCoupons };
  } catch (error: any) {
    console.error('Error getting coupons:', error);
    return { success: false, error: error.message || 'حدث خطأ أثناء جلب الكوبونات', coupons: [] };
  }
}

// 2. Admin: Get all users who used a specific coupon
export async function getCouponUsersAction(couponId: string) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    throw new Error('غير مصرح بالوصول');
  }

  await ensureCouponsTableExists();

  try {
    const usages = await db
      .select({
        id: couponUsages.id,
        discountApplied: couponUsages.discountApplied,
        usedAt: couponUsages.usedAt,
        orderId: couponUsages.orderId,
        userName: users.name,
        userEmail: users.email,
        userPhone: users.phone,
        orderStatus: orders.status,
        orderAmount: orders.amount,
      })
      .from(couponUsages)
      .innerJoin(users, eq(couponUsages.userId, users.id))
      .leftJoin(orders, eq(couponUsages.orderId, orders.id))
      .where(eq(couponUsages.couponId, couponId))
      .orderBy(desc(couponUsages.usedAt));

    return { success: true, users: usages };
  } catch (error: any) {
    console.error('Error getting coupon users:', error);
    return { success: false, error: error.message || 'حدث خطأ أثناء جلب مستخدمي الكوبون', users: [] };
  }
}

// 3. Admin: Create a new coupon
export async function createCouponAction(data: {
  code: string;
  discountPercent: number;
  validFrom?: string;
  validUntil: string;
  usageLimit?: number;
  description?: string;
  isActive?: boolean;
}) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  const cleanCode = data.code.trim().toUpperCase();
  if (!cleanCode) {
    return { success: false, error: 'يرجى إدخال كود الكوبون' };
  }

  if (!data.discountPercent || data.discountPercent <= 0 || data.discountPercent > 100) {
    return { success: false, error: 'نسبة الخصم يجب أن تكون بين 1% و 100%' };
  }

  if (!data.validUntil) {
    return { success: false, error: 'يرجى تحديد تاريخ انتهاء الصلاحية' };
  }

  await ensureCouponsTableExists();

  try {
    // Check if code already exists
    const existing = await db
      .select({ id: coupons.id })
      .from(coupons)
      .where(eq(sql`UPPER(${coupons.code})`, cleanCode))
      .limit(1);

    if (existing.length > 0) {
      return { success: false, error: 'كود الكوبون مسجل مسبقاً، يرجى اختيار كود آخر' };
    }

    const [newCoupon] = await db
      .insert(coupons)
      .values({
        code: cleanCode,
        discountPercent: Number(data.discountPercent),
        validFrom: data.validFrom ? new Date(data.validFrom) : new Date(),
        validUntil: new Date(data.validUntil),
        usageLimit: data.usageLimit !== undefined ? Number(data.usageLimit) : 100,
        usedCount: 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
        description: data.description?.trim() || null,
      })
      .returning();

    revalidatePath('/admin/coupons');
    revalidatePath('/checkout');

    return { success: true, coupon: newCoupon };
  } catch (error: any) {
    console.error('Error creating coupon:', error);
    return { success: false, error: error.message || 'حدث خطأ أثناء إضافة الكوبون' };
  }
}

// 4. Admin: Update coupon
export async function updateCouponAction(
  id: string,
  data: {
    code: string;
    discountPercent: number;
    validFrom?: string;
    validUntil: string;
    usageLimit?: number;
    description?: string;
    isActive?: boolean;
  }
) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  const cleanCode = data.code.trim().toUpperCase();
  if (!cleanCode) {
    return { success: false, error: 'يرجى إدخال كود الكوبون' };
  }

  if (!data.discountPercent || data.discountPercent <= 0 || data.discountPercent > 100) {
    return { success: false, error: 'نسبة الخصم يجب أن تكون بين 1% و 100%' };
  }

  try {
    const [updated] = await db
      .update(coupons)
      .set({
        code: cleanCode,
        discountPercent: Number(data.discountPercent),
        validFrom: data.validFrom ? new Date(data.validFrom) : undefined,
        validUntil: new Date(data.validUntil),
        usageLimit: data.usageLimit !== undefined ? Number(data.usageLimit) : 100,
        isActive: data.isActive !== undefined ? data.isActive : true,
        description: data.description?.trim() || null,
        updatedAt: new Date(),
      })
      .where(eq(coupons.id, id))
      .returning();

    revalidatePath('/admin/coupons');
    revalidatePath('/checkout');

    return { success: true, coupon: updated };
  } catch (error: any) {
    console.error('Error updating coupon:', error);
    return { success: false, error: error.message || 'حدث خطأ أثناء تعديل الكوبون' };
  }
}

// 5. Admin: Delete coupon
export async function deleteCouponAction(id: string) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  try {
    await db.delete(coupons).where(eq(coupons.id, id));
    revalidatePath('/admin/coupons');
    revalidatePath('/checkout');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting coupon:', error);
    return { success: false, error: error.message || 'حدث خطأ أثناء حذف الكوبون' };
  }
}

// 6. Admin: Toggle coupon status
export async function toggleCouponStatusAction(id: string, isActive: boolean) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  try {
    await db
      .update(coupons)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(coupons.id, id));

    revalidatePath('/admin/coupons');
    revalidatePath('/checkout');
    return { success: true };
  } catch (error: any) {
    console.error('Error toggling coupon status:', error);
    return { success: false, error: error.message || 'حدث خطأ أثناء تغيير حالة الكوبون' };
  }
}

// 7. Public / User: Validate Coupon & Calculate Discount
export async function validateCouponAction(code: string, originalPrice: number) {
  if (!code || !code.trim()) {
    return { success: false, error: 'يرجى إدخال كود الكوبون' };
  }

  const cleanCode = code.trim().toUpperCase();
  await ensureCouponsTableExists();

  try {
    const couponResults = await db
      .select()
      .from(coupons)
      .where(eq(sql`UPPER(${coupons.code})`, cleanCode))
      .limit(1);

    if (couponResults.length === 0) {
      return { success: false, error: 'كود الكوبون غير صحيح أو غير موجود' };
    }

    const coupon = couponResults[0];

    // Check if active
    if (!coupon.isActive) {
      return { success: false, error: 'هذا الكوبون متوقف حالياً وغير متاح للاستخدام' };
    }

    const now = new Date();

    // Check Start date
    if (new Date(coupon.validFrom) > now) {
      return { 
        success: false, 
        error: `هذا الكوبون لم يبدأ بعد، يبدأ في ${new Date(coupon.validFrom).toLocaleDateString('ar-EG')}` 
      };
    }

    // Check Expiry date
    if (new Date(coupon.validUntil) < now) {
      return { 
        success: false, 
        error: 'عذراً، هذا الكوبون انتهت فترة صلاحيته' 
      };
    }

    // Check Usage Limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { 
        success: false, 
        error: 'عذراً، تم استنفاذ الحد الأقصى لعدد مرات استخدام هذا الكوبون' 
      };
    }

    // Calculate discount amount
    const discountRate = coupon.discountPercent / 100;
    const discountAmount = Math.round(originalPrice * discountRate);
    const finalPrice = Math.max(0, originalPrice - discountAmount);

    return {
      success: true,
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        discountAmount,
        finalPrice,
        description: coupon.description,
      },
    };
  } catch (error: any) {
    console.error('Error validating coupon:', error);
    return { success: false, error: 'حدث خطأ أثناء التحقق من الكوبون' };
  }
}
