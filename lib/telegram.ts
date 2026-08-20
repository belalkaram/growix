import { db } from '@/db';
import { siteSettings } from '@/db/schema';
import { inArray } from 'drizzle-orm';

interface TelegramOrderPayload {
  orderId: string;
  userName: string;
  userEmail: string;
  userPhone?: string | null;
  packageName: string;
  toolName?: string | null;
  amount: string;
  originalAmount?: string | null;
  discountAmount?: string | null;
  couponCode?: string | null;
  paymentMethod: string;
  senderNumber: string;
  createdAt?: Date;
}

export async function getTelegramCredentials() {
  let token = process.env.TELEGRAM_BOT_TOKEN || '';
  let chatId = process.env.TELEGRAM_CHAT_ID || '';

  try {
    const settings = await db
      .select()
      .from(siteSettings)
      .where(inArray(siteSettings.key, ['telegram_bot_token', 'telegram_chat_id']));

    for (const s of settings) {
      if (s.key === 'telegram_bot_token' && s.value) token = s.value.trim();
      if (s.key === 'telegram_chat_id' && s.value) chatId = s.value.trim();
    }
  } catch (err) {
    console.error('Error fetching telegram credentials from db:', err);
  }

  return { token, chatId };
}

export async function sendTelegramOrderAlert(payload: TelegramOrderPayload): Promise<{ success: boolean; error?: string }> {
  const { token, chatId } = await getTelegramCredentials();

  if (!token || !chatId) {
    console.log('⚠️ Telegram bot credentials not configured. Skipping alert.');
    return { success: false, error: 'Telegram credentials not configured' };
  }

  try {
    const dateStr = (payload.createdAt ? new Date(payload.createdAt) : new Date()).toLocaleString('ar-EG', {
      timeZone: 'Africa/Cairo',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const couponLine = payload.couponCode
      ? `\n🎟 <b>الكوبون المطبق:</b> <code>${payload.couponCode}</code> (وفّر: ${payload.discountAmount || 0} ج)`
      : '';

    const toolLine = payload.toolName
      ? `\n🛠 <b>البرنامج المختار:</b> ${payload.toolName}`
      : '';

    const phoneLine = payload.userPhone
      ? `\n📱 <b>هاتف الحساب:</b> <code>${payload.userPhone}</code>`
      : '';

    const message = `
🚀 <b>طلب اشتراك وتحويل جديد في GROWIX!</b>
━━━━━━━━━━━━━━━━━━━━
🆔 <b>رقم الطلب:</b> <code>${payload.orderId}</code>
⏰ <b>التاريخ والوقت:</b> ${dateStr}

👤 <b>بيانات العميل:</b>
• <b>الاسم:</b> ${payload.userName}
• <b>البريد:</b> <code>${payload.userEmail}</code>${phoneLine}

📦 <b>تفاصيل الباقة:</b>
• <b>الباقة:</b> ${payload.packageName}${toolLine}
• <b>المبلغ المطلوب:</b> <b>${payload.amount} جنية</b>${couponLine}

💳 <b>بيانات الدفع والتحويل:</b>
• <b>طريقة الدفع:</b> ${payload.paymentMethod}
• <b>رقم/حساب المحوِّل منه:</b> <code>${payload.senderNumber}</code>

⏳ <b>الحالة الحالية:</b> قيد المراجعة والتأكيد (Pending)
━━━━━━━━━━━━━━━━━━━━
<i>يرجى مراجعة الإيصال وتأكيد التفعيل من لوحة تحكم الأدمن.</i>
    `.trim();

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const data = await res.json();
    if (!data.ok) {
      console.error('Telegram API error:', data);
      return { success: false, error: data.description || 'Telegram API error' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Failed to send Telegram alert:', err);
    return { success: false, error: err?.message || 'Network error' };
  }
}

export async function testTelegramConnectionAction(token?: string, chatId?: string): Promise<{ success: boolean; message: string }> {
  let targetToken = token;
  let targetChatId = chatId;

  if (!targetToken || !targetChatId) {
    const creds = await getTelegramCredentials();
    targetToken = targetToken || creds.token;
    targetChatId = targetChatId || creds.chatId;
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
