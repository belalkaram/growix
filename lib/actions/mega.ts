'use server';

import { db } from '@/db';
import { megaLinks } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

/**
 * Fetch MEGA links visible to a specific subscriber based on their packageId.
 * Returns links that match the user's package OR are marked for 'all' packages.
 */
export async function getMegaLinksForOrderAction(packageId: string): Promise<{
  megaLinks?: any[];
  error?: string;
}> {
  try {
    // Fetch links for this package + "all" packages
    const links = await db
      .select()
      .from(megaLinks)
      .where(eq(megaLinks.isActive, true))
      .orderBy(asc(megaLinks.sortOrder), asc(megaLinks.createdAt));

    // Filter by package: include if packageId matches, is 'all', or if VIP/Courses packages match
    const filtered = links.filter((l) => {
      if (l.packageId === 'all') return true;
      if (l.packageId === packageId) return true;
      if (
        (packageId === 'bundle-vip' || packageId === 'courses-500gb') &&
        (l.packageId === 'courses-500gb' || l.packageId === 'bundle-vip')
      ) {
        return true;
      }
      return false;
    });

    return { megaLinks: filtered };
  } catch (error: any) {
    console.error('getMegaLinksForOrderAction error:', error);
    return { error: 'حدث خطأ في جلب روابط الكورسات' };
  }
}

// ─── Admin-Only Server Actions ──────────────────────────────────────────────

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'admin') {
    throw new Error('غير مصرح بالوصول');
  }
  return session;
}

export async function getAllMegaLinksAction() {
  await requireAdmin();
  return db.select().from(megaLinks).orderBy(asc(megaLinks.sortOrder), asc(megaLinks.createdAt));
}

export async function createMegaLinkAction(data: {
  packageId: string;
  title: string;
  description?: string;
  megaUrl: string;
  sizeLabel?: string;
  contentCount?: string;
  sortOrder?: number;
}): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    await db.insert(megaLinks).values({
      packageId: data.packageId,
      title: data.title,
      description: data.description || null,
      megaUrl: data.megaUrl,
      sizeLabel: data.sizeLabel || null,
      contentCount: data.contentCount || null,
      isActive: true,
      sortOrder: data.sortOrder || 0,
    });
    return { success: true };
  } catch (error: any) {
    console.error('createMegaLinkAction error:', error);
    return { success: false, error: 'حدث خطأ أثناء الإنشاء' };
  }
}

export async function updateMegaLinkAction(
  id: number,
  data: Partial<{
    packageId: string;
    title: string;
    description: string;
    megaUrl: string;
    sizeLabel: string;
    contentCount: string;
    isActive: boolean;
    sortOrder: number;
  }>
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    await db
      .update(megaLinks)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(megaLinks.id, id));
    return { success: true };
  } catch (error: any) {
    console.error('updateMegaLinkAction error:', error);
    return { success: false, error: 'حدث خطأ أثناء التحديث' };
  }
}

export async function deleteMegaLinkAction(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    await db.delete(megaLinks).where(eq(megaLinks.id, id));
    return { success: true };
  } catch (error: any) {
    console.error('deleteMegaLinkAction error:', error);
    return { success: false, error: 'حدث خطأ أثناء الحذف' };
  }
}
