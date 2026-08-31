'use server';

import { db } from '@/db';
import { magicTokens, users } from '@/db/schema';
import { eq, and, gt, isNull, or } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import crypto from 'crypto';

const SITE_URL = process.env.NEXTAUTH_URL || 'https://growix.belalkaram.dev';

/**
 * 🔑 Generates a secure time-limited Magic Login Token for a user
 */
export async function createMagicLoginToken(userId: string, expiresInHours = 72): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  await db.insert(magicTokens).values({
    userId,
    token,
    expiresAt,
  });

  return token;
}

/**
 * 🔍 Validates and consumes a Magic Login Token
 */
export async function validateAndConsumeMagicToken(token: string): Promise<{
  success: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string | null;
  };
  error?: string;
}> {
  if (!token || typeof token !== 'string') {
    return { success: false, error: 'رمز الدخول غير صالح' };
  }

  const cleanToken = token.trim();

  try {
    const records = await db
      .select({
        tokenId: magicTokens.id,
        userId: magicTokens.userId,
        expiresAt: magicTokens.expiresAt,
        usedAt: magicTokens.usedAt,
        userName: users.name,
        userEmail: users.email,
        userRole: users.role,
        userPhone: users.phone,
      })
      .from(magicTokens)
      .innerJoin(users, eq(magicTokens.userId, users.id))
      .where(
        and(
          eq(magicTokens.token, cleanToken),
          gt(magicTokens.expiresAt, new Date()),
          or(
            isNull(magicTokens.usedAt),
            gt(magicTokens.usedAt, new Date(Date.now() - 2 * 60 * 1000))
          )
        )
      )
      .limit(1);

    if (!records || records.length === 0) {
      return { 
        success: false, 
        error: 'رابط الدخول السريع منتهي الصلاحية أو غير صالح. يرجى تسجيل الدخول بالإيميل ورقم هاتفك.' 
      };
    }

    const rec = records[0];

    // Mark token as used if not already marked
    if (!rec.usedAt) {
      await db
        .update(magicTokens)
        .set({ usedAt: new Date() })
        .where(eq(magicTokens.id, rec.tokenId));
    }

    // Update user's last login timestamp
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, rec.userId));

    return {
      success: true,
      user: {
        id: rec.userId,
        name: rec.userName,
        email: rec.userEmail,
        role: rec.userRole,
        phone: rec.userPhone,
      },
    };
  } catch (err: any) {
    console.error('Error validating magic token:', err);
    return { success: false, error: 'حدث خطأ أثناء التحقق من رمز الدخول' };
  }
}

/**
 * 👑 Admin Action: Generate Magic Login Link on demand for any user
 */
export async function getMagicLoginLinkForAdminAction(userId: string): Promise<{
  success: boolean;
  magicUrl?: string;
  error?: string;
}> {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  try {
    const token = await createMagicLoginToken(userId, 168); // 7 days validity for admin links
    const magicUrl = `${SITE_URL}/magic-login?token=${token}`;
    return { success: true, magicUrl };
  } catch (err: any) {
    console.error('Error generating admin magic link:', err);
    return { success: false, error: 'فشل في توليد رابط الدخول السريع' };
  }
}

export async function buildMagicLoginUrl(token: string): Promise<string> {
  return `${SITE_URL}/magic-login?token=${token}`;
}
