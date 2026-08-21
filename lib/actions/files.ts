'use server';

import { db } from '@/db';
import { packageFiles, orders } from '@/db/schema';
import { eq, and, or, sql, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { SITE_CONFIG } from '@/config/site';

export async function ensurePackageFilesTableExists() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS package_files (
        id SERIAL PRIMARY KEY,
        package_id VARCHAR(100) NOT NULL,
        tool_id VARCHAR(100),
        file_name VARCHAR(255) NOT NULL,
        file_key VARCHAR(500) NOT NULL UNIQUE,
        file_size TEXT,
        file_type VARCHAR(50) DEFAULT 'zip' NOT NULL,
        category VARCHAR(50) DEFAULT 'tool' NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true NOT NULL,
        sort_order INTEGER DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
  } catch (err) {
    console.error('Error ensuring package_files table exists:', err);
  }
}

export async function getUserDownloadableFilesAction(orderId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'يجب تسجيل الدخول أولاً', files: [] };
  }

  await ensurePackageFilesTableExists();

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

  await ensurePackageFilesTableExists();

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

export async function deleteDummyFilesAction() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  try {
    const deleted = await db
      .delete(packageFiles)
      .where(
        or(
          eq(packageFiles.fileSize, '45 MB'),
          sql`${packageFiles.fileSize} LIKE '%45 MB%'`
        )
      )
      .returning();

    revalidatePath('/admin/files');
    revalidatePath('/my-orders');
    return {
      success: true,
      message: `تم حذف ${deleted.length} ملف وهمي (45 MB) من قاعدة البيانات بنجاح!`,
    };
  } catch (error: any) {
    console.error('Error deleting dummy files:', error);
    return { success: false, error: error.message || 'حدث خطأ أثناء حذف الملفات الوهمية' };
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

    const realRecords = [
      {
        packageId: 'bundle-vip',
        toolId: 'facebook-bot',
        fileName: 'برنامج التسويق المجاني على فيسبوك (FeedBolt Enterprise)',
        fileKey: 'FeedBolt_Facebook_Automation_Enterprise_v1_0_0_Full_Activated_.zip',
        fileSize: '224.0 MB',
        fileType: 'zip',
        category: 'tool',
        description: 'نشر وجدولة وإدارة الحملات المجانية على مئات المجموعات والصفحات.',
        isActive: true,
        sortOrder: 1,
      },
      {
        packageId: 'bundle-vip',
        toolId: 'whatsapp-sender',
        fileName: 'واتساب سندر Anti-Block (WhatBotPlus Business)',
        fileKey: 'WhatBotPlus_Business_Sender_v4_6_5_Full_Activated_ChatGPT_.zip',
        fileSize: '384.5 MB',
        fileType: 'zip',
        category: 'tool',
        description: 'إرسال حملات واتساب حتى 1000 رسالة يومياً بدون حظر.',
        isActive: true,
        sortOrder: 2,
      },
      {
        packageId: 'bundle-vip',
        toolId: 'telegram-sender',
        fileName: 'تليجرام سندر Pro (Telegram Sender Pro)',
        fileKey: 'Telegram Sender Pro v9.0.0 Full Activated -.zip',
        fileSize: '60.3 MB',
        fileType: 'zip',
        category: 'tool',
        description: 'إرسال رسائل بكميات ضخمة وزيادة أعضاء القنوات.',
        isActive: true,
        sortOrder: 3,
      },
      {
        packageId: 'bundle-vip',
        toolId: 'instagram-bot',
        fileName: 'انستجرام بوت Pro (Instagram Bot Pro)',
        fileKey: 'Instagram Bot Pro v7.3.1 Full Activated -.zip',
        fileSize: '50.0 MB',
        fileType: 'zip',
        category: 'tool',
        description: 'زيادة المتابعين المستهدفين ورد تلقائي على الرسائل والكومنتات.',
        isActive: true,
        sortOrder: 4,
      },
      {
        packageId: 'bundle-vip',
        toolId: 'tiktok-bot',
        fileName: 'تيك توك بوت Pro (TikTok Bot Pro)',
        fileKey: 'TikTok Bot Pro v3.7.0 Full Activated - .zip',
        fileSize: '49.6 MB',
        fileType: 'zip',
        category: 'tool',
        description: 'تكبير حساب التيك توك وأتمتة الردود والرسائل المباشرة.',
        isActive: true,
        sortOrder: 5,
      },
      {
        packageId: 'bundle-vip',
        toolId: 'reach-booster',
        fileName: 'أداة زيادة نسبة الوصول (Keyword Researcher Pro)',
        fileKey: 'Keyword Researcher Pro v13.259 Full Activated - .zip',
        fileSize: '61.6 MB',
        fileType: 'zip',
        category: 'tool',
        description: 'استخراج أسرار الكلمات المفتاحية لمضاعفة الريتش والوصول المجاني.',
        isActive: true,
        sortOrder: 6,
      },
      {
        packageId: 'bundle-vip',
        toolId: 'canva-alternative',
        fileName: 'بديل كانفا + أتمتة السوشيال ميديا (Socinator Dominator)',
        fileKey: 'Socinator Dominator Enterprise v1.0.0.172 Full Activated - .zip',
        fileSize: '222.6 MB',
        fileType: 'zip',
        category: 'tool',
        description: 'إنشاء وجدولة المحتوى والتصاميم على كل منصات السوشيال ميديا تلقائياً.',
        isActive: true,
        sortOrder: 7,
      },
      {
        packageId: 'bundle-vip',
        toolId: 'video-editor',
        fileName: 'أداة مونتاج وتعديل الفيديو (Video Spin Blaster Pro)',
        fileKey: 'Video Spin Blaster Pro Plus v2.45 Full Activated -.zip',
        fileSize: '58.2 MB',
        fileType: 'zip',
        category: 'tool',
        description: 'صناعة ومونتاج الفيديوهات التسويقية والـ Reels بأسلوب جذاب.',
        isActive: true,
        sortOrder: 8,
      },
      {
        packageId: 'bundle-vip',
        toolId: 'videoscribe-ai',
        fileName: 'VideoScribe موشن جرافيك ووايت بورد (Sparkol VideoScribe)',
        fileKey: 'Sparkol_VideoScribe_Pro_3_14_2_x64_Full_Activated_Animated_Video.zip',
        fileSize: '145.2 MB',
        fileType: 'zip',
        category: 'tool',
        description: 'صناعة فيديوهات الرسوم المتحركة والـ Whiteboard بأسلوب شائق.',
        isActive: true,
        sortOrder: 9,
      },
      {
        packageId: 'bundle-vip',
        toolId: 'data-scraper',
        fileName: 'أداة سحب الداتا Pro (Social Phone Extractor Pro)',
        fileKey: 'Social Phone Extractor Pro v7.0.0 Full Activated - W..zip',
        fileSize: '51.6 MB',
        fileType: 'zip',
        category: 'tool',
        description: 'سحب أرقام وداتا العملاء من فيسبوك وانستجرام وجوجل مابس.',
        isActive: true,
        sortOrder: 10,
      },
      {
        packageId: 'bundle-vip',
        toolId: 'duolingo-unlocked',
        fileName: 'دولينجو مفتوح كل المميزات (Duolingo Max Premium)',
        fileKey: 'Duolingo Max Premium v6.35.3 Full Activated - new  (2).apk',
        fileSize: '88.9 MB',
        fileType: 'apk',
        category: 'tool',
        description: 'تعلم جميع اللغات بكل المميزات المدفوعة مفتوحة بالكامل.',
        isActive: true,
        sortOrder: 12,
      },
      {
        packageId: 'all',
        toolId: null as any,
        fileName: 'هدية داتا مصر التسويقية الشاملة',
        fileKey: 'data/Data masr.rar',
        fileSize: '106.1 MB',
        fileType: 'rar',
        category: 'data',
        description: 'قاعدة بيانات تسويقية ضخمة محدثة ومقسمة بدقة عالية حسب المحافظات والأنشطة.',
        isActive: true,
        sortOrder: 99,
      },
    ];

    await db.insert(packageFiles).values(realRecords);
    revalidatePath('/admin/files');
    return { success: true, message: 'تم إنشاء بيانات الملفات الحقيقية بنجاح' };
  } catch (error: any) {
    console.error('Error seeding default files:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Scan live Cloudflare R2 bucket for actual uploaded files and update their exact file sizes & details in DB.
 */
export async function syncR2BucketObjectsAction() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  await ensurePackageFilesTableExists();

  try {
    const { listR2Objects } = await import('@/lib/r2');
    const r2Objects = await listR2Objects();

    if (!r2Objects || r2Objects.length === 0) {
      return { success: false, error: 'لم يتم العثور على أي ملفات مرفوعة حالياً في Cloudflare R2 Bucket' };
    }

    let syncedCount = 0;

    for (const item of r2Objects) {
      if (!item.Key || item.Size === undefined) continue;

      const fileKey = item.Key;
      const bytes = item.Size;

      // Format size
      let formattedSize = '0 MB';
      if (bytes >= 1024 * 1024 * 1024) {
        formattedSize = `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
      } else if (bytes >= 1024 * 1024) {
        formattedSize = `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      } else {
        formattedSize = `${(bytes / 1024).toFixed(0)} KB`;
      }

      // Match with tools
      const lowerKey = fileKey.toLowerCase();
      const matchedTool = SITE_CONFIG.tools.find(
        (t) => lowerKey.includes(t.id.toLowerCase()) || t.id.toLowerCase().includes(lowerKey.replace('.zip', ''))
      );

      let fileName = fileKey;
      let toolId = matchedTool ? matchedTool.id : null;
      let category = matchedTool ? 'tool' : lowerKey.includes('data') ? 'data' : lowerKey.includes('course') ? 'course' : 'tool';
      let packageId = matchedTool ? 'bundle-vip' : 'all';
      let description = matchedTool ? matchedTool.shortDesc : 'ملف تسويقي محمي على R2';

      if (matchedTool) {
        fileName = `${matchedTool.name} (ZIP الحقيقي)`;
      } else if (lowerKey.includes('data') || lowerKey.includes('egypt')) {
        fileName = 'هدية داتا مصر التسويقية الشاملة (ZIP الحقيقي)';
      }

      // Check if file record already exists in DB
      const existing = await db
        .select()
        .from(packageFiles)
        .where(eq(packageFiles.fileKey, fileKey))
        .limit(1);

      if (existing.length > 0) {
        // Update size & details
        await db
          .update(packageFiles)
          .set({
            fileSize: formattedSize,
            fileName: fileName,
            toolId: toolId || existing[0].toolId,
            updatedAt: new Date(),
          })
          .where(eq(packageFiles.fileKey, fileKey));
      } else {
        // Insert new record
        await db.insert(packageFiles).values({
          packageId: packageId,
          toolId: toolId,
          fileName: fileName,
          fileKey: fileKey,
          fileSize: formattedSize,
          fileType: 'zip',
          category: category,
          description: description,
          isActive: true,
          sortOrder: matchedTool ? matchedTool.number : 99,
        });
      }

      syncedCount++;
    }

    revalidatePath('/admin/files');
    revalidatePath('/my-orders');
    return {
      success: true,
      message: `تم فحص Cloudflare R2 ومزامنة ${syncedCount} ملف بأحجامهم الحقيقية بنجاح!`,
    };
  } catch (error: any) {
    console.error('Error syncing R2 bucket objects:', error);
    return { success: false, error: error.message || 'حدث خطأ أثناء الاتصال بـ Cloudflare R2' };
  }
}

export async function createPackageFileAction(data: {
  packageId: string;
  toolId?: string | null;
  fileName: string;
  fileKey: string;
  fileSize?: string | null;
  fileType?: string;
  category: string;
  description?: string | null;
  sortOrder?: number;
}) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  await ensurePackageFilesTableExists();

  try {
    const [file] = await db
      .insert(packageFiles)
      .values({
        packageId: data.packageId,
        toolId: data.toolId || null,
        fileName: data.fileName.trim(),
        fileKey: data.fileKey.trim(),
        fileSize: data.fileSize?.trim() || null,
        fileType: data.fileType || 'zip',
        category: data.category || 'tool',
        description: data.description?.trim() || null,
        sortOrder: data.sortOrder || 0,
        isActive: true,
      })
      .returning();

    revalidatePath('/admin/files');
    revalidatePath('/my-orders');
    return { success: true, file };
  } catch (err: any) {
    console.error('Error creating package file:', err);
    return { success: false, error: err.message || 'حدث خطأ أثناء إضافة الملف' };
  }
}

