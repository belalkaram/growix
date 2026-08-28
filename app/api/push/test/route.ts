import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sendWebPushToAdmins, sendWebPushNotification } from '@/lib/push';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
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
      title: '🔔 إشعار اختبار Web Push من GROWIX',
      body: 'تهانينا! نظام الإشعارات الفورية (Web Push) يعمل الآن بكفاءة وسرعة على هاتفك iPhone.',
      url: '/admin/settings',
      type: 'test' as const,
      tag: `test-push-${Date.now()}`,
      timestamp: Date.now(),
    };

    let result;
    if (targetSubscription) {
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
        message: `تم إرسال إشعار الاختبار بنجاح إلى ${result.sentCount} جهاز!`,
        sentCount: result.sentCount,
        failedCount: result.failedCount,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'لم يتم العثور على أجهزة مشتركة حالياً. يرجى تفعيل الإشعارات أولاً من هاتفك.',
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
