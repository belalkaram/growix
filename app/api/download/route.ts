import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { orders, packageFiles } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { generatePresignedDownloadUrl } from '@/lib/r2';

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'غير مصرح بالوصول. يرجى تسجيل الدخول أولاً' }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const orderId = searchParams.get('orderId');
  const fileKey = searchParams.get('fileKey');

  if (!orderId || !fileKey) {
    return NextResponse.json({ error: 'معلمات الطلب غير مكتملة (orderId, fileKey)' }, { status: 400 });
  }

  try {
    // 1. Verify order belongs to session user and is APPROVED
    const userOrders = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, session.user.id)))
      .limit(1);

    if (!userOrders || userOrders.length === 0) {
      return NextResponse.json({ error: 'الطلب غير موجود أو لا ينتمي لحسابك' }, { status: 403 });
    }

    const order = userOrders[0];

    if (order.status !== 'approved') {
      return NextResponse.json({ error: 'الطلب غير مفعّل بعد من قِبل الأدمن' }, { status: 403 });
    }

    // 2. Validate file entitlement
    if (order.packageId === 'single-tool' && order.toolId) {
      const isAllowedToolFile = fileKey.includes(order.toolId) || fileKey.includes('egypt-marketing-data') || fileKey.includes('data');
      if (!isAllowedToolFile) {
        return NextResponse.json({ error: 'هذا الملف غير متاح في باقة البرنامج المختار' }, { status: 403 });
      }
    }

    // 3. Generate temporary secure presigned download URL (valid for 5 mins)
    const downloadUrl = await generatePresignedDownloadUrl(fileKey, 300);

    // If client requested JSON (e.g. fetch), return URL JSON
    const format = searchParams.get('format');
    if (format === 'json') {
      return NextResponse.json({ success: true, downloadUrl });
    }

    // Default: Redirect browser directly to R2 presigned download URL
    return NextResponse.redirect(downloadUrl);
  } catch (error: any) {
    console.error('Download route error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء توليد رابط التحميل الآمن' }, { status: 500 });
  }
}
