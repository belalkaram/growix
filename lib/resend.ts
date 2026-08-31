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
 * 📧 Sends ultra-premium branded welcome email with account credentials & 1-click magic login link
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
<body style="margin: 0; padding: 0; background-color: #070C1A; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Tahoma, Geneva, Verdana, sans-serif; color: #FFFFFF; direction: rtl; text-align: right; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #070C1A; padding: 35px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #0F172A; border-radius: 28px; border: 1.5px solid rgba(0, 255, 135, 0.3); overflow: hidden; box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7);">
          
          <!-- Header Banner with Cyber Glow -->
          <tr>
            <td style="padding: 40px 30px 30px; background: linear-gradient(135deg, #0B1220 0%, #111E38 50%, #0B1220 100%); border-bottom: 2px solid #00FF87; text-align: center;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center" style="margin-bottom: 12px;">
                <tr>
                  <td style="background-color: rgba(0, 255, 135, 0.15); border: 1px solid rgba(0, 255, 135, 0.4); border-radius: 50px; padding: 5px 16px;">
                    <span style="color: #00FF87; font-size: 11px; font-weight: 800; letter-spacing: 0.5px;">✨ منصة التسويق والأتمتة الذكية</span>
                  </td>
                </tr>
              </table>

              <h1 style="margin: 0; font-size: 32px; font-weight: 900; color: #00FF87; letter-spacing: 2px; text-shadow: 0 0 20px rgba(0, 255, 135, 0.4);">
                GROWIX
              </h1>
              <p style="margin: 6px 0 0; font-size: 13px; color: #94A3B8; font-weight: 600;">
                حزمة الـ 12 برنامج تسويقي + الكورس الشامل + داتا مصر
              </p>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 35px 30px 30px;">
              
              <h2 style="margin: 0 0 12px; font-size: 22px; font-weight: 900; color: #FFFFFF;">
                أهلاً بك يا ${customerName} 🎉
              </h2>
              
              <p style="margin: 0 0 25px; font-size: 14px; line-height: 1.8; color: #CBD5E1;">
                يسعدنا انضمامك إلى <strong>منصة GROWIX</strong>! تم استلام وتوثيق طلبك بنجاح لشراء <span style="color: #00FF87; font-weight: 800;">${packageName}</span> بقيمة <strong style="color: #FFFFFF;">${amount} جنية</strong>، وتم إنشاء حسابك وتجهيز مساحة الأدوات الخاصة بك فوراً.
              </p>

              <!-- ⚡ 1-Click Magic Login Primary Action Card -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 25px 0; background: linear-gradient(135deg, rgba(0, 255, 135, 0.12) 0%, rgba(15, 157, 88, 0.2) 100%); border: 2px solid #00FF87; border-radius: 22px; padding: 25px; text-align: center; box-shadow: 0 10px 25px rgba(0, 255, 135, 0.15);">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 15px; font-size: 13px; font-weight: 800; color: #00FF87;">
                      ⚡ الدخول السريع بنقرة واحدة (بدون كتابة كلمة سر)
                    </p>
                    
                    <a href="${magicLoginUrl}" target="_blank" style="display: inline-block; padding: 16px 36px; background: linear-gradient(135deg, #00FF87 0%, #00E676 100%); color: #0A1128; font-size: 15px; font-weight: 900; text-decoration: none; border-radius: 16px; box-shadow: 0 12px 25px rgba(0, 255, 135, 0.35); text-transform: uppercase; letter-spacing: 0.5px;">
                      دخول حسابي فوراً والبدء الآن 🚀
                    </a>

                    <p style="margin: 12px 0 0; font-size: 11.5px; color: #94A3B8;">
                      يعمل الرابط مباشرة على متصفح هاتفك أو جهاز الكمبيوتر الخاص بك
                    </p>
                  </td>
                </tr>
              </table>

              <!-- 🔑 Login Credentials Box -->
              <div style="background-color: #070C1A; border: 1.5px solid rgba(255, 255, 255, 0.1); border-radius: 20px; padding: 22px; margin: 25px 0;">
                <p style="margin: 0 0 15px; font-size: 13.5px; font-weight: 800; color: #38BDF8; display: flex; align-items: center; gap: 6px;">
                  🔑 بيانات تسجيل الدخول لحسابك (احفظها لديك):
                </p>

                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px; color: #E2E8F0;">
                  <tr>
                    <td style="padding: 7px 0; color: #94A3B8; width: 120px; font-weight: 600;">البريد الإلكتروني:</td>
                    <td style="padding: 7px 0; font-weight: 800; color: #FFFFFF; direction: ltr; text-align: right; font-family: monospace; font-size: 13.5px;">${loginEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 7px 0; color: #94A3B8; font-weight: 600;">كلمة المرور:</td>
                    <td style="padding: 7px 0; font-weight: 900; color: #00FF87; direction: ltr; text-align: right; font-family: monospace; font-size: 14px;">${loginPassword}</td>
                  </tr>
                  <tr>
                    <td style="padding: 7px 0; color: #94A3B8; font-weight: 600;">الباقة المختارة:</td>
                    <td style="padding: 7px 0; font-weight: 700; color: #FFFFFF;">${packageName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 7px 0; color: #94A3B8; font-weight: 600;">رقم المعاملة:</td>
                    <td style="padding: 7px 0; font-family: monospace; color: #94A3B8; font-size: 11.5px; direction: ltr; text-align: right;">#${orderId.slice(0, 10)}...</td>
                  </tr>
                </table>
              </div>

              <!-- 📦 Next Steps Checklist -->
              <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; padding: 20px; margin: 25px 0;">
                <p style="margin: 0 0 12px; font-size: 13.5px; font-weight: 800; color: #FFFFFF;">
                  ماذا تجد داخل حسابك الآن؟
                </p>
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 12.5px; color: #CBD5E1; line-height: 1.8;">
                  <tr>
                    <td style="padding: 4px 0; color: #00FF87; width: 22px; vertical-align: top;">✓</td>
                    <td style="padding: 4px 0;"><strong>روابط تحميل البرامج الـ 12:</strong> مفعلة بالكامل مدى الحياة مع التحديثات.</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #00FF87; width: 22px; vertical-align: top;">✓</td>
                    <td style="padding: 4px 0;"><strong>فيديوهات الشرح والتشغيل:</strong> شروحات عملية خطوة بخطوة لكل أداة.</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #00FF87; width: 22px; vertical-align: top;">✓</td>
                    <td style="padding: 4px 0;"><strong>هدية داتا مصر التسويقية:</strong> قاعدة بيانات ضخمة ومقسمة للأنشطة والمحافظات.</td>
                  </tr>
                </table>
              </div>

              <!-- Support & Quick Actions -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 30px; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 25px;">
                <tr>
                  <td align="center">
                    <a href="https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(`مرحباً، لدي استفسار بخصوص طلبي ${orderId}`)}" target="_blank" style="display: inline-block; margin: 6px; padding: 12px 22px; background-color: #25D366; color: #FFFFFF; font-size: 12.5px; font-weight: 800; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3);">
                      💬 التواصل عبر الواتساب
                    </a>
                    <a href="${SITE_URL}/login" target="_blank" style="display: inline-block; margin: 6px; padding: 12px 22px; background-color: rgba(255, 255, 255, 0.08); color: #FFFFFF; font-size: 12.5px; font-weight: 800; text-decoration: none; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.2);">
                      🌐 صفحة تسجيل الدخول
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px; background-color: #070C1A; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.08);">
              <p style="margin: 0 0 6px; font-size: 11px; color: #64748B;">
                © ${new Date().getFullYear()} GROWIX Platform — جميع الحقوق محفوظة | منصة تسويقية مشفرة وآمنة 100%
              </p>
              <p style="margin: 0; font-size: 10px; color: #475569;">
                تم إرسال هذا البريد الإلكتروني تلقائياً لتأكيد اشتراكك في منصة GROWIX
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

  const { to, customerName, packageName, orderId, magicLoginUrl } = params;

  try {
    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تم تفعيل اشتراكك في GROWIX</title>
</head>
<body style="margin: 0; padding: 0; background-color: #070C1A; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Tahoma, Geneva, Verdana, sans-serif; color: #FFFFFF; direction: rtl; text-align: right; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #070C1A; padding: 35px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #0F172A; border-radius: 28px; border: 1.5px solid rgba(0, 255, 135, 0.3); overflow: hidden; box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7);">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding: 35px 30px 25px; background: linear-gradient(135deg, #0B1220 0%, #111E38 50%, #0B1220 100%); border-bottom: 2px solid #00FF87; text-align: center;">
              <h1 style="margin: 0; font-size: 30px; font-weight: 900; color: #00FF87; letter-spacing: 2px;">
                GROWIX
              </h1>
              <p style="margin: 6px 0 0; font-size: 13px; color: #94A3B8; font-weight: 600;">
                تم تفعيل الاشتراك رسمياً بنجاح ✅
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 35px 30px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <div style="display: inline-block; width: 60px; height: 60px; border-radius: 50%; background-color: rgba(0, 255, 135, 0.15); border: 2px solid #00FF87; line-height: 60px; font-size: 28px; color: #00FF87;">
                  ✓
                </div>
              </div>

              <h2 style="margin: 0 0 10px; font-size: 22px; font-weight: 900; color: #FFFFFF; text-align: center;">
                تهانينا يا ${customerName}! تم تفعيل باقتك 🚀
              </h2>
              
              <p style="margin: 0 0 25px; font-size: 14px; line-height: 1.8; color: #CBD5E1; text-align: center;">
                يسعدنا إبلاغك بأنه تم تأكيد وتفعيل <strong style="color: #00FF87;">${packageName}</strong> رسمياً على حسابك. أصبحت كافة أدوات التسويق والكورسات ومصادر التحميل متاحة لك الآن بالكامل.
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 25px 0; text-align: center;">
                <tr>
                  <td align="center">
                    <a href="${magicLoginUrl}" target="_blank" style="display: inline-block; padding: 16px 36px; background: linear-gradient(135deg, #00FF87 0%, #00E676 100%); color: #0A1128; font-size: 15px; font-weight: 900; text-decoration: none; border-radius: 16px; box-shadow: 0 12px 25px rgba(0, 255, 135, 0.35);">
                      فتح لوحة أدواتي وتحميل البرامج الآن 📥
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Order Reference -->
              <div style="background-color: #070C1A; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 16px 20px; text-align: center; margin: 20px 0;">
                <span style="font-size: 12px; color: #94A3B8;">رقم الطلب المعتمد:</span>
                <span style="font-family: monospace; font-weight: 800; color: #00FF87; font-size: 13px; margin-right: 6px; direction: ltr; display: inline-block;">#${orderId}</span>
              </div>

              <!-- Support Link -->
              <div style="text-align: center; margin-top: 25px; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 20px;">
                <a href="https://wa.me/${SITE_CONFIG.whatsappNumber}" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #25D366; color: #FFFFFF; font-size: 12px; font-weight: 800; text-decoration: none; border-radius: 10px;">
                  💬 التواصل مع الدعم الفني عبر واتساب
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px; background-color: #070C1A; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.08);">
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
      subject: `✅ تم تفعيل حسابك رسمياً في GROWIX — ابدأ استخدام ${packageName} الآن`,
      html,
    });

    return { success: true, id: data.data?.id };
  } catch (error: any) {
    console.error('[Resend] Error sending approval email:', error);
    return { success: false, error: error?.message };
  }
}
