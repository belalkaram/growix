'use server';

import { db } from '@/db';
import { orders, users, packages, tools, coupons, couponUsages, paymentTransactions, abandonedCheckouts } from '@/db/schema';
import { eq, desc, sql, and, gte, lte, or } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { sendTelegramOrderAlert, sendTelegramOrderStatusAlert, sendTelegramNewUserAlert } from '@/lib/telegram';
import { checkRateLimit } from '@/lib/rate-limit';
import { matchOrderWithRecentTransactions } from '@/lib/payments/matcher';
import { SITE_CONFIG, SITE_PRICING } from '@/config/site';
import bcrypt from 'bcryptjs';

/**
 * Validates and calculates the legitimate server-side price for a package and coupon
 */
async function computeServerOrderPrice(packageId: string, couponCode?: string | null): Promise<{
  originalPrice: number;
  discountedPrice: number;
  finalPrice: number;
  discountAmount: number;
  appliedCoupon?: any;
}> {
  let basePrice = 500;
  let originalPrice = 2000;

  try {
    const [dbPkg] = await db.select().from(packages).where(eq(packages.id, packageId)).limit(1);
    if (dbPkg) {
      basePrice = parseInt(dbPkg.discountedPrice.replace(/[^0-9]/g, '')) || 500;
      originalPrice = parseInt(dbPkg.originalPrice.replace(/[^0-9]/g, '')) || 2000;
    } else {
      if (packageId === 'bundle-vip') {
        basePrice = parseInt(SITE_PRICING.vipPackagePrice) || 500;
        originalPrice = parseInt(SITE_PRICING.vipPackageOriginalPrice) || 2000;
      } else if (packageId === 'bundle-premium') {
        basePrice = parseInt(SITE_PRICING.fullPackagePrice) || 300;
        originalPrice = parseInt(SITE_PRICING.fullPackageOriginalPrice) || 1200;
      } else if (packageId === 'single-tool') {
        basePrice = parseInt(SITE_PRICING.singleToolPrice) || 200;
        originalPrice = parseInt(SITE_PRICING.singleToolOriginalPrice) || 700;
      }
    }
  } catch (err) {
    console.error('Error fetching live package price in computeServerOrderPrice:', err);
    if (packageId === 'bundle-vip') {
      basePrice = parseInt(SITE_PRICING.vipPackagePrice) || 500;
      originalPrice = parseInt(SITE_PRICING.vipPackageOriginalPrice) || 2000;
    } else if (packageId === 'bundle-premium') {
      basePrice = parseInt(SITE_PRICING.fullPackagePrice) || 300;
      originalPrice = parseInt(SITE_PRICING.fullPackageOriginalPrice) || 1200;
    } else if (packageId === 'single-tool') {
      basePrice = parseInt(SITE_PRICING.singleToolPrice) || 200;
      originalPrice = parseInt(SITE_PRICING.singleToolOriginalPrice) || 700;
    }
  }

  let finalPrice = basePrice;
  let discountAmount = 0;
  let appliedCoupon: any = null;

  if (couponCode && couponCode.trim()) {
    const cleanCode = couponCode.trim().toUpperCase();
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(and(eq(sql`UPPER(${coupons.code})`, cleanCode), eq(coupons.isActive, true)))
      .limit(1);

    if (coupon) {
      const now = new Date();
      const notExpired = !coupon.validUntil || new Date(coupon.validUntil) > now;
      const notLimitReached = !coupon.usageLimit || coupon.usedCount < coupon.usageLimit;

      if (notExpired && notLimitReached) {
        discountAmount = Math.round((basePrice * coupon.discountPercent) / 100);
        finalPrice = Math.max(0, basePrice - discountAmount);
        appliedCoupon = coupon;
      }
    }
  }

  return {
    originalPrice,
    discountedPrice: basePrice,
    finalPrice,
    discountAmount,
    appliedCoupon,
  };
}

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
  // Guest Checkout Details:
  customerName?: string;
  customerEmail?: string;
}) {
  const session = await auth();
  let userId = session?.user?.id;
  let userRecord: any = null;
  let isGuestAccountCreated = false;
  let rawInitialPassword = '';

  if (!data.senderNumber || data.senderNumber.trim().length < 4) {
    return { success: false, error: 'يرجى كتابة رقم الهاتف أو المحفظة المحوّل منها بشكل صحيح' };
  }

  // 1. If user is a Guest (not logged in), validate & find or create user account
  if (!userId) {
    if (!data.customerName || data.customerName.trim().length < 2) {
      return { success: false, error: 'يرجى إدخال اسمك بالكامل (حرفين على الأقل)' };
    }

    if (!data.customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.customerEmail.trim())) {
      return { success: false, error: 'يرجى إدخال بريد إلكتروني صحيح لاستلام تفاصيل الحساب' };
    }

    const normalizedEmail = data.customerEmail.toLowerCase().trim();

    try {
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, normalizedEmail))
        .limit(1);

      if (existing && existing.length > 0) {
        userRecord = existing[0];
        userId = userRecord.id;
        // If user didn't have phone, update it
        if (!userRecord.phone && data.senderNumber) {
          await db.update(users).set({ phone: data.senderNumber.trim() }).where(eq(users.id, userRecord.id));
        }
      } else {
        // Auto-create new user account with password = senderNumber
        rawInitialPassword = data.senderNumber.trim();
        const hashedPassword = await bcrypt.hash(rawInitialPassword, 10);

        const [newUser] = await db
          .insert(users)
          .values({
            name: data.customerName.trim(),
            email: normalizedEmail,
            phone: data.senderNumber.trim(),
            passwordHash: hashedPassword,
            role: 'user',
          })
          .returning();

        userRecord = newUser;
        userId = newUser.id;
        isGuestAccountCreated = true;

        // Send Telegram alert for auto-created user from checkout
        try {
          await sendTelegramNewUserAlert({
            userId: newUser.id,
            userName: newUser.name,
            userEmail: newUser.email,
            userPhone: newUser.phone,
            role: newUser.role,
            source: 'guest_checkout',
            createdAt: newUser.createdAt,
          });
        } catch (tgErr) {
          console.error('Failed to send telegram new user alert:', tgErr);
        }
      }
    } catch (dbUserErr: any) {
      console.error('Error creating guest user:', dbUserErr);
      return { success: false, error: 'حدث خطأ أثناء تجهيز بيانات المستخدم، يرجى المحاولة مرة أخرى' };
    }
  } else {
    // Authenticated user: fetch user details
    const [fetchedUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId!))
      .limit(1);
    userRecord = fetchedUser;
  }

  // Rate Limiting on order submissions (Max 5 orders per 15 mins per user/IP)
  const rateLimit = await checkRateLimit({
    action: 'order',
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,
    customIdentifier: userId,
    errorMessage: 'تم إرسال عدة طلبات مؤخراً. يرجى الانتظار قليلاً أو التواصل مع الدعم الفني.',
  });

  if (!rateLimit.allowed) {
    return { success: false, error: rateLimit.error };
  }

  try {
    // 2. Server-side price calculation & tampering validation
    const computedPrice = await computeServerOrderPrice(data.packageId, data.couponCode);
    const clientAmountNum = parseInt((data.amount || '').replace(/[^0-9]/g, '')) || 0;

    // Reject tampering if client submitted an unauthorized amount differing from calculated price
    if (clientAmountNum !== computedPrice.finalPrice && clientAmountNum !== computedPrice.discountedPrice) {
      console.warn(`Price tampering detected for user ${userId}: client sent ${clientAmountNum}, expected ${computedPrice.finalPrice}`);
    }

    // Always use verified server-side final amount
    const verifiedAmount = computedPrice.finalPrice.toString();
    const verifiedOriginalAmount = computedPrice.originalPrice.toString();
    const verifiedDiscountAmount = computedPrice.discountAmount > 0 ? computedPrice.discountAmount.toString() : null;

    const isTestUser = userRecord?.role === 'test';

    const [newOrder] = await db
      .insert(orders)
      .values({
        userId: userId!,
        packageId: data.packageId,
        toolId: data.toolId || null,
        paymentMethod: data.paymentMethod,
        paymentProvider: data.paymentProvider || (data.paymentMethod === 'instapay' ? 'instapay' : 'vodafone_cash'),
        senderNumber: data.senderNumber.trim(),
        amount: verifiedAmount,
        originalAmount: verifiedOriginalAmount,
        discountAmount: verifiedDiscountAmount,
        couponCode: computedPrice.appliedCoupon ? computedPrice.appliedCoupon.code : null,
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
    else if (data.packageId === 'single-tool') packageName = 'باقة أداة فردية';
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

    // If coupon was validated & applied, record usage and increment used_count
    if (computedPrice.appliedCoupon) {
      try {
        const c = computedPrice.appliedCoupon;
        await db.insert(couponUsages).values({
          couponId: c.id,
          userId: userId!,
          orderId: newOrder.id,
          discountApplied: verifiedDiscountAmount || `${c.discountPercent}%`,
        });

        await db
          .update(coupons)
          .set({
            usedCount: c.usedCount + 1,
            updatedAt: new Date(),
          })
          .where(eq(coupons.id, c.id));
      } catch (couponErr) {
        console.error('Error recording coupon usage:', couponErr);
      }
    }

    // 🎯 Mark any matching abandoned checkout lead as completed
    try {
      await db
        .update(abandonedCheckouts)
        .set({
          isCompleted: true,
          updatedAt: new Date(),
        })
        .where(
          or(
            eq(abandonedCheckouts.phone, data.senderNumber.trim()),
            eq(abandonedCheckouts.userId, userId!)
          )
        );
    } catch (abandonedErr) {
      console.warn('Error updating abandoned checkout status:', abandonedErr);
    }

    // 🚀 Send Instant Telegram Bot Alert (Non-blocking / Background safe)
    sendTelegramOrderAlert({
      orderId: newOrder.id,
      userName: userRecord?.name || data.customerName || 'عميل GROWIX',
      userEmail: userRecord?.email || data.customerEmail || '—',
      userPhone: userRecord?.phone || data.senderNumber.trim(),
      packageName,
      toolName,
      amount: verifiedAmount,
      originalAmount: verifiedOriginalAmount,
      discountAmount: verifiedDiscountAmount,
      couponCode: computedPrice.appliedCoupon?.code,
      paymentMethod: data.paymentMethod,
      senderNumber: data.senderNumber.trim(),
      createdAt: newOrder.createdAt,
    }).catch((err) => console.error('Telegram dispatch error in order action:', err));

    // 🔑 Generate Magic Login Token for Instant 1-Click Access
    let magicToken = '';
    let magicLoginUrl = '';
    try {
      const { createMagicLoginToken, buildMagicLoginUrl } = await import('@/lib/magic-auth');
      magicToken = await createMagicLoginToken(userId!);
      magicLoginUrl = await buildMagicLoginUrl(magicToken);
    } catch (tokenErr) {
      console.error('Error generating magic token:', tokenErr);
    }

    // 📧 Dispatch Resend Welcome & Order Confirmation Email (Non-blocking)
    if (userRecord?.email) {
      try {
        const { sendWelcomeOrderEmail } = await import('@/lib/resend');
        const loginPassDisplay = isGuestAccountCreated 
          ? rawInitialPassword 
          : (userRecord.phone || data.senderNumber.trim() || 'كلمة المرور الخاصة بحسابك');

        sendWelcomeOrderEmail({
          to: userRecord.email,
          customerName: userRecord.name || data.customerName || 'عميلنا العزيز',
          packageName,
          orderId: newOrder.id,
          amount: verifiedAmount,
          senderNumber: data.senderNumber.trim(),
          loginEmail: userRecord.email,
          loginPassword: loginPassDisplay,
          magicLoginUrl: magicLoginUrl || 'https://growix.belalkaram.dev/login',
        }).catch((err) => console.error('[Resend] Error sending welcome email on order creation:', err));
      } catch (emailErr) {
        console.error('Error importing resend:', emailErr);
      }
    }

    // 🚀 Bidirectional Matching (Reverse Matching on checkout submit)
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

    return { 
      success: true, 
      orderId: newOrder.id, 
      magicToken: magicToken || undefined, 
      isAutoApproved,
      isNewAccount: isGuestAccountCreated,
    };
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, error: 'حدث خطأ أثناء حفظ الطلب، يرجى المحاولة مرة أخرى' };
  }
}

