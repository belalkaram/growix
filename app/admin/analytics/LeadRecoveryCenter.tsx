'use client';

import React, { useState } from 'react';
import { 
  AbandonedCheckoutLead, 
  RegisteredNonBuyer, 
  PricingFunnelReport 
} from '@/lib/queries/analytics';
import { 
  Users, 
  ShoppingCart, 
  Send, 
  Copy, 
  Check, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  TrendingDown, 
  AlertCircle, 
  Sparkles,
  ExternalLink,
  Target,
  UserX,
  Smartphone,
  Eye,
  Tag,
  DollarSign
} from 'lucide-react';

interface LeadRecoveryCenterProps {
  abandonedCheckouts: AbandonedCheckoutLead[];
  registeredNonBuyers: RegisteredNonBuyer[];
  pricingFunnel: PricingFunnelReport;
}

export const LeadRecoveryCenter: React.FC<LeadRecoveryCenterProps> = ({
  abandonedCheckouts,
  registeredNonBuyers,
  pricingFunnel,
}) => {
  const [activeTab, setActiveTab] = useState<'abandoned' | 'nonbuyers' | 'pricing'>('abandoned');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const formatTimeAgo = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - d.getTime()) / (1000 * 60));
    
    if (diffMin < 1) return 'الآن';
    if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    const diffDays = Math.floor(diffHours / 24);
    return `منذ ${diffDays} يوم`;
  };

  const getCleanPhone = (phone: string) => {
    let clean = phone.replace(/[^0-9+]/g, '');
    if (clean.startsWith('01')) clean = '2' + clean;
    if (clean.startsWith('+')) clean = clean.substring(1);
    return clean;
  };

  return (
    <div className="rounded-3xl bg-[#0F172A] border border-white/10 p-6 sm:p-7 shadow-xl space-y-6 text-white">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Target className="w-6 h-6 text-[#2ECC8F]" />
            <h2 className="text-lg sm:text-xl font-black text-white">
              مركز استعادة العملاء وإعادة الاستهداف (Retargeting & Leads)
            </h2>
            <span className="text-[10px] bg-emerald-500/20 text-[#2ECC8F] px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-bold">
              تحديث فوري
            </span>
          </div>
          <p className="text-xs text-gray-400">
            تتبع واستهداف كل من أظهر اهتماماً بالشراء: أرقام الشيك أوت المتروكة، المسجلون بدون شراء، وزوار صفحة الأسعار
          </p>
        </div>

        {/* Tab Switcher Buttons */}
        <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('abandoned')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'abandoned'
                ? 'bg-[#0F9D58] text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>شيك أوت متروك (أرقام الهواتف)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
              activeTab === 'abandoned' ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-400'
            }`}>
              {abandonedCheckouts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('nonbuyers')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'nonbuyers'
                ? 'bg-[#0F9D58] text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <UserX className="w-3.5 h-3.5" />
            <span>مسجلون بدون شراء</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
              activeTab === 'nonbuyers' ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-400'
            }`}>
              {registeredNonBuyers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'pricing'
                ? 'bg-[#0F9D58] text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>تسرب صفحة الأسعار</span>
          </button>
        </div>
      </div>

      {/* ─── TAB 1: ABANDONED CHECKOUTS WITH PHONES ─── */}
      {activeTab === 'abandoned' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-400 bg-white/5 p-4 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2ECC8F] shrink-0" />
              <span>
                العملاء الذين وصلوا للشيك أوت وكتبوا رقم هاتفهم أو حسابهم ولكن خرجوا قبل إتمام الطلب ({abandonedCheckouts.length} عميل محتمل).
              </span>
            </div>
            <span className="text-[#2ECC8F] font-bold">
              فرصة إعادة استهداف مباشرة بمعدل تحويل مرتفع!
            </span>
          </div>

          {abandonedCheckouts.length === 0 ? (
            <div className="p-12 text-center bg-white/5 rounded-2xl border border-white/10 space-y-3">
              <ShoppingCart className="w-12 h-12 text-gray-600 mx-auto" />
              <h4 className="text-sm font-bold text-gray-300">لا توجد سلات شيك أوت متروكة حالياً</h4>
              <p className="text-xs text-gray-500">سيظهر هنا أي عميل يبدأ بإدخال رقمه في الشيك أوت ويخرج قبل إتمام الطلب.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0B1220]">
              <table className="w-full text-right text-xs border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-white/5 text-gray-300 border-b border-white/10">
                    <th className="p-3.5 font-bold">رقم الهاتف / الحساب</th>
                    <th className="p-3.5 font-bold">الباقة المستهدفة</th>
                    <th className="p-3.5 font-bold">المبلغ المتوقع</th>
                    <th className="p-3.5 font-bold">الكوبون</th>
                    <th className="p-3.5 font-bold">آخر خطوة</th>
                    <th className="p-3.5 font-bold">التوقيت</th>
                    <th className="p-3.5 font-bold text-center">إجراء إعادة الاستهداف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {abandonedCheckouts.map((lead) => {
                    const cleanPhone = getCleanPhone(lead.phone);
                    const waText = encodeURIComponent(
                      `مرحباً، لاحظنا اهتمامك بالاشتراك في ${lead.packageName} على منصة GROWIX، هل واجهتك أي مشكلة في إتمام الدفع أو التحويل؟\nيسعدنا مساعدتك وتفعيل حسابك فوراً، وتوفير كود خصم خاص لك إذا رغبت في إتمام الطلب الآن!`
                    );
                    const waUrl = `https://wa.me/${cleanPhone}?text=${waText}`;

                    return (
                      <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5 font-mono font-black text-white">
                          <div className="flex items-center gap-2">
                            <span className="text-amber-300">{lead.phone}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(lead.phone, `phone-${lead.id}`)}
                              className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
                              title="نسخ الرقم"
                            >
                              {copiedId === `phone-${lead.id}` ? (
                                <Check className="w-3 h-3 text-[#2ECC8F]" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        <td className="p-3.5 font-bold text-gray-200">
                          {lead.packageName}
                        </td>

                        <td className="p-3.5 font-black text-[#2ECC8F]">
                          {lead.amount ? `${lead.amount} ج` : 'غير محدد'}
                        </td>

                        <td className="p-3.5">
                          {lead.couponCode ? (
                            <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                              {lead.couponCode}
                            </span>
                          ) : (
                            <span className="text-gray-500 text-[10px]">بدون كوبون</span>
                          )}
                        </td>

                        <td className="p-3.5 text-gray-400">
                          {lead.lastStep === 4 ? (
                            <span className="text-emerald-400 font-bold">الخطوة 4 (إرفاق إيصال)</span>
                          ) : (
                            <span className="text-amber-400 font-bold">الخطوة 3 (إدخال الرقم)</span>
                          )}
                        </td>

                        <td className="p-3.5 text-gray-400 text-[11px]" title={new Date(lead.updatedAt).toLocaleString('ar-EG')}>
                          {formatTimeAgo(lead.updatedAt)}
                        </td>

                        <td className="p-3.5 text-center">
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0F9D58] hover:bg-[#0D8B4E] text-white font-bold text-xs shadow-md shadow-[#0F9D58]/20 transition-all hover:scale-105"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>مراسلة واتساب</span>
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: REGISTERED USERS WITHOUT PURCHASE ─── */}
      {activeTab === 'nonbuyers' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-400 bg-white/5 p-4 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#2ECC8F] shrink-0" />
              <span>
                المستخدمون الذين سجلوا حساباً في المنصة ولكن لم يكملوا أي عملية شراء بعد ({registeredNonBuyers.length} مستخدم).
              </span>
            </div>
            <span className="text-gray-300 font-medium">
              تواصل معهم لمعرفة احتياجهم أو إرسال كود ترحيبي
            </span>
          </div>

          {registeredNonBuyers.length === 0 ? (
            <div className="p-12 text-center bg-white/5 rounded-2xl border border-white/10 space-y-3">
              <Users className="w-12 h-12 text-gray-600 mx-auto" />
              <h4 className="text-sm font-bold text-gray-300">جميع المستخدمين المسجلين لديهم طلبات معتمدة!</h4>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0B1220]">
              <table className="w-full text-right text-xs border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-white/5 text-gray-300 border-b border-white/10">
                    <th className="p-3.5 font-bold">الاسم</th>
                    <th className="p-3.5 font-bold">البريد الإلكتروني</th>
                    <th className="p-3.5 font-bold">رقم الهاتف</th>
                    <th className="p-3.5 font-bold">تاريخ التسجيل</th>
                    <th className="p-3.5 font-bold">آخر دخول</th>
                    <th className="p-3.5 font-bold text-center">التواصل والمتابعة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {registeredNonBuyers.map((user) => {
                    const hasPhone = user.phone && user.phone.trim().length >= 8;
                    const cleanPhone = hasPhone ? getCleanPhone(user.phone!) : '';
                    const waText = encodeURIComponent(
                      `مرحباً ${user.name}، أهلاً بك في GROWIX! لاحظنا تسجيلك في الموقع، هل ترغب في تجربة أي من الأدوات الـ 12 أو الحصول على استشارة سريعة حول الباقة الأنسب لمشروعك؟`
                    );
                    const waUrl = hasPhone ? `https://wa.me/${cleanPhone}?text=${waText}` : null;

                    return (
                      <tr key={user.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5 font-bold text-white">
                          {user.name}
                        </td>

                        <td className="p-3.5 font-mono text-gray-300">
                          <div className="flex items-center gap-2">
                            <span>{user.email}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(user.email, `email-${user.id}`)}
                              className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
                              title="نسخ البريد"
                            >
                              {copiedId === `email-${user.id}` ? (
                                <Check className="w-3 h-3 text-[#2ECC8F]" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        <td className="p-3.5 font-mono text-gray-300">
                          {user.phone ? (
                            <span className="text-amber-300">{user.phone}</span>
                          ) : (
                            <span className="text-gray-500">غير متوفر</span>
                          )}
                        </td>

                        <td className="p-3.5 text-gray-400 text-[11px]" title={new Date(user.createdAt).toLocaleString('ar-EG')}>
                          {formatTimeAgo(user.createdAt)}
                        </td>

                        <td className="p-3.5 text-gray-400 text-[11px]">
                          {user.lastLoginAt ? formatTimeAgo(user.lastLoginAt) : 'لم يسجل دخول ثانٍ'}
                        </td>

                        <td className="p-3.5 text-center">
                          {waUrl ? (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0F9D58] hover:bg-[#0D8B4E] text-white font-bold text-xs transition-colors"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>واتساب</span>
                            </a>
                          ) : (
                            <a
                              href={`mailto:${user.email}?subject=${encodeURIComponent('مرحباً بك في GROWIX - عروض خاصة لتفعيل حسابك')}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 font-bold text-xs transition-colors"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>إيميل</span>
                            </a>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: PRICING PAGE DROP-OFF METRICS ─── */}
      {activeTab === 'pricing' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400 font-bold">
                <span>زوار صفحة الأسعار</span>
                <Eye className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-2xl font-black text-white block">
                {pricingFunnel.pricingUniqueSessions}
              </span>
              <span className="text-[11px] text-gray-400">إجمالي المشاهدات: {pricingFunnel.pricingViews}</span>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400 font-bold">
                <span>تراجعوا دون شراء</span>
                <TrendingDown className="w-4 h-4 text-rose-400" />
              </div>
              <span className="text-2xl font-black text-rose-400 block">
                {pricingFunnel.pricingDropoffs}
              </span>
              <span className="text-[11px] text-gray-400">رأوا الأسعار وغادروا</span>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400 font-bold">
                <span>نسبة التسرب من الأسعار</span>
                <AlertCircle className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-2xl font-black text-amber-400 block">
                {pricingFunnel.pricingDropoffRate}%
              </span>
              <span className="text-[11px] text-gray-400">من إجمالي زوار صفحة الأسعار</span>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400 font-bold">
                <span>انتقلوا للشيك أوت</span>
                <ShoppingCart className="w-4 h-4 text-[#2ECC8F]" />
              </div>
              <span className="text-2xl font-black text-[#2ECC8F] block">
                {pricingFunnel.pricingToCheckoutSessions}
              </span>
              <span className="text-[11px] text-gray-400">بدأوا خطوة الشراء</span>
            </div>

          </div>

          {/* Pricing Optimization Insights Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-l from-emerald-500/10 via-white/5 to-blue-500/10 border border-white/10 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2ECC8F]" />
              <span>نصائح ذكية لتقليل تسرب صفحة الأسعار:</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-300">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                <span className="font-bold text-[#2ECC8F] block">1. إبراز باقة VIP</span>
                <p className="text-gray-400 leading-relaxed">تم إبراز باقة VIP كأكثر الباقات طلباً لتوجيه قرارات الزوار نحوها فوراً.</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                <span className="font-bold text-[#2ECC8F] block">2. إظهار مبالغ التوفير</span>
                <p className="text-gray-400 leading-relaxed">إظهار شارة &quot;وفرت 1500 ج&quot; يزيد من إدراك القيمة مقارنة بالسعر الأصلي.</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                <span className="font-bold text-[#2ECC8F] block">3. تفعيل الكوبونات الترويجية</span>
                <p className="text-gray-400 leading-relaxed">استخدم كوبونات الخصم المؤقتة على واتساب لإعادة استهداف المتروكين.</p>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
