import { Resend } from 'resend';
import { SITE_CONFIG } from '@/config/site';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const DEFAULT_FROM = process.env.RESEND_FROM_EMAIL || 'GROWIX <support@belalkaram.dev>';
const SITE_URL = process.env.NEXTAUTH_URL || 'https://growix.belalkaram.dev';

export interface WelcomeEmailParams {
  to: string;
  customerName: string;
  packageName: string;
  orderId: string;
  amount: string;
  senderNumber: string;
  loginEmail: string;
  loginPassword: string;
  magicLoginUrl: string;
}

export interface OrderApprovedEmailParams {
  to: string;
  customerName: string;
  packageName: string;
  orderId: string;
  magicLoginUrl: string;
}

/**
 * 📧 Sends branded welcome email with account credentials & 1-click magic login link
 */
export async function sendWelcomeOrderEmail(params: WelcomeEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!resend) {
    console.warn('[Resend] RESEND_API_KEY is not configured. Skipping email dispatch.');
    return { success: false, error: 'RESEND_API_KEY_NOT_CONFIGURED' };
  }

  const {
    to,
    customerName,
    packageName,
    orderId,
    amount,
    senderNumber,
    loginEmail,
    loginPassword,
    magicLoginUrl,
  } = params;

  try {
    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>مرحباً بك في منصة GROWIX</title>
</head>
<body style="margin: 0; padding: 0; background-color: #070C1A; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #FFFFFF; direction: rtl; text-align: right;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #070C1A; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #0F172A; border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.1); overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding: 35px 30px 25px; background: linear-gradient(135deg, #0B1220 0%, #111E38 100%); border-bottom: 2px solid #00FF87; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 900; color: #00FF87; letter-spacing: 1px;">GROWIX</h1>
              <p style="margin: 6px 0 0; font-size: 13px; color: #94A3B8; font-weight: 600;">منصة التسويق والأتمتة الذكية وحزمة الـ 12 أداة</p>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="margin: 0 0 10px; font-size: 20px; font-weight: 800; color: #FFFFFF;">
                أهلاً بك يا ${customerName} 🎉
              </h2>
              <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.7; color: #CBD5E1;">
                تم استلام طلبك بنجاح لشراء <strong style="color: #00FF87;">${packageName}</strong> بقيمة <strong>${amount} جنية</strong>. تم إنشاء حسابك وتجهيز كافة الأدوات والكورسات الخاصة بك.
              </p>

              <!-- Magic Login CTA Box (Primary Action) -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 25px 0; background: linear-gradient(135deg, rgba(0, 255, 135, 0.1) 0%, rgba(15, 157, 88, 0.15) 100%); border: 1.5px solid #00FF87; border-radius: 18px; padding: 20px; text-align: center;">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 12px; font-size: 13px; font-weight: 700; color: #00FF87;">
                      ⚡ الدخول المباشر بنقرة واحدة (بدون الحاجة لكتابة كلمة سر)
                    </p>
                    <a href="${magicLoginUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #00FF87 0%, #00E676 100%); color: #0A1128; font-size: 15px; font-weight: 900; text-decoration: none; border-radius: 14px; box-shadow: 0 10px 20px rgba(0, 255, 135, 0.3);">
                      دخول حسابي فوراً والبدء الآن 🚀
                    </a>
                    <p style="margin: 10px 0 0; font-size: 11px; color: #94A3B8;">
                      يعمل الرابط مباشرة على متصفح هاتفك أو جهاز الكمبيوتر
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Credentials Box -->
              <div style="background-color: #070C1A; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 18px 20px; margin: 20px 0;">
                <p style="margin: 0 0 10px; font-size: 13px; font-weight: 700; color: #38BDF8;">
                  🔑 بيانات تسجيل الدخول الخاصة بحسابك:
                </p>
                <table width="100%" style="font-size: 13px; color: #E2E8F0;">
                  <tr>
                    <td style="padding: 4px 0; color: #94A3B8; width: 110px;">البريد الإلكتروني:</td>
                    <td style="padding: 4px 0; font-weight: 700; color: #FFFFFF; direction: ltr; text-align: right;">${loginEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #94A3B8;">كلمة المرور:</td>
                    <td style="padding: 4px 0; font-weight: 700; color: #00FF87; direction: ltr; text-align: right;">${loginPassword}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #94A3B8;">رقم الطلب:</td>
                    <td style="padding: 4px 0; font-family: monospace; color: #CBD5E1;">${orderId.slice(0, 8)}...</td>
                  </tr>
                </table>
              </div>

              <!-- Important Steps & Links -->
              <p style="margin: 20px 0 10px; font-size: 13px; font-weight: 700; color: #FFFFFF;">
                ماذا تفعل الآن؟
              </p>
              <ul style="margin: 0 0 20px; padding-right: 20px; font-size: 13px; color: #94A3B8; line-height: 1.8;">
                <li>اضغط على زر <strong style="color: #00FF87;">دخول حسابي</strong> للوصول المباشر إلى صفحة طلباتك.</li>
                <li>ستجد فيديوهات الشروحات وروابط تحميل البرامج الـ 12 وهدية داتا مصر التسويقية جاهزة لك.</li>
                <li>في حال واجهت أي استفسار، تواصل معنا عبر الواتساب فوراً.</li>
              </ul>

              <!-- Support Buttons -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 25px; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 20px;">
                <tr>
                  <td align="center">
                    <a href="https://wa.me/${SITE_CONFIG.whatsappNumber}" target="_blank" style="display: inline-block; margin: 5px; padding: 10px 20px; background-color: #25D366; color: #FFFFFF; font-size: 12px; font-weight: 700; text-decoration: none; border-radius: 10px;">
                      💬 الدعم الفني عبر الواتساب
                    </a>
                    <a href="${SITE_URL}/login" target="_blank" style="display: inline-block; margin: 5px; padding: 10px 20px; background-color: rgba(255, 255, 255, 0.1); color: #FFFFFF; font-size: 12px; font-weight: 700; text-decoration: none; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.15);">
                      🌐 صفحة تسجيل الدخول
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px; background-color: #070C1A; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0; font-size: 11px; color: #64748B;">
                © ${new Date().getFullYear()} GROWIX Platform — جميع الحقوق محفوظة
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const data = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [to],
      subject: `🎉 تم تأكيد اشتراكك في GROWIX — بيانات الدخول وروابط الأدوات (${packageName})`,
      html,
    });

    console.log(`[Resend] Welcome email dispatched successfully to ${to}. Email ID: ${data.data?.id}`);
    return { success: true, id: data.data?.id };
  } catch (error: any) {
    console.error('[Resend] Error sending welcome email:', error);
    return { success: false, error: error?.message || 'FAILED_TO_SEND_EMAIL' };
  }
}

