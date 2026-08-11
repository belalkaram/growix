'use server';

import { db } from '@/db';
import { packageFiles, orders } from '@/db/schema';
import { eq, and, or, inArray, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { SITE_CONFIG } from '@/config/site';

export async function getUserDownloadableFilesAction(orderId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'يجب تسجيل الدخول أولاً', files: [] };
  }

  try {
    const userOrders = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, session.user.id)))
      .limit(1);

    if (!userOrders || userOrders.length === 0) {
      return { success: false, error: 'الطلب غير موجود', files: [] };
    }

    const order = userOrders[0];

    if (order.status !== 'approved') {
      return { success: false, error: 'الطلب غير مفعّل بعد', files: [] };
    }

    let filesList;

    if (order.packageId === 'bundle-vip') {
      // VIP package gets ALL active files (all tools + course + data)
      filesList = await db
        .select()
        .from(packageFiles)
        .where(eq(packageFiles.isActive, true))
        .orderBy(packageFiles.sortOrder, packageFiles.id);
    } else {
      // Single tool package gets specific tool file + data bonus
      filesList = await db
        .select()
        .from(packageFiles)
        .where(
          and(
            eq(packageFiles.isActive, true),
            or(
              eq(packageFiles.toolId, order.toolId || ''),
              eq(packageFiles.category, 'data'),
              eq(packageFiles.category, 'bonus'),
              eq(packageFiles.packageId, 'all')
            )
          )
        )
        .orderBy(packageFiles.sortOrder, packageFiles.id);
    }

    // Fallback: If DB table is empty, auto-generate dynamic files list from SITE_CONFIG tools!
    if (filesList.length === 0) {
      const fallbackFiles = [];
      
      if (order.packageId === 'bundle-vip') {
        SITE_CONFIG.tools.forEach((t) => {
          fallbackFiles.push({
            id: t.number,
            packageId: 'bundle-vip',
            toolId: t.id,
            fileName: `${t.name} (نسخة كاملة ZIP)`,
            fileKey: `${t.id}.zip`,
            fileSize: '50 MB',
            fileType: 'zip',
            category: 'tool',
            description: t.shortDesc,
            isActive: true,
          });
        });
        fallbackFiles.push({
          id: 99,
          packageId: 'all',
          toolId: null,
          fileName: 'هدية داتا مصر التسويقية الشاملة (ZIP)',
          fileKey: 'egypt-marketing-data.zip',
          fileSize: '250 MB',
          fileType: 'zip',
          category: 'data',
          description: SITE_CONFIG.bonus.subtitle,
          isActive: true,
        });
      } else if (order.toolId) {
        const foundTool = SITE_CONFIG.tools.find((t) => t.id === order.toolId);
        if (foundTool) {
          fallbackFiles.push({
            id: foundTool.number,
            packageId: 'single-tool',
            toolId: foundTool.id,
            fileName: `${foundTool.name} (ZIP)`,
            fileKey: `${foundTool.id}.zip`,
            fileSize: '50 MB',
            fileType: 'zip',
            category: 'tool',
            description: foundTool.shortDesc,
            isActive: true,
          });
        }
        fallbackFiles.push({
          id: 99,
          packageId: 'all',
          toolId: null,
          fileName: 'هدية داتا مصر التسويقية الشاملة (ZIP)',
          fileKey: 'egypt-marketing-data.zip',
          fileSize: '250 MB',
          fileType: 'zip',
          category: 'data',
          description: SITE_CONFIG.bonus.subtitle,
          isActive: true,
        });
      }

      filesList = fallbackFiles as any;
    }

    return { success: true, files: filesList };
  } catch (error) {
    console.error('Error fetching downloadable files:', error);
    return { success: false, error: 'حدث خطأ أثناء جلب الملفات', files: [] };
  }
}

export async function getAllPackageFilesForAdminAction() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    throw new Error('غير مصرح بالوصول');
  }

  return await db
    .select()
    .from(packageFiles)
    .orderBy(packageFiles.sortOrder, desc(packageFiles.createdAt));
}

export async function addPackageFileAction(data: {
  packageId: string;
  toolId?: string;
  fileName: string;
  fileKey: string;
  fileSize?: string;
  fileType?: string;
  category?: string;
  description?: string;
}) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  if (!data.fileName || !data.fileKey) {
    return { success: false, error: 'يرجى ملء اسم الملف والمسار (File Key) في R2' };
  }

  try {
    const [newFile] = await db
      .insert(packageFiles)
      .values({
        packageId: data.packageId,
        toolId: data.toolId || null,
        fileName: data.fileName.trim(),
        fileKey: data.fileKey.trim(),
        fileSize: data.fileSize || null,
        fileType: data.fileType || 'zip',
        category: data.category || 'tool',
        description: data.description || null,
        isActive: true,
      })
      .returning();

    revalidatePath('/admin/files');
    revalidatePath('/my-orders');
    return { success: true, file: newFile };
  } catch (error: any) {
    console.error('Error adding package file:', error);
    return { success: false, error: error.message || 'حدث خطأ أثناء حفظ الملف' };
  }
}

export async function deletePackageFileAction(fileId: number) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  try {
    await db.delete(packageFiles).where(eq(packageFiles.id, fileId));
    revalidatePath('/admin/files');
    revalidatePath('/my-orders');
    return { success: true };
  } catch (error) {
    console.error('Error deleting package file:', error);
    return { success: false, error: 'حدث خطأ أثناء حذف الملف' };
  }
}

export async function seedInitialDefaultFilesAction() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  try {
    const existing = await db.select().from(packageFiles);
    if (existing.length > 0) {
      return { success: true, message: 'جدول الملفات يحتوي على بيانات بالفعل' };
    }

    const defaultRecords = SITE_CONFIG.tools.map((t) => ({
      packageId: 'bundle-vip',
      toolId: t.id,
      fileName: `${t.name} (ZIP)`,
      fileKey: `${t.id}.zip`,
      fileSize: '45 MB',
      fileType: 'zip',
      category: 'tool',
      description: t.shortDesc,
      isActive: true,
      sortOrder: t.number,
    }));

    defaultRecords.push({
      packageId: 'all',
      toolId: null as any,
      fileName: 'هدية داتا مصر التسويقية الشاملة (ZIP)',
      fileKey: 'egypt-marketing-data.zip',
      fileSize: '250 MB',
      fileType: 'zip',
      category: 'data',
      description: SITE_CONFIG.bonus.subtitle,
      isActive: true,
      sortOrder: 99,
    });

    await db.insert(packageFiles).values(defaultRecords);
    revalidatePath('/admin/files');
    return { success: true, message: 'تم إنشاء بيانات الملفات الأولية بنجاح' };
  } catch (error: any) {
    console.error('Error seeding default files:', error);
    return { success: false, error: error.message };
  }
}