/**
 * Unified Approval Service
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

    // 🚀 Send Instant Telegram Bot Alert for Order Approval (Non-blocking / Background safe)
    sendTelegramOrderStatusAlert({
      orderId,
      status: 'approved',
      approvalType,
      adminNotes,
    }).catch((err) => console.error('Telegram dispatch error on order approval:', err));

    // 📧 Send Instant Approval Email via Resend
    try {
      const [orderRecord] = await db
        .select({
          orderId: orders.id,
          userId: orders.userId,
          packageId: orders.packageId,
          userName: users.name,
          userEmail: users.email,
        })
        .from(orders)
        .innerJoin(users, eq(orders.userId, users.id))
        .where(eq(orders.id, orderId))
        .limit(1);

      if (orderRecord && orderRecord.userEmail) {
        const { createMagicLoginToken, buildMagicLoginUrl } = await import('@/lib/magic-auth');
        const token = await createMagicLoginToken(orderRecord.userId);
        const magicLoginUrl = await buildMagicLoginUrl(token);

        let pkgName = 'باقة GROWIX';
        if (orderRecord.packageId === 'bundle-vip') pkgName = 'باقة VIP الشاملة (12 أداة + كورس)';
        else if (orderRecord.packageId === 'bundle-premium') pkgName = 'باقة Premium (12 أداة + داتا مصر)';
        else if (orderRecord.packageId === 'single-tool') pkgName = 'باقة أداة فردية';

        const { sendOrderApprovedEmail } = await import('@/lib/resend');
        sendOrderApprovedEmail({
          to: orderRecord.userEmail,
          customerName: orderRecord.userName,
          packageName: pkgName,
          orderId: orderRecord.orderId,
          magicLoginUrl,
        }).catch((err) => console.error('[Resend] Error sending approval email:', err));
      }
    } catch (emailErr) {
      console.error('Error dispatching approval email:', emailErr);
    }

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

      // 🚀 Send Instant Telegram Bot Alert for Order Rejection (Non-blocking / Background safe)
      sendTelegramOrderStatusAlert({
        orderId,
        status: 'rejected',
        adminNotes,
      }).catch((err) => console.error('Telegram dispatch error on order rejection:', err));
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

/**
 * 👑 Admin Manual Order & Subscription Creation for any registered user
 */
