'use server';

import { db } from '@/db';
import { siteSettings } from '@/db/schema';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function updateSiteSettingsAction(settingsMap: Record<string, string>) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  try {
    for (const [key, value] of Object.entries(settingsMap)) {
      await db
        .insert(siteSettings)
        .values({
          key,
          value,
        })
        .onConflictDoUpdate({
          target: siteSettings.key,
          set: {
            value,
            updatedAt: new Date(),
          },
        });
    }

    revalidatePath('/');
    revalidatePath('/admin/settings');
    revalidatePath('/tools');
    return { success: true };
  } catch (error) {
    console.error('Update settings error:', error);
    return { success: false, error: 'حدث خطأ أثناء حفظ الإعدادات' };
  }
}
