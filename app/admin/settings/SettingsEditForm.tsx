'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateSiteSettingsAction, testTelegramConnectionAction } from '@/lib/actions/settings';
import { 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  Send, 
  Mail, 
  Clock, 
  FileText, 
  Wrench, 
  ShieldAlert,
  Bot,
  Zap,
  CreditCard,
  Sparkles,
  Megaphone,
  Flame,
  Tag,
  Sliders,
  Link as LinkIcon,
  ArrowLeft
} from 'lucide-react';

export const SettingsEditForm: React.FC<{ initialSettings: Record<string, string> }> = ({ initialSettings }) => {
  const router = useRouter();
  const [maintenanceMode, setMaintenanceMode] = useState(initialSettings.maintenance_mode === 'true');
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    initialSettings.maintenance_message ||
      'الموقع حالياً خاضع للصيانة والتحديثات الدورية لتقديم أفضل تجربة. سنعود للعمل قريباً جداً!'
  );
  const [vodafoneNumber, setVodafoneNumber] = useState(initialSettings.vodafone_number || '01019033661');
  const [instapayId, setInstapayId] = useState(initialSettings.instapay_id || '01019033661');
  const [whatsappNumber, setWhatsappNumber] = useState(initialSettings.whatsapp_number || '966507988705');
  const [whatsappDisplayNumber, setWhatsappDisplayNumber] = useState(initialSettings.whatsapp_display_number || '+966507988705');
  const [telegramUsername, setTelegramUsername] = useState(initialSettings.telegram_username || 'growix_official');
  const [supportPhone, setSupportPhone] = useState(initialSettings.support_phone || '+966507988705');
  const [supportEmail, setSupportEmail] = useState(initialSettings.support_email || 'growix@belalkaram.dev');
  const [workingHours, setWorkingHours] = useState(initialSettings.working_hours || 'دعم فني وتفعيل فوري على مدار 24/7');
  const [heroNotice, setHeroNotice] = useState(initialSettings.hero_notice || 'خصم 65% لفترة محدودة');
  const [heroHeading, setHeroHeading] = useState(
    initialSettings.hero_heading || 'الحل المتكامل للنمو ومضاعفة المبيعات بأقوى أدوات التسويق الذكي'
  );
  const [heroTitle, setHeroTitle] = useState(initialSettings.hero_title || 'أقوى أدوات التسويق الرقمي وإدارة الحملات');

  // Telegram Alert Settings
  const [telegramBotToken, setTelegramBotToken] = useState(initialSettings.telegram_bot_token || '');
  const [telegramChatId, setTelegramChatId] = useState(initialSettings.telegram_chat_id || '');
  const [telegramAlertsEnabled, setTelegramAlertsEnabled] = useState(initialSettings.telegram_alerts_enabled !== 'false');

  // Facebook Pixel Settings
  const [facebookPixelId, setFacebookPixelId] = useState(initialSettings.facebook_pixel_id || '');
  const [facebookPixelEnabled, setFacebookPixelEnabled] = useState(initialSettings.facebook_pixel_enabled === 'true');

  // Promo Ticker Bar Settings
  const [promoBarEnabled, setPromoBarEnabled] = useState(initialSettings.promo_bar_enabled !== 'false');
  const [promoDiscount, setPromoDiscount] = useState(initialSettings.promo_discount || '75%');
  const [promoCustomerLimit, setPromoCustomerLimit] = useState(initialSettings.promo_customer_limit || '100 عميل');
  const [promoToolCount, setPromoToolCount] = useState(initialSettings.promo_tool_count || '12 أداة تسويقية');
  const [promoPrice, setPromoPrice] = useState(initialSettings.promo_price || '500 جنيه فقط');
  const [promoCtaText, setPromoCtaText] = useState(initialSettings.promo_cta_text || 'احجز الآن مع التفعيل الفوري');
  const [promoCtaLink, setPromoCtaLink] = useState(initialSettings.promo_cta_link || '/checkout?package=bundle-vip');
  const [promoCustomText, setPromoCustomText] = useState(initialSettings.promo_custom_text || '');

  const [loading, setLoading] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [telegramTestResult, setTelegramTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleTestTelegram = async () => {
    setTestingTelegram(true);
    setTelegramTestResult(null);
    const res = await testTelegramConnectionAction(telegramBotToken, telegramChatId);
    setTestingTelegram(false);
    setTelegramTestResult(res);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await updateSiteSettingsAction({
      maintenance_mode: String(maintenanceMode),
      maintenance_message: maintenanceMessage,
      vodafone_number: vodafoneNumber,
      instapay_id: instapayId,
      whatsapp_number: whatsappNumber,
      whatsapp_display_number: whatsappDisplayNumber,
      telegram_username: telegramUsername,
      support_phone: supportPhone,
      support_email: supportEmail,
      working_hours: workingHours,
      hero_notice: heroNotice,
      hero_heading: heroHeading,
      hero_title: heroTitle,
      telegram_bot_token: telegramBotToken,
      telegram_chat_id: telegramChatId,
      telegram_alerts_enabled: String(telegramAlertsEnabled),
      facebook_pixel_id: facebookPixelId,
      facebook_pixel_enabled: String(facebookPixelEnabled),
      promo_bar_enabled: String(promoBarEnabled),
      promo_discount: promoDiscount,
      promo_customer_limit: promoCustomerLimit,
      promo_tool_count: promoToolCount,
      promo_price: promoPrice,
      promo_cta_text: promoCtaText,
      promo_cta_link: promoCtaLink,
      promo_custom_text: promoCustomText,
    });

    setLoading(false);

    if (res.success) {
      setMessage({ type: 'success', text: 'تم حفظ الإعدادات بنجاح وتحديث المتجر بالكامل!' });
      router.refresh();
    } else {
      setMessage({ type: 'error', text: res.error || 'حدث خطأ أثناء الحفظ' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-[#0F172A] border border-white/10 space-y-8">
      {message && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Maintenance Mode Control Card */}
      <div className={`p-6 rounded-2xl border transition-colors space-y-4 ${
        maintenanceMode
          ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
          : 'bg-white/5 border-white/10 text-gray-200'
      }`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${maintenanceMode ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-gray-300'}`}>
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <span>وضع الصيانة (Maintenance Mode)</span>
                {maintenanceMode && (
                  <span className="text-[10px] bg-amber-500 text-black px-2 py-0.5 rounded-full font-black animate-pulse flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-black" />
                    <span>مُفعل حالياً</span>
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                عند تفعيل هذا الخيار، سيتم قفل صفحات الموقع أمام تمام الزوار وعرض رسالة الصيانة، بينما يمكنك كـ Admin الدخول والتصفح بشكل طبيعي.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 dir-ltr"></div>
          </label>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>الرسالة المخصصة الظاهرة للزوار أثناء وضع الصيانة:</span>
          </label>
          <textarea
            rows={3}
            value={maintenanceMessage}
            onChange={(e) => setMaintenanceMessage(e.target.value)}
            placeholder="مثال: الموقع حالياً خاضع للصيانة والتحديثات الدورية..."
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-amber-500 leading-relaxed"
          />
        </div>
      </div>

      {/* Telegram Bot Auto-Alerts Configuration */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
        <div className="flex items-center justify-between gap-4 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2ECC8F]/20 text-[#2ECC8F] flex items-center justify-center font-bold">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">إشعارات بوت تليجرام للطلبات الجديدة (Telegram Bot Alerts)</h3>
              <p className="text-xs text-gray-400">إرسال تفاصيل كل طلب اشتراك أو تحويل جديد فوراً إلى قناتك أو محادثتك الخاصة</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTestTelegram}
            disabled={testingTelegram}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Send className={`w-3.5 h-3.5 ${testingTelegram ? 'animate-bounce text-[#2ECC8F]' : ''}`} />
            <span>{testingTelegram ? 'جاري الفحص...' : 'تجربة إرسال رسالة للبوت'}</span>
          </button>
        </div>

        {telegramTestResult && (
          <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
            telegramTestResult.success
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'bg-red-500/10 text-red-400 border border-red-500/30'
          }`}>
            {telegramTestResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{telegramTestResult.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-[#2ECC8F]" />
              <span>رمز توكن البوت (Telegram Bot Token)</span>
            </label>
            <input
              type="password"
              value={telegramBotToken}
              onChange={(e) => setTelegramBotToken(e.target.value)}
              placeholder="123456789:ABCdefGHIjklMNOpqrs..."
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-[#2ECC8F] dir-ltr text-right"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-[#2ECC8F]" />
              <span>معرف المحادثة أو القناة (Telegram Chat ID)</span>
            </label>
            <input
              type="text"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value)}
              placeholder="مثال: 987654321 أو -100123456789"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-[#2ECC8F] dir-ltr text-right"
            />
          </div>
        </div>
      </div>

      {/* Direct Contact & Support */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-[#2ECC8F] border-b border-white/10 pb-2">بيانات التواصل المباشر والدعم الفني</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#2ECC8F]" />
              <span>رقم الواتساب الرسمي (الصيغة الدولية)</span>
            </label>
            <input
              type="text"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="966507988705"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-[#2ECC8F] dir-ltr text-right"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#2ECC8F]" />
              <span>رقم الواتساب الظاهر للمستخدم</span>
            </label>
            <input
              type="text"
              value={whatsappDisplayNumber}
              onChange={(e) => setWhatsappDisplayNumber(e.target.value)}
              placeholder="+966507988705"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-[#2ECC8F] dir-ltr text-right"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-[#2ECC8F]" />
              <span>اسم حساب التليجرام</span>
            </label>
            <input
              type="text"
              value={telegramUsername}
              onChange={(e) => setTelegramUsername(e.target.value)}
              placeholder="growix_official"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-[#2ECC8F] dir-ltr text-right"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#2ECC8F]" />
              <span>إيميل الدعم الفني</span>
            </label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              placeholder="growix@belalkaram.dev"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-[#2ECC8F] dir-ltr text-right"
            />
          </div>
        </div>
      </div>

      {/* Facebook Meta Pixel Tracking Settings */}
      <div className="space-y-4 pt-2 border-t border-white/10">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-[#2ECC8F] flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#2ECC8F]" />
            <span>ربط وتتبع إعلانات فيسبوك (Facebook Meta Pixel)</span>
          </h3>
          
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={facebookPixelEnabled}
              onChange={(e) => setFacebookPixelEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2ECC8F]"></div>
            <span className="mr-2 text-xs font-bold text-gray-300">{facebookPixelEnabled ? 'مُفعّل' : 'معطّل'}</span>
          </label>
        </div>

        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#2ECC8F]" />
                <span>معرف البيكسل (Meta Pixel ID / Dataset ID)</span>
              </span>
              <span className="text-[10px] text-gray-400 font-normal">من Meta Events Manager</span>
            </label>
            <input
              type="text"
              value={facebookPixelId}
              onChange={(e) => setFacebookPixelId(e.target.value)}
              placeholder="مثال: 123456789012345"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-mono font-bold text-white focus:outline-none focus:border-[#2ECC8F] dir-ltr text-right placeholder:text-gray-500"
            />
          </div>

          <div className="text-[11px] text-gray-400 bg-white/5 p-3 rounded-xl border border-white/5 space-y-1">
            <p className="font-bold text-gray-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#2ECC8F]" />
              <span>الأحداث التي يتم تتبعها تلقائياً عند وضع الـ Pixel ID:</span>
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-[10px] text-gray-400">
              <li><b>PageView:</b> يتم تتبع كل زيارة لكافة صفحات المتجر.</li>
              <li><b>ViewContent:</b> تتبع مشاهدة تفاصيل باقة معينة أو أداة تسويقية.</li>
              <li><b>InitiateCheckout:</b> تتبع وصول العميل لصفحة الدفع مع قيمة الباقة.</li>
              <li><b>Purchase:</b> تتبع إتمام الطلب بنجاح وإرسال المبلغ بالجنيه المصري (EGP).</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Promo Announcement Ticker Bar Settings */}
      <div className="space-y-4 pt-2 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <span>الشريط العلوي المتحرك للعروض (Promo Ticker Bar)</span>
                {promoBarEnabled ? (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                    مُفعل ويظهر أعلى الموقع
                  </span>
                ) : (
                  <span className="text-[10px] bg-gray-500/20 text-gray-400 border border-gray-500/30 px-2 py-0.5 rounded-full font-bold">
                    مخفي
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-400">التحكم في الشريط الإعلاني المتحرك الذي يظهر في أعلى كافة صفحات الموقع</p>
            </div>
          </div>
          
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={promoBarEnabled}
              onChange={(e) => setPromoBarEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2ECC8F]"></div>
            <span className="mr-2 text-xs font-bold text-gray-300">{promoBarEnabled ? 'مُفعّل' : 'معطّل'}</span>
          </label>
        </div>

        {/* Live Preview of Promo Bar */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>معاينة حية لشكل الشريط أعلى الموقع:</span>
          </label>
          <div className={`p-3 rounded-2xl bg-[#060B15] border border-[#0F9D58]/40 overflow-hidden text-xs text-white dir-ltr ${
            !promoBarEnabled ? 'opacity-40 grayscale' : ''
          }`}>
            <div className="flex items-center gap-3 whitespace-nowrap overflow-x-auto py-1 dir-rtl scrollbar-none font-bold">
              {promoCustomText.trim() ? (
                <div className="inline-flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{promoCustomText}</span>
                </div>
              ) : (
                <>
                  <div className="inline-flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>خصم</span>
                    <span className="bg-amber-400 text-[#0B1220] px-2 py-0.5 rounded-md font-black">
                      {promoDiscount}
                    </span>
                    <span>لأول</span>
                    <span className="text-[#2ECC8F] font-black underline underline-offset-2">
                      {promoCustomerLimit}
                    </span>
                    <span>فقط — الحق بسرعة!</span>
                  </div>

                  <span className="text-emerald-500/40">|</span>

                  <div className="inline-flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#2ECC8F] shrink-0" />
                    <span>احصل على</span>
                    <span className="bg-[#0F9D58] text-white px-2 py-0.5 rounded-md font-black border border-[#2ECC8F]/30">
                      {promoToolCount}
                    </span>
                    <span>بسعر</span>
                    <span className="text-amber-300 font-black underline underline-offset-2">
                      {promoPrice}
                    </span>
                  </div>
                </>
              )}

              <span className="text-emerald-500/40">|</span>

              <span className="inline-flex items-center gap-1 text-[#2ECC8F] font-black underline">
                <span>{promoCtaText}</span>
                <ArrowLeft className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        {/* Promo Bar Settings Inputs */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#2ECC8F]" />
                <span>نسبة الخصم</span>
              </label>
              <input
                type="text"
                value={promoDiscount}
                onChange={(e) => setPromoDiscount(e.target.value)}
                placeholder="مثال: 75%"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-[#2ECC8F]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#2ECC8F]" />
                <span>الحد الأقصى للعملاء</span>
              </label>
              <input
                type="text"
                value={promoCustomerLimit}
                onChange={(e) => setPromoCustomerLimit(e.target.value)}
                placeholder="مثال: 100 عميل"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-[#2ECC8F]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#2ECC8F]" />
                <span>عدد الأدوات / المحتوى</span>
              </label>
              <input
                type="text"
                value={promoToolCount}
                onChange={(e) => setPromoToolCount(e.target.value)}
                placeholder="مثال: 12 أداة تسويقية"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-[#2ECC8F]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>السعر المعروض</span>
              </label>
              <input
                type="text"
                value={promoPrice}
                onChange={(e) => setPromoPrice(e.target.value)}
                placeholder="مثال: 500 جنيه فقط"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-[#2ECC8F] focus:outline-none focus:border-[#2ECC8F]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#2ECC8F]" />
                <span>نص زر الحجز (CTA)</span>
              </label>
              <input
                type="text"
                value={promoCtaText}
                onChange={(e) => setPromoCtaText(e.target.value)}
                placeholder="مثال: احجز الآن مع التفعيل الفوري"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-[#2ECC8F]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-[#2ECC8F]" />
                <span>رابط الزر (CTA Link)</span>
              </label>
              <input
                type="text"
                value={promoCtaLink}
                onChange={(e) => setPromoCtaLink(e.target.value)}
                placeholder="مثال: /checkout?package=bundle-vip"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono font-bold text-white focus:outline-none focus:border-[#2ECC8F] dir-ltr text-right"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Megaphone className="w-3.5 h-3.5 text-amber-400" />
                <span>نص مخصص كامل للشريط المتحرك (اختياري):</span>
              </span>
              <span className="text-[10px] text-gray-400 font-normal">إذا تمت كتابته سيظهر مباشرة بدلاً من الأجزاء التلقائية</span>
            </label>
            <input
              type="text"
              value={promoCustomText}
              onChange={(e) => setPromoCustomText(e.target.value)}
              placeholder="مثال: 🔥 عرض خاص: كورس التسويق الشامل + 12 أداة مع داتا مصر مجاناً لفترة محدودة!"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-[#2ECC8F]"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <h3 className="text-sm font-black text-[#2ECC8F] border-b border-white/10 pb-2">نصوص الهيدر والعنوان الرئيسية</h3>

        <div>
          <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#2ECC8F]" />
            <span>العنوان الرئيسي بالهيرو (Hero Title)</span>
          </label>
          <input
            type="text"
            value={heroTitle}
            onChange={(e) => setHeroTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-[#2ECC8F]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#2ECC8F]" />
            <span>ساعات وتفاصيل الدعم الفني</span>
          </label>
          <input
            type="text"
            value={workingHours}
            onChange={(e) => setWorkingHours(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-[#2ECC8F]"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 rounded-2xl bg-[#00FF87] hover:bg-[#00E676] text-[#0A1128] font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00FF87]/25 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
      >
        <Save className="w-4 h-4" />
        <span>{loading ? 'جاري الحفظ...' : 'حفظ إعدادات الموقع وبوت تليجرام الآن'}</span>
      </button>
    </form>
  );
};
