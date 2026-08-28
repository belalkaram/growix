import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { orders, packageFiles, fileDownloads } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { generatePresignedDownloadUrl } from '@/lib/r2';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  // 1. Authentication Check
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'غير مصرح بالوصول. يرجى تسجيل الدخول أولاً لحسابك في GROWIX' },
      { status: 401 }
    );
  }

  // 2. Download Rate Limiting (10 downloads per 5 minutes per user)
  const rateLimit = await checkRateLimit({
    action: 'api',
    maxRequests: 10,
    windowMs: 5 * 60 * 1000,
    customIdentifier: `download:${session.user.id}`,
    errorMessage: 'تم تجاوز الحد الأقصى لعدد مرات التحميل المتتالية. يرجى الانتظار بضع دقائق والمحاولة مرة أخرى.',
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: rateLimit.error }, { status: 429 });
  }

  const { searchParams } = req.nextUrl;
  const orderId = searchParams.get('orderId');
  const fileKey = searchParams.get('fileKey');

  if (!orderId || !fileKey) {
    return NextResponse.json(
      { error: 'معلمات الطلب غير مكتملة (orderId, fileKey)' },
      { status: 400 }
    );
  }

  // Sanitize fileKey to prevent path traversal attempts
  const sanitizedKey = fileKey.trim().replace(/\.\./g, '');

  try {
    // 3. Verify order belongs to session user and is APPROVED
    const userOrders = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, session.user.id)))
      .limit(1);

    if (!userOrders || userOrders.length === 0) {
      return NextResponse.json(
        { error: 'الطلب غير موجود أو لا ينتمي لحسابك الحالي' },
        { status: 403 }
      );
    }

    const order = userOrders[0];

    if (order.status !== 'approved') {
      return NextResponse.json(
        { error: 'الطلب قيد المراجعة ولم يتم تفعيله بعد من قِبل الإدارة' },
        { status: 403 }
      );
    }

    // 4. Validate file entitlement via Database records
    if (order.packageId === 'single-tool' && order.toolId) {
      const fileRecord = await db
        .select()
        .from(packageFiles)
        .where(eq(packageFiles.fileKey, sanitizedKey))
        .limit(1);

      if (fileRecord.length === 0) {
        return NextResponse.json({ error: 'الملف المطلوب غير موجود' }, { status: 404 });
      }

      const isAllowed =
        fileRecord[0].toolId === order.toolId ||
        fileRecord[0].category === 'data' ||
        fileRecord[0].category === 'bonus' ||
        fileRecord[0].packageId === 'all';

      if (!isAllowed) {
        return NextResponse.json(
          { error: 'هذا الملف غير مشمول في باقة البرنامج المختار' },
          { status: 403 }
        );
      }
    }

    // 5. CRITICAL SECURITY: ALWAYS generate a temporary Presigned URL with 60-second expiration.
    // Never expose permanent public URLs or allow direct unauthenticated file scraping.
    const downloadUrl = await generatePresignedDownloadUrl(sanitizedKey, 60);

    if (!downloadUrl) {
      return NextResponse.json(
        { error: 'فشل في توليد رابط التحميل الآمن. يرجى مراجعة الدعم الفني.' },
        { status: 500 }
      );
    }

    // If client requested JSON (e.g. fetch), return URL JSON
    const format = searchParams.get('format');

    // 6. 📊 Track this download for engagement audit (fire-and-forget)
    const fileName = sanitizedKey.split('/').pop() || sanitizedKey;
    const fileRecord = await db
      .select()
      .from(packageFiles)
      .where(eq(packageFiles.fileKey, sanitizedKey))
      .limit(1)
      .catch(() => []);
    const category = (fileRecord[0]?.category as string) || 'tool';
    const toolId = fileRecord[0]?.toolId || order.toolId || null;

    getClientIp().then(ip =>
      db.insert(fileDownloads).values({
        userId: session.user.id!,
        orderId,
        fileKey: sanitizedKey,
        fileName,
        category,
        toolId,
        ip,
      }).catch(err => console.error('[DownloadTracker] Insert error:', err))
    ).catch(console.error);

    if (format === 'json') {
      return NextResponse.json({ 
        success: true, 
        downloadUrl,
        expiresInSeconds: 60,
      });
    }

    // Default: Redirect browser securely to temporary presigned R2 download URL
    return NextResponse.redirect(downloadUrl);
  } catch (error: any) {
    console.error('Secure download route error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء معالجة طلب التحميل الآمن' },
      { status: 500 }
    );
  }
}