/**
 * 📧 Sends instant notification when an order is Approved
 */
export async function sendOrderApprovedEmail(params: OrderApprovedEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!resend) {
    return { success: false, error: 'RESEND_API_KEY_NOT_CONFIGURED' };
  }

  const { to, customerName, packageName, magicLoginUrl } = params;

  try {
    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="UTF-8"><title>تم تفعيل اشتراكك في GROWIX</title></head>
<body style="margin: 0; padding: 25px; background-color: #070C1A; font-family: sans-serif; color: #FFFFFF; direction: rtl; text-align: right;">
  <div style="max-width: 580px; margin: auto; background-color: #0F172A; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); padding: 30px;">
    <h2 style="color: #00FF87; margin-top: 0;">تهانينا يا ${customerName}! تم تفعيل اشتراكك بنجاح 🚀</h2>
    <p style="color: #CBD5E1; font-size: 14px; line-height: 1.7;">
      يسعدنا إبلاغك بأنه تم تفعيل باقتك <strong style="color: #00FF87;">${packageName}</strong> رسمياً. أصبحت كافة أدوات التسويق والكورسات ومصادر التحميل متاحة لك الآن بالكامل.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${magicLoginUrl}" target="_blank" style="padding: 14px 28px; background-color: #00FF87; color: #0A1128; font-size: 15px; font-weight: bold; text-decoration: none; border-radius: 12px; display: inline-block;">
        فتح حسابي وتحميل الأدوات الآن 📥
      </a>
    </div>
    <p style="font-size: 12px; color: #94A3B8; text-align: center;">
      فريق دعم GROWIX متواجد دائماً لمساعدتك في أي وقت.
    </p>
  </div>
</body>
</html>
    `;

    const data = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [to],
      subject: `✅ تم تفعيل حسابك رسمياً في GROWIX — ابدأ استخدام ${packageName} الآن`,
      html,
    });

    return { success: true, id: data.data?.id };
  } catch (error: any) {
    console.error('[Resend] Error sending approval email:', error);
    return { success: false, error: error?.message };
  }
}
