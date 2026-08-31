'use server';

import { uploadReceiptToR2, deleteReceiptFromR2 } from '@/lib/r2';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { checkRateLimit } from '@/lib/rate-limit';

/**
 * Validates image buffer magic bytes to ensure file is genuinely an image (PNG, JPEG, WEBP)
 * and not an executable / script masked with an image extension.
 */
function isValidImageSignature(buffer: Buffer): boolean {
  if (!buffer || buffer.length < 12) return false;

  // PNG signature: 89 50 4E 47 0D 0A 1A 0A
  const isPng =
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a;

  if (isPng) return true;

  // JPEG / JPG signature: FF D8 FF
  const isJpg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (isJpg) return true;

  // WEBP signature: 'RIFF' .... 'WEBP'
  const isRiff =
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46;
  const isWebp =
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50;

  if (isRiff && isWebp) return true;

  return false;
}

/**
 * Server action to securely upload payment receipt to Cloudflare R2
 */
export async function uploadReceiptAction(formData: FormData) {
  try {
    const session = await auth();
    const senderNumber = (formData.get('senderNumber') as string) || 'unknown';

    // 1. Rate Limiting (Max 5 receipt uploads per 10 mins per user/IP)
    const rateLimit = await checkRateLimit({
      action: 'api',
      maxRequests: 5,
      windowMs: 10 * 60 * 1000,
      customIdentifier: session?.user?.id ? `receipt:${session.user.id}` : `receipt:${senderNumber}`,
      errorMessage: 'تم إرفاق عدة ملفات مؤخراً. يرجى الانتظار قليلاً أو التواصل مع الدعم الفني.',
    });

    if (!rateLimit.allowed) {
      return { success: false, error: rateLimit.error };
    }

    const file = formData.get('file') as File | null;

    if (!file || !(file instanceof File)) {
      return { success: false, error: 'لم يتم اختيار ملف الصورة' };
    }

    // 3. Size Validation (Max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'حجم الصورة كبير جداً، الحد الأقصى المسموح به هو 5 ميجابايت' };
    }

    // 4. Mime Type Validation
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validMimes.includes(file.type.toLowerCase())) {
      return { success: false, error: 'صيغة الملف غير مدعومة. يرجى رفع صورة بصيغة (PNG, JPG, WEBP)' };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 5. Deep Magic-Bytes Validation to prevent masked files
    if (!isValidImageSignature(buffer)) {
      return {
        success: false,
        error: 'الملف المرفق تالف أو ليس صورة صالحة. يرجى التأكد من اختيار صورة صحيحة.',
      };
    }

    // 6. Sanitize sender phone for file name and prevent path traversal
    const sanitizedPhone = senderNumber.replace(/[^0-9a-zA-Z]/g, '') || 'customer';
    const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
    const allowedExts = ['png', 'jpg', 'jpeg', 'webp'];
    const safeExt = allowedExts.includes(ext) ? ext : 'png';
    const fileKey = `receipts/${sanitizedPhone}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${safeExt}`;

    const uploadResult = await uploadReceiptToR2(buffer, fileKey, file.type);

    if (!uploadResult.success) {
      return { success: false, error: uploadResult.error || 'فشل في رفع الصورة إلى السيرفر' };
    }

    return {
      success: true,
      url: uploadResult.url,
      key: uploadResult.key,
    };
  } catch (error: any) {
    console.error('Error in uploadReceiptAction:', error);
    return { success: false, error: error.message || 'حدث خطأ أثناء رفع صورة الإثبات' };
  }
}

/**
 * Server action for Admin to delete receipt from R2 and clean storage
 */
export async function deleteReceiptAction(orderId: string, fileKey: string) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  // Prevent path traversal on deletion
  const safeFileKey = (fileKey || '').trim().replace(/\.\./g, '');
  if (!safeFileKey.startsWith('receipts/')) {
    return { success: false, error: 'مسار الملف غير صالح' };
  }

  try {
    // 1. Delete from R2 bucket
    if (safeFileKey) {
      await deleteReceiptFromR2(safeFileKey);
    }

    // 2. Remove receipt reference from database order record
    await db
      .update(orders)
      .set({
        receiptUrl: null,
        receiptKey: null,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    revalidatePath('/admin/orders');
    revalidatePath('/my-orders');
    return { success: true };
  } catch (error: any) {
    console.error('Error in deleteReceiptAction:', error);
    return { success: false, error: error.message || 'حدث خطأ أثناء حذف الصورة من R2' };
  }
}
