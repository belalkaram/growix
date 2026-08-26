import { db } from '@/db';
import { siteSettings, orders, users, packages, tools } from '@/db/schema';
import { inArray, eq } from 'drizzle-orm';
import { decryptSensitiveData } from '@/lib/encryption';

export interface TelegramOrderPayload {
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

export interface TelegramOrderStatusPayload {
  orderId: string;
  status: 'approved' | 'rejected';
  approvalType?: 'manual' | 'auto';
  adminNotes?: string | null;
  userName?: string;
  userEmail?: string;
  userPhone?: string | null;
  packageName?: string;
  toolName?: string | null;
  amount?: string;
  originalAmount?: string | null;
  discountAmount?: string | null;
  couponCode?: string | null;
  paymentMethod?: string;
  senderNumber?: string;
  updatedAt?: Date;
}

export async function getTelegramCredentials() {
  let token = process.env.TELEGRAM_BOT_TOKEN || '';
  let chatId = process.env.TELEGRAM_CHAT_ID || '';
  let alertsEnabled = true;

  try {
    const settings = await db
      .select()
      .from(siteSettings)
      .where(inArray(siteSettings.key, ['telegram_bot_token', 'telegram_chat_id', 'telegram_alerts_enabled']));

    for (const s of settings) {
      if (s.key === 'telegram_bot_token' && s.value) {
        token = decryptSensitiveData(s.value.trim());
      }
      if (s.key === 'telegram_chat_id' && s.value) {
        chatId = decryptSensitiveData(s.value.trim());
      }
      if (s.key === 'telegram_alerts_enabled') {
        alertsEnabled = s.value !== 'false';
      }
    }
  } catch (err) {
    console.error('Error fetching telegram credentials from db:', err);
  }

  return { token, chatId, alertsEnabled };
}

export async function sendTelegramOrderAlert(payload: TelegramOrderPayload): Promise<{ success: boolean; error?: string }> {
  const { token, chatId, alertsEnabled } = await getTelegramCredentials();

  if (!alertsEnabled) {
    console.log('ℹ️ Telegram alerts are disabled in site settings. Skipping alert.');
    return { success: true };
  }

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

export async function sendTelegramOrderStatusAlert(payload: TelegramOrderStatusPayload): Promise<{ success: boolean; error?: string }> {
  const { token, chatId, alertsEnabled } = await getTelegramCredentials();

  if (!alertsEnabled) {
    console.log('ℹ️ Telegram alerts are disabled in site settings. Skipping status alert.');
    return { success: true };
  }

  if (!token || !chatId) {
    console.log('⚠️ Telegram bot credentials not configured. Skipping status alert.');
    return { success: false, error: 'Telegram credentials not configured' };
  }

  try {
    let userName = payload.userName;
    let userEmail = payload.userEmail;
    let userPhone = payload.userPhone;
    let packageName = payload.packageName;
    let toolName = payload.toolName;
    let amount = payload.amount;
    let paymentMethod = payload.paymentMethod;
    let senderNumber = payload.senderNumber;
    let couponCode = payload.couponCode;

    // If details are missing, fetch complete order and user details from DB
    if (!userName || !amount || !packageName) {
      try {
        const [ord] = await db
          .select({
            order: orders,
            user: users,
          })
          .from(orders)
          .leftJoin(users, eq(orders.userId, users.id))
          .where(eq(orders.id, payload.orderId))
          .limit(1);

        if (ord) {
          userName = userName || ord.user?.name || 'عميل GROWIX';
          userEmail = userEmail || ord.user?.email || '—';
          userPhone = userPhone || ord.user?.phone || null;
          amount = amount || ord.order.amount;
          paymentMethod = paymentMethod || (ord.order.paymentMethod === 'instapay' ? 'إنستاباي (InstaPay)' : 'محفظة إلكترونية');
          senderNumber = senderNumber || ord.order.senderNumber;
          couponCode = couponCode || ord.order.couponCode;

          if (!packageName) {
            if (ord.order.packageId === 'bundle-vip') packageName = 'باقة VIP الشاملة (12 أداة + كورس)';
            else if (ord.order.packageId === 'bundle-premium') packageName = 'باقة Premium (12 أداة + داتا)';
            else if (ord.order.packageId === 'single-tool') packageName = 'باقة أداة فردية';
            else {
              const [customPkg] = await db.select().from(packages).where(eq(packages.id, ord.order.packageId)).limit(1);
              packageName = customPkg ? customPkg.name : ord.order.packageId;
            }
          }

          if (ord.order.toolId && !toolName) {
            const [matchedTool] = await db.select().from(tools).where(eq(tools.id, ord.order.toolId)).limit(1);
            if (matchedTool) {
              toolName = matchedTool.name;
            }
          }
        }
      } catch (dbErr) {
        console.error('Error fetching order details for telegram status alert:', dbErr);
      }
    }

    const dateStr = (payload.updatedAt ? new Date(payload.updatedAt) : new Date()).toLocaleString('ar-EG', {
      timeZone: 'Africa/Cairo',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const isApproved = payload.status === 'approved';
    const isAuto = payload.approvalType === 'auto';

    const toolLine = toolName ? `\n🛠 <b>البرنامج المختار:</b> ${toolName}` : '';
    const phoneLine = userPhone ? `\n📱 <b>هاتف الحساب:</b> <code>${userPhone}</code>` : '';
    const couponLine = couponCode ? `\n🎟 <b>الكوبون:</b> <code>${couponCode}</code>` : '';
    const notesLine = payload.adminNotes ? `\n📝 <b>ملاحظات الإدارة:</b> <i>${payload.adminNotes}</i>` : '';

    let message = '';
    if (isApproved) {
      message = `
✅ <b>تم قبول وتفعيل طلب الاشتراك في GROWIX!</b>
━━━━━━━━━━━━━━━━━━━━
🆔 <b>رقم الطلب:</b> <code>${payload.orderId}</code>
⏰ <b>وقت التفعيل:</b> ${dateStr}

👤 <b>بيانات المشترك:</b>
• <b>الاسم:</b> ${userName || 'عميل GROWIX'}
• <b>البريد:</b> <code>${userEmail || '—'}</code>${phoneLine}

📦 <b>تفاصيل الاشتراك المُفعل:</b>
• <b>الباقة:</b> ${packageName || 'باقة غير محددة'}${toolLine}
• <b>المبلغ:</b> <b>${amount || '0'} جنية</b>${couponLine}
• <b>طريقة الدفع:</b> ${paymentMethod || 'تحويل إلكتروني'} (<code>${senderNumber || '—'}</code>)

⚡ <b>طريقة التفعيل:</b> ${isAuto ? '🤖 تفعيل تلقائي فوري (Webhook / Auto-Match)' : '👤 تفعيل يدوي من لوحة التحكم (Admin)'}
${notesLine}
━━━━━━━━━━━━━━━━━━━━
🎉 <i>تم تفعيل الحساب والصلاحيات بالكامل بنجاح للمشترك.</i>
      `.trim();
    } else {
      message = `
❌ <b>تم رفض طلب الاشتراك في GROWIX</b>
━━━━━━━━━━━━━━━━━━━━
🆔 <b>رقم الطلب:</b> <code>${payload.orderId}</code>
⏰ <b>وقت الرفض:</b> ${dateStr}

👤 <b>بيانات العميل:</b>
• <b>الاسم:</b> ${userName || 'عميل GROWIX'}
• <b>البريد:</b> <code>${userEmail || '—'}</code>${phoneLine}

📦 <b>تفاصيل الطلب:</b>
• <b>الباقة:</b> ${packageName || 'باقة غير محددة'}${toolLine}
• <b>المبلغ:</b> <b>${amount || '0'} جنية</b>
• <b>طريقة الدفع:</b> ${paymentMethod || 'تحويل إلكتروني'} (<code>${senderNumber || '—'}</code>)

🚫 <b>الحالة الجديدة:</b> مرفوض (Rejected)
${notesLine}
━━━━━━━━━━━━━━━━━━━━
⚠️ <i>تم رفض الطلب ولن يتم تفعيل الصلاحيات للحساب.</i>
      `.trim();
    }

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
      console.error('Telegram API error (status alert):', data);
      return { success: false, error: data.description || 'Telegram API error' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Failed to send Telegram status alert:', err);
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

  targetToken = decryptSensitiveData(targetToken);
  targetChatId = decryptSensitiveData(targetChatId);

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

export interface TelegramLoginPayload {
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string | null;
  role?: string;
  ip?: string;
  userAgent?: string;
  loginTime?: Date;
}

export async function sendTelegramLoginAlert(payload: TelegramLoginPayload): Promise<{ success: boolean; error?: string }> {
  const { token, chatId, alertsEnabled } = await getTelegramCredentials();

  if (!alertsEnabled) {
    return { success: true };
  }

  if (!token || !chatId) {
    return { success: false, error: 'Telegram credentials not configured' };
  }

  try {
    const timeStr = (payload.loginTime ? new Date(payload.loginTime) : new Date()).toLocaleString('ar-EG', {
      timeZone: 'Africa/Cairo',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const phoneLine = payload.userPhone ? `\n📱 <b>الهاتف:</b> <code>${payload.userPhone}</code>` : '';
    const roleBadge = payload.role === 'admin' ? '👑 مسؤول (Admin)' : '👤 مستخدم (User)';

    const message = `
🔐 <b>تسجيل دخول جديد إلى منصة GROWIX!</b>
━━━━━━━━━━━━━━━━━━━━
⏰ <b>الوقت والتاريخ:</b> ${timeStr}

👤 <b>بيانات الحساب:</b>
• <b>الاسم:</b> ${payload.userName}
• <b>البريد:</b> <code>${payload.userEmail}</code>${phoneLine}
• <b>نوع الحساب:</b> ${roleBadge}
• <b>معرف المستخدم:</b> <code>${payload.userId}</code>
━━━━━━━━━━━━━━━━━━━━
💡 <i>تم تسجيل الدخول بنجاح إلى لوحة المنصة.</i>
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
      console.error('Telegram login alert API error:', data);
      return { success: false, error: data.description || 'Telegram API error' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Failed to send Telegram login alert:', err);
    return { success: false, error: err?.message || 'Network error' };
  }
}

export interface TelegramNewUserPayload {
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string | null;
  role?: string;
  source: 'web_register' | 'admin_manual' | 'admin_auto';
  autoPassword?: string;
  createdAt?: Date;
}

export async function sendTelegramNewUserAlert(payload: TelegramNewUserPayload): Promise<{ success: boolean; error?: string }> {
  const { token, chatId, alertsEnabled } = await getTelegramCredentials();

  if (!alertsEnabled) {
    return { success: true };
  }

  if (!token || !chatId) {
    return { success: false, error: 'Telegram credentials not configured' };
  }

  try {
    const timeStr = (payload.createdAt ? new Date(payload.createdAt) : new Date()).toLocaleString('ar-EG', {
      timeZone: 'Africa/Cairo',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const phoneLine = payload.userPhone ? `\n📱 <b>الهاتف / الواتساب:</b> <code>${payload.userPhone}</code>` : '';
    const passwordLine = payload.autoPassword ? `\n🔑 <b>كلمة المرور المولدة:</b> <code>${payload.autoPassword}</code>` : '';

    let sourceTitle = '🎉 <b>تسجيل حساب مستخدم جديد في منصة GROWIX!</b>';
    let sourceLabel = '🌐 تسجيل ذاتي عبر الموقع (Web Registration)';

    if (payload.source === 'admin_manual') {
      sourceTitle = '👤 <b>تم إنشاء مستخدم جديد من لوحة تحكم الأدمن!</b>';
      sourceLabel = '🛠 تم الإنشاء يدوياً بواسطة المدير (Admin Manual)';
    } else if (payload.source === 'admin_auto') {
      sourceTitle = '⚡ <b>تم توليد حساب مستخدم تلقائي (1-Click)!</b>';
      sourceLabel = '🤖 تم التوليد بنقرة واحدة من لوحة التحكم (Auto Generated)';
    }

    const roleBadge = payload.role === 'admin' 
      ? '👑 مسؤول (Admin)' 
      : payload.role === 'test' 
      ? '🧪 تجريبي (Test)' 
      : '👤 مستخدم عادي (User)';

    const message = `
${sourceTitle}
━━━━━━━━━━━━━━━━━━━━
⏰ <b>الوقت والتاريخ:</b> ${timeStr}
📡 <b>طريقة الإنشاء:</b> ${sourceLabel}

👤 <b>بيانات الحساب:</b>
• <b>الاسم:</b> ${payload.userName}
• <b>البريد:</b> <code>${payload.userEmail}</code>${phoneLine}${passwordLine}
• <b>نوع الحساب / الرتبة:</b> ${roleBadge}
• <b>معرف المستخدم (ID):</b> <code>${payload.userId}</code>
━━━━━━━━━━━━━━━━━━━━
✨ <i>تم تسجيل وحفظ بيانات الحساب بنجاح في قاعدة البيانات.</i>
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
      console.error('Telegram new user alert API error:', data);
      return { success: false, error: data.description || 'Telegram API error' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Failed to send Telegram new user alert:', err);
    return { success: false, error: err?.message || 'Network error' };
  }
}



