'use server';

import { uploadReceiptToR2, deleteReceiptFromR2 } from '@/lib/r2';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

/**
 * Server action to upload payment receipt to Cloudflare R2
 */
export async function uploadReceiptAction(formData: FormData) {
  try {
    const file = formData.get('file') as File | null;
    const senderNumber = (formData.get('senderNumber') as string) || 'unknown';

    if (!file || !(file instanceof File)) {
      return { success: false, error: 'لم يتم اختيار ملف الصورة' };
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'حجم الصورة كبير جداً، الحد الأقصى 5 ميجابايت' };
    }

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      return { success: false, error: 'صيغة الملف غير مدعومة. يرجى رفع صورة (PNG, JPG, WEBP)' };
    }

    // Sanitize sender phone for file name
    const sanitizedPhone = senderNumber.replace(/[^0-9a-zA-Z]/g, '') || 'customer';
    const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
    const fileKey = `receipts/${sanitizedPhone}_${Date.now()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

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

  try {
    // 1. Delete from R2 bucket
    if (fileKey) {
      await deleteReceiptFromR2(fileKey);
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
