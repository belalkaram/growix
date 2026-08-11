'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { auth } from '@/lib/auth';

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
}) {
  try {
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

export async function updateUserRole(userId: string, newRole: 'admin' | 'user') {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  await db
    .update(users)
    .set({ role: newRole })
    .where(eq(users.id, userId));

  return { success: true };
}
