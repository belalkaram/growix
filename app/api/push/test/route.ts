import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sendWebPushToAdmins, sendWebPushNotification, savePushSubscription } from '@/lib/push';
import { isProtectedSuperAdmin } from '@/lib/super-admins';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const isAdmin = (session?.user as any)?.role === 'admin' || isProtectedSuperAdmin(session?.user?.email || session?.user?.id);

    if (!session?.user || !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح لك بإرسال إشعارات الاختبار (خاص بالمسؤولين فقط)' },
        { status: 403 }
      );
    }

    let targetSubscription: any = null;
    try {
      const body = await req.json();
      if (body?.subscription?.endpoint && body?.subscription?.keys) {
        targetSubscription = body.subscription;
      }
    } catch {
      // Body is optional
    }

    const testPayload = {
      title: '🔔 إشعار تجريبي فوري من GROWIX',
      body: 'تهانينا! نظام الإشعارات الفورية (Web Push) يعمل الآن بكفاءة وسرعة فائقة على هاتفك iPhone.',
      url: '/admin',
      type: 'test' as const,
      tag: `test-push-${Date.now()}`,
      timestamp: Date.now(),
    };

    let result;
    if (targetSubscription) {
      // Ensure this active device is saved to database with admin role
      try {
        await savePushSubscription(
          {
            endpoint: targetSubscription.endpoint,
            keys: targetSubscription.keys,
            userAgent: req.headers.get('user-agent') || undefined,
          },
          session?.user?.id,
          'admin'
        );
      } catch (saveErr) {
        console.warn('[WebPush] Error upserting test subscription:', saveErr);
      }

      result = await sendWebPushNotification(
        [
          {
            endpoint: targetSubscription.endpoint,
            p256dh: targetSubscription.keys.p256dh,
            auth: targetSubscription.keys.auth,
          },
        ],
        testPayload
      );
    } else {
      result = await sendWebPushToAdmins(testPayload);
    }

    if (result.sentCount > 0) {
      return NextResponse.json({
        success: true,
        message: `تم إرسال إشعار الاختبار بنجاح إلى ${result.sentCount} جهاز! تفقد شاشة هاتفك الآن 🚀`,
        sentCount: result.sentCount,
        failedCount: result.failedCount,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'لم يتم العثور على أجهزة مشتركة حالياً. يرجى الضغط على زر "تفعيل الإشعارات" من هاتفك أولاً والتأكد من إضافته للشاشة الرئيسية.',
      });
    }
  } catch (err: any) {
    console.error('Error in POST /api/push/test:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'حدث خطأ أثناء إرسال إشعار الاختبار' },
      { status: 500 }
    );
  }
}