export async function createAdminManualOrderAction(data: {
  userId: string;
  packageId: string;
  toolId?: string;
  amount: string;
  originalAmount?: string;
  discountAmount?: string;
  couponCode?: string;
  paymentMethod?: string;
  paymentProvider?: string;
  senderNumber?: string;
  status: 'pending' | 'approved';
  isTest?: boolean;
  adminNotes?: string;
}) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return { success: false, error: 'غير مصرح بالوصول - يجب تسجيل الدخول كمدير نظام' };
  }

  if (!data.userId) {
    return { success: false, error: 'يرجى اختيار المستخدم المسجل أولاً' };
  }

  if (!data.packageId) {
    return { success: false, error: 'يرجى تحديد الباقة أو الأداة المطلوبة' };
  }

  try {
    // 1. Verify target user exists
    const [userRecord] = await db
      .select()
      .from(users)
      .where(eq(users.id, data.userId))
      .limit(1);

    if (!userRecord) {
      return { success: false, error: 'المستخدم المحدد غير موجود في قاعدة البيانات' };
    }

    // 2. Resolve package and tool names
    let packageName = 'باقة غير محددة';
    if (data.packageId === 'bundle-vip') packageName = 'باقة VIP الشاملة (12 أداة + كورس)';
    else if (data.packageId === 'bundle-premium') packageName = 'باقة Premium (12 أداة + داتا)';
    else if (data.packageId === 'single-tool') packageName = 'باقة أداة فردية';
    else {
      const [customPkg] = await db.select().from(packages).where(eq(packages.id, data.packageId)).limit(1);
      if (customPkg) packageName = customPkg.name;
    }

    let toolName: string | undefined = undefined;
    if (data.toolId) {
      const [matchedTool] = await db.select().from(tools).where(eq(tools.id, data.toolId)).limit(1);
      if (matchedTool) {
        toolName = matchedTool.name;
      }
    }

    const isTestOrder = Boolean(data.isTest || userRecord.role === 'test');
    const finalStatus = data.status || 'approved';
    const finalPaymentMethod = data.paymentMethod || 'تحويل يدوي / أدمن';
    const finalSenderNumber = (data.senderNumber && data.senderNumber.trim()) 
      ? data.senderNumber.trim() 
      : (userRecord.phone || 'لوحة تحكم الأدمن');
    const finalNotes = data.adminNotes || (finalStatus === 'approved' ? 'تم إضافة وتفعيل الاشتراك يدوياً بواسطة الأدمن' : 'طلب يدوي مسجل من لوحة الأدمن');

    // 3. Insert order into DB
    const [newOrder] = await db
      .insert(orders)
      .values({
        userId: userRecord.id,
        packageId: data.packageId,
        toolId: data.toolId || null,
        paymentMethod: finalPaymentMethod,
        paymentProvider: data.paymentProvider || 'manual',
        senderNumber: finalSenderNumber,
        amount: data.amount || '0',
        originalAmount: data.originalAmount || data.amount || '0',
        discountAmount: data.discountAmount || null,
        couponCode: data.couponCode || null,
        status: finalStatus,
        approvalType: 'manual',
        isTest: isTestOrder,
        adminNotes: finalNotes,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // 4. Send Instant Telegram Bot Alert (Non-blocking)
    if (finalStatus === 'approved') {
      sendTelegramOrderStatusAlert({
        orderId: newOrder.id,
        status: 'approved',
        approvalType: 'manual',
        adminNotes: finalNotes,
        userName: userRecord.name,
        userEmail: userRecord.email,
        userPhone: userRecord.phone,
        packageName,
        toolName,
        amount: newOrder.amount,
        paymentMethod: finalPaymentMethod,
        senderNumber: finalSenderNumber,
        updatedAt: newOrder.updatedAt,
      }).catch((err) => console.error('Telegram dispatch error on admin manual order approval alert:', err));
    } else {
      sendTelegramOrderAlert({
        orderId: newOrder.id,
        userName: userRecord.name,
        userEmail: userRecord.email,
        userPhone: userRecord.phone,
        packageName,
        toolName,
        amount: newOrder.amount,
        originalAmount: data.originalAmount,
        discountAmount: data.discountAmount,
        couponCode: data.couponCode,
        paymentMethod: finalPaymentMethod,
        senderNumber: finalSenderNumber,
        createdAt: newOrder.createdAt,
      }).catch((err) => console.error('Telegram dispatch error on admin manual order alert:', err));
    }

    revalidatePath('/admin/orders');
    revalidatePath('/admin/users');
    revalidatePath('/admin/analytics');
    revalidatePath('/admin');
    revalidatePath('/my-orders');

    return { success: true, orderId: newOrder.id };
  } catch (error: any) {
    console.error('Error in createAdminManualOrderAction:', error);
    return { success: false, error: 'حدث خطأ أثناء إضافة طلب الاشتراك للمستخدم' };
  }
}

