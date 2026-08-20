'use server';

import { db } from '@/db';
import { packages } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const packageSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2, 'الاسم مطلوب'),
  badge: z.string().optional(),
  isPopular: z.boolean(),
  originalPrice: z.string().min(1, 'السعر الأصلي مطلوب'),
  discountedPrice: z.string().min(1, 'السعر مطلوب'),
  currency: z.string().default('جنية'),
  period: z.string().min(1),
  description: z.string().min(1),
  features: z.array(z.object({
    text: z.string(),
    included: z.boolean(),
    highlight: z.boolean().optional(),
  })),
  ctaText: z.string().min(1),
});

export async function updatePackageAction(data: z.infer<typeof packageSchema>) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  try {
    const validated = packageSchema.parse(data);

    await db
      .insert(packages)
      .values({
        id: validated.id,
        name: validated.name,
        badge: validated.badge || null,
        isPopular: validated.isPopular,
        originalPrice: validated.originalPrice,
        discountedPrice: validated.discountedPrice,
        currency: validated.currency,
        period: validated.period,
        description: validated.description,
        features: validated.features,
        ctaText: validated.ctaText,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: packages.id,
        set: {
          name: validated.name,
          badge: validated.badge || null,
          isPopular: validated.isPopular,
          originalPrice: validated.originalPrice,
          discountedPrice: validated.discountedPrice,
          currency: validated.currency,
          period: validated.period,
          description: validated.description,
          features: validated.features,
          ctaText: validated.ctaText,
          updatedAt: new Date(),
        },
      });

    revalidatePath('/', 'layout');
    revalidatePath('/');
    revalidatePath('/checkout');
    revalidatePath('/pricing');
    revalidatePath('/course');
    revalidatePath('/data-bonus');
    revalidatePath('/how-it-works');
    revalidatePath('/faq');
    revalidatePath('/about');
    revalidatePath('/tools');
    revalidatePath('/admin/packages');
    return { success: true };
  } catch (error: any) {
    if (error?.issues && error.issues.length > 0) {
      return { success: false, error: error.issues[0].message };
    }
    console.error('Update package error:', error);
    return { success: false, error: 'حدث خطأ أثناء حفظ الباقة' };
  }
}

export async function getAllPackagesAction() {
  const { getPackages } = await import('@/lib/queries');
  return await getPackages();
}
