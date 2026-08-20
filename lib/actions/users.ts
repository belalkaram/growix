'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { checkRateLimit } from '@/lib/rate-limit';
import crypto from 'crypto';

const registerSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  phone: z.string().optional(),
});

export async function registerUser(formData: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  turnstileToken?: string;
}) {
  try {
    // 1. Rate Limiting Protection (Max 5 accounts per IP per 10 minutes)
    const rateLimit = await checkRateLimit({
      action: 'register',
      maxRequests: 5,
      windowMs: 10 * 60 * 1000,
      customIdentifier: formData.email,
      errorMessage: 'تم تجاوز الحد المسموح به لإنشاء الحسابات (الحد الأقصى 5 حسابات خلال 10 دقائق). يرجى المحاولة لاحقاً.',
    });

    if (!rateLimit.allowed) {
      return { success: false, error: rateLimit.error };
    }

    // 2. Verify Cloudflare Turnstile CAPTCHA
    if (formData.turnstileToken) {
      const turnstileRes = await verifyTurnstileToken(formData.turnstileToken);
      if (!turnstileRes.success) {
        return { success: false, error: turnstileRes.error };
      }
    }

    const validated = registerSchema.parse(formData);
    const normalizedEmail = validated.email.toLowerCase().trim();

    // Check if user already exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existing && existing.length > 0) {
      return { success: false, error: 'البريد الإلكتروني مسجل بالفعل' };
    }

    const hashedPassword = await bcrypt.hash(validated.password, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        name: validated.name,
        email: normalizedEmail,
        passwordHash: hashedPassword,
        phone: validated.phone || null,
        role: 'user',
      })
      .returning();

    return {
      success: true,
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    };
  } catch (error: any) {
    if (error?.issues && error.issues.length > 0) {
      return { success: false, error: error.issues[0].message };
    }
    console.error('Registration error:', error);
    return { success: false, error: 'حدث خطأ أثناء إنشاء الحساب' };
  }
}

export async function getUsers() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    throw new Error('غير مصرح بالوصول');
  }

  return await db.select().from(users).orderBy(desc(users.createdAt));
}

// 1. Admin Create User Manually
export async function createUserManualAction(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'admin' | 'user' | 'test';
}) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  try {
    const normalizedEmail = data.email.toLowerCase().trim();
    if (!normalizedEmail || !data.password || !data.name) {
      return { success: false, error: 'جميع الحقول الأساسية مطلوبة' };
    }

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existing && existing.length > 0) {
      return { success: false, error: 'البريد الإلكتروني مسجل مسبقاً' };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        name: data.name.trim(),
        email: normalizedEmail,
        passwordHash: hashedPassword,
        phone: data.phone?.trim() || null,
        role: data.role || 'user',
      })
      .returning();

    revalidatePath('/admin/users');
    return { success: true, user: newUser };
  } catch (err: any) {
    console.error('Create user error:', err);
    return { success: false, error: 'حدث خطأ أثناء إنشاء المستخدم' };
  }
}

// 2. Admin Create User Automatically with 1-Click
export async function createUserAutoAction(role: 'admin' | 'user' | 'test' = 'user') {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  try {
    const randomSuffix = crypto.randomBytes(3).toString('hex');
    const autoName = role === 'test' 
      ? `مستخدم تجريبي #${randomSuffix.toUpperCase()}`
      : `عميل GROWIX #${randomSuffix.toUpperCase()}`;
    const autoEmail = role === 'test'
      ? `test_${randomSuffix}@growix.test`
      : `user_${randomSuffix}@growix.app`;
    
    // Generate secure 10-char password
    const autoPassword = `Grx#${crypto.randomBytes(4).toString('hex')}!`;
    const hashedPassword = await bcrypt.hash(autoPassword, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        name: autoName,
        email: autoEmail,
        passwordHash: hashedPassword,
        role,
      })
      .returning();

    revalidatePath('/admin/users');

    return {
      success: true,
      credentials: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        password: autoPassword,
        role: newUser.role,
      },
    };
  } catch (err: any) {
    console.error('Auto create user error:', err);
    return { success: false, error: 'حدث خطأ أثناء التوليد التلقائي للحساب' };
  }
}

// 3. Admin Update User Action
export async function updateUserAction(data: {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'admin' | 'user' | 'test';
  password?: string;
}) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  try {
    const normalizedEmail = data.email.toLowerCase().trim();
    const updatePayload: Record<string, any> = {
      name: data.name.trim(),
      email: normalizedEmail,
      phone: data.phone ? data.phone.trim() : null,
      role: data.role,
    };

    if (data.password && data.password.trim().length >= 6) {
      updatePayload.passwordHash = await bcrypt.hash(data.password.trim(), 10);
    }

    await db.update(users).set(updatePayload).where(eq(users.id, data.id));

    revalidatePath('/admin/users');
    return { success: true };
  } catch (err: any) {
    console.error('Update user error:', err);
    return { success: false, error: 'حدث خطأ أثناء تعديل بيانات المستخدم' };
  }
}

// 4. Admin Delete User Action
export async function deleteUserAction(userId: string) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  try {
    // Prevent admin from deleting themselves
    if ((session.user as { id?: string }).id === userId) {
      return { success: false, error: 'لا يمكنك حذف حسابك الحالي أثناء تسجيل الدخول به' };
    }

    await db.delete(users).where(eq(users.id, userId));
    revalidatePath('/admin/users');
    return { success: true };
  } catch (err: any) {
    console.error('Delete user error:', err);
    return { success: false, error: 'حدث خطأ أثناء حذف المستخدم' };
  }
}

// 5. Admin Update User Role
export async function updateUserRole(userId: string, newRole: 'admin' | 'user' | 'test') {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  await db
    .update(users)
    .set({ role: newRole })
    .where(eq(users.id, userId));

  revalidatePath('/admin/users');
  return { success: true };
}
