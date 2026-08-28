import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { savePushSubscription, removePushSubscription, PushSubscriptionClientInput } from '@/lib/push';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();

    const { endpoint, keys } = body;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { success: false, error: 'بيانات الاشتراك في الإشعارات غير مكتملة' },
        { status: 400 }
      );
    }

    const userAgent = req.headers.get('user-agent') || undefined;
    const userId = session?.user?.id || null;
    const userRole = (session?.user as any)?.role || 'user';

    const subInput: PushSubscriptionClientInput = {
      endpoint,
      keys: {
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
      userAgent,
    };

    const result = await savePushSubscription(subInput, userId, userRole);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'تم تسجيل الجهاز لاستقبال الإشعارات بنجاح',
      role: userRole,
    });
  } catch (err: any) {
    console.error('Error in POST /api/push/subscribe:', err);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء حفظ الاشتراك' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json({ success: false, error: 'Endpoint مطلوب' }, { status: 400 });
    }

    await removePushSubscription(endpoint);
    return NextResponse.json({ success: true, message: 'تم إلغاء الاشتراك بنجاح' });
  } catch (err: any) {
    console.error('Error in DELETE /api/push/subscribe:', err);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء إلغاء الاشتراك' },
      { status: 500 }
    );
  }
}