export async function updatePackageFileAction(data: {
  id: number;
  packageId: string;
  toolId?: string | null;
  fileName: string;
  fileKey: string;
  fileSize?: string | null;
  fileType?: string;
  category: string;
  description?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  await ensurePackageFilesTableExists();

  try {
    await db
      .update(packageFiles)
      .set({
        packageId: data.packageId,
        toolId: data.toolId || null,
        fileName: data.fileName.trim(),
        fileKey: data.fileKey.trim(),
        fileSize: data.fileSize?.trim() || null,
        fileType: data.fileType || 'zip',
        category: data.category || 'tool',
        description: data.description?.trim() || null,
        sortOrder: data.sortOrder || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
        updatedAt: new Date(),
      })
      .where(eq(packageFiles.id, data.id));

    revalidatePath('/admin/files');
    revalidatePath('/my-orders');
    return { success: true };
  } catch (err: any) {
    console.error('Error updating package file:', err);
    return { success: false, error: err.message || 'حدث خطأ أثناء تعديل الملف' };
  }
}

export async function togglePackageFileAction(fileId: number, isActive: boolean) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  try {
    await db
      .update(packageFiles)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(packageFiles.id, fileId));

    revalidatePath('/admin/files');
    revalidatePath('/my-orders');
    return { success: true };
  } catch (err: any) {
    console.error('Error toggling package file:', err);
    return { success: false, error: 'حدث خطأ أثناء تغيير حالة الملف' };
  }
}

