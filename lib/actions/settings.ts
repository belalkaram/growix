'use server';

import { db } from '@/db';
import { siteSettings } from '@/db/schema';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function updateSiteSettingsAction(settingsMap: Record<string, string>) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  try {
    for (const [key, value] of Object.entries(settingsMap)) {
      await db
        .insert(siteSettings)
        .values({
          key,
          value,
        })
        .onConflictDoUpdate({
          target: siteSettings.key,
          set: {
            value,
            updatedAt: new Date(),
          },
        });
    }

    revalidatePath('/');
    revalidatePath('/admin/settings');
    revalidatePath('/tools');
    return { success: true };
  } catch (error) {
    console.error('Update settings error:', error);
    return { success: false, error: 'حدث خطأ أثناء حفظ الإعدادات' };
  }
}

export async function getSiteSettingsAction(): Promise<Record<string, string>> {
  try {
    const rows = await db.select().from(siteSettings);
    const map: Record<string, string> = {};
    rows.forEach((r) => {
      map[r.key] = r.value;
    });
    return map;
  } catch (err) {
    return {};
  }
}

export async function testTelegramConnectionAction(token?: string, chatId?: string): Promise<{ success: boolean; message: string }> {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return { success: false, message: 'غير مصرح بالوصول' };
  }

  let targetToken = token?.trim();
  let targetChatId = chatId?.trim();

  if (!targetToken || !targetChatId) {
    const settings = await getSiteSettingsAction();
    targetToken = targetToken || settings.telegram_bot_token;
    targetChatId = targetChatId || settings.telegram_chat_id;
  }

  if (!targetToken || !targetChatId) {
    return { success: false, message: 'يرجى إدخال توكن البوت ومعرّف الشات (Token & Chat ID) أولاً.' };
  }

  try {
    const nowStr = new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' });
    const res = await fetch(`https://api.telegram.org/bot${targetToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: targetChatId,
        text: `🟢 <b>تم بنجاح ربط منصة GROWIX مع بوت تليجرام!</b>\n\n⏰ وقت الفحص: ${nowStr}\n📡 الحالة: البوت نشط وجاهز لاستقبال إشعارات الاشتراكات والتحويلات اللحظية.`,
        parse_mode: 'HTML',
      }),
    });

    const data = await res.json();
    if (data.ok) {
      return { success: true, message: 'تم إرسال رسالة الاختبار إلى تليجرام بنجاح! 🟢' };
    } else {
      return { success: false, message: `فشل الإرسال من تليجرام: ${data.description || 'تأكد من صحة التوكن والـ Chat ID'}` };
    }
  } catch (err: any) {
    return { success: false, message: `خطأ في الاتصال: ${err.message}` };
  }
}

