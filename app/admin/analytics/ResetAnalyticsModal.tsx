'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { resetAnalyticsDataAction, ResetAnalyticsOptions } from '@/lib/actions/analytics';
import { 
  RotateCcw, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  ShieldAlert, 
  Sparkles, 
  Clock, 
  Calendar,
  Layers,
  Radio
} from 'lucide-react';

export const ResetAnalyticsModal: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Options State
  const [clearAdminViews, setClearAdminViews] = useState(true);
  const [clearTestOrders, setClearTestOrders] = useState(true);
  const [clearDryRunWebhooks, setClearDryRunWebhooks] = useState(true);
  const [clearAllViews, setClearAllViews] = useState(false);
  const [useDateFilter, setUseDateFilter] = useState(false);
  const [beforeDate, setBeforeDate] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmed) {
      setMessage({ type: 'error', text: 'يرجى تأكيد رغبتك في مسح البيانات أولاً' });
      return;
    }

    if (!clearAdminViews && !clearTestOrders && !clearDryRunWebhooks && !clearAllViews) {
      setMessage({ type: 'error', text: 'يرجى تحديد خيار واحد على الأقل للمسح' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const payload: ResetAnalyticsOptions = {
      clearAdminViews,
      clearTestOrders,
      clearDryRunWebhooks,
      clearAllViews,
      beforeDate: useDateFilter && beforeDate ? beforeDate : undefined,
    };

    const res = await resetAnalyticsDataAction(payload);
    setLoading(false);

    if (res.success) {
      setMessage({ type: 'success', text: res.message || 'تمت إعادة ضبط البيانات المحددة بنجاح!' });
      setTimeout(() => {
        setIsOpen(false);
        setMessage(null);
        setConfirmed(false);
        router.refresh();
      }, 1500);
    } else {
      setMessage({ type: 'error', text: res.error || 'حدث خطأ أثناء المسح' });
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-black transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>إعادة ضبط وتصفير البيانات</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" dir="rtl">
          <div className="w-full max-w-xl bg-[#0F172A] border border-white/15 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative text-white max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">إعادة ضبط وتصفير بيانات التحليلات</h3>
                  <p className="text-xs text-gray-400">حدد بدقة نوع البيانات والسجلات التي ترغب في مسحها أو تصفيرها</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {message && (
              <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
                message.type === 'success' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-red-500/10 text-red-400 border border-red-500/30'
              }`}>
                {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                <span>{message.text}</span>
              </div>
            )}

            <form onSubmit={handleReset} className="space-y-4">
              
              {/* Checkbox Options */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-gray-300 block">اختر البيانات المراد مسحها:</span>

                {/* Option 1: Clear Admin & Test Views */}
                <label className={`p-4 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                  clearAdminViews ? 'bg-[#2ECC8F]/10 border-[#2ECC8F]/40' : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}>
                  <input
                    type="checkbox"
                    checked={clearAdminViews}
                    onChange={(e) => setClearAdminViews(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-[#2ECC8F] focus:ring-0 bg-white/10 border-white/20"
                  />
                  <div>
                    <span className="font-black text-xs text-white block flex items-center gap-1.5">
                      <span>🚫 مسح زيارات وتجارب المطور والأدمن (موصى به)</span>
                    </span>
                    <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                      يمسح كافة سجلات التصفح التي تمت من حسابك أو أجهزتك الخاصة أثناء تطوير واختبار الموقع.
                    </p>
                  </div>
                </label>

                {/* Option 2: Clear Test Orders */}
                <label className={`p-4 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                  clearTestOrders ? 'bg-purple-500/10 border-purple-500/40' : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}>
                  <input
                    type="checkbox"
                    checked={clearTestOrders}
                    onChange={(e) => setClearTestOrders(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-purple-500 focus:ring-0 bg-white/10 border-white/20"
                  />
                  <div>
                    <span className="font-black text-xs text-white block">🧪 مسح الطلبات والاشتراكات التجريبية (Test Orders)</span>
                    <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                      يحذف كافة طلبات الاختبار الموسومة كـ Test بحيث تظل قائمة الطلبات تحتوي على العملاء الحقيقيين فقط.
                    </p>
                  </div>
                </label>

                {/* Option 3: Clear Dry-Run Webhooks */}
                <label className={`p-4 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                  clearDryRunWebhooks ? 'bg-blue-500/10 border-blue-500/40' : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}>
                  <input
                    type="checkbox"
                    checked={clearDryRunWebhooks}
                    onChange={(e) => setClearDryRunWebhooks(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-blue-500 focus:ring-0 bg-white/10 border-white/20"
                  />
                  <div>
                    <span className="font-black text-xs text-white block">📡 مسح رسائل الـ Webhook التجريبية (Dry-Run SMS)</span>
                    <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                      ينظف سجل المعاملات ورسائل التحويل التجريبية في صفحة الـ Webhook Transactions.
                    </p>
                  </div>
                </label>

                {/* Option 4: Clear All Views (Caution) */}
                <label className={`p-4 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                  clearAllViews ? 'bg-red-500/15 border-red-500/50' : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}>
                  <input
                    type="checkbox"
                    checked={clearAllViews}
                    onChange={(e) => setClearAllViews(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-red-500 focus:ring-0 bg-white/10 border-white/20"
                  />
                  <div>
                    <span className="font-black text-xs text-red-400 block">💥 تصفير شامل لكافة المشاهدات والزيارات (Full Reset)</span>
                    <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                      يحذف كافة زيارات الموقع لتبدأ الإحصائيات من الصفر تماماً (لا يحذف حسابات المستخدمين الحقيقيين).
                    </p>
                  </div>
                </label>
              </div>

              {/* Optional Date Boundary */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-300">
                  <input
                    type="checkbox"
                    checked={useDateFilter}
                    onChange={(e) => setUseDateFilter(e.target.checked)}
                    className="w-4 h-4 rounded text-[#2ECC8F] focus:ring-0 bg-white/10 border-white/20"
                  />
                  <span>مسح البيانات السابقة لما قبل تاريخ محدد فقط (اختياري)</span>
                </label>

                {useDateFilter && (
                  <div>
                    <input
                      type="date"
                      value={beforeDate}
                      onChange={(e) => setBeforeDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-xs font-mono font-bold text-white focus:outline-none focus:border-[#2ECC8F]"
                    />
                    <span className="text-[10px] text-gray-400 block mt-1">
                      سيتم مسح البيانات المسجلة قبل هذا التاريخ، والاحتفاظ بما بعده.
                    </span>
                  </div>
                )}
              </div>

              {/* Mandatory Confirmation Checkbox */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs font-black text-amber-300">
                  <input
                    type="checkbox"
                    required
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-amber-500 focus:ring-0 bg-white/10 border-amber-500/40"
                  />
                  <span>أؤكد رغبتي في مسح وتصفير البيانات المحددة أعلاه نهائياً.</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading || !confirmed}
                  className="flex-1 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{loading ? 'جاري المسح وإعادة الضبط...' : 'تنفيذ المسح وإعادة الضبط الآن'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
};
