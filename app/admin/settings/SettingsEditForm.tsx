'use client';

import React, { useState } from 'react';
import { updateSiteSettingsAction } from '@/lib/actions/settings';
import { Save, CheckCircle2, AlertCircle, Phone, Send, Mail, Clock, FileText, Wrench, ShieldAlert } from 'lucide-react';

export const SettingsEditForm: React.FC<{ initialSettings: Record<string, string> }> = ({ initialSettings }) => {
  const [maintenanceMode, setMaintenanceMode] = useState(initialSettings.maintenance_mode === 'true');
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    initialSettings.maintenance_message || 'الموقع حالياً قيد الصيانة والتحديثات الدورية لتوفير أفضل تجربة لكم. سنعود للعمل قريباً جداً!'
  );
  const [whatsappNumber, setWhatsappNumber] = useState(initialSettings.whatsapp_number || '201019033661');
  const [whatsappDisplayNumber, setWhatsappDisplayNumber] = useState(initialSettings.whatsapp_display_number || '01019033661');
  const [telegramUsername, setTelegramUsername] = useState(initialSettings.telegram_username || 'growix_official');
  const [supportEmail, setSupportEmail] = useState(initialSettings.support_email || 'support@growix.com');
  const [workingHours, setWorkingHours] = useState(initialSettings.working_hours || 'تفعيل فوري خلال أقل من ساعة | دعم فني على مدار 24/7');
  const [heroTitle, setHeroTitle] = useState(initialSettings.hero_title || '');
  const [heroSubtitle, setHeroSubtitle] = useState(initialSettings.hero_subtitle || '');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await updateSiteSettingsAction({
      maintenance_mode: maintenanceMode ? 'true' : 'false',
      maintenance_message: maintenanceMessage,
      whatsapp_number: whatsappNumber,
      whatsapp_display_number: whatsappDisplayNumber,
      telegram_username: telegramUsername,
      support_email: supportEmail,
      working_hours: workingHours,
      hero_title: heroTitle,
      hero_subtitle: heroSubtitle,
    });

    setLoading(false);

    if (res.success) {
      setMessage({ type: 'success', text: 'تم تحديث إعدادات الموقع وتفعيل خيارات وضع الصيانة فوراً!' });
    } else {
      setMessage({ type: 'error', text: res.error || 'حدث خطأ أثناء الحفظ' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-[#0F172A] border border-white/10 space-y-8">
      {message && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* 🛑 Maintenance Mode Control Card */}
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
                  <span className="text-[10px] bg-amber-500 text-black px-2 py-0.5 rounded-full font-black animate-pulse">
                    مُفعل حالياً 🛑
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

      <div className="space-y-4">
        <h3 className="text-sm font-black text-[#2ECC8F] border-b border-white/10 pb-2">بيانات التواصل المباشر والتحويل</h3>

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
              placeholder="201019033661"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-[#2ECC8F]"
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
              placeholder="01019033661"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-[#2ECC8F]"
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
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-[#2ECC8F]"
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
              placeholder="support@growix.com"
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
        className="w-full py-3.5 rounded-xl bg-gradient-to-l from-[#0F9D58] to-[#2ECC8F] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#0F9D58]/30 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
      >
        <Save className="w-4 h-4" />
        <span>{loading ? 'جاري الحفظ...' : 'حفظ وإرسال التغييرات'}</span>
      </button>
    </form>
  );
};
