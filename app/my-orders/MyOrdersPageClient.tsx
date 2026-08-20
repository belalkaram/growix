'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { HeaderNavbar } from '@/components/HeaderNavbar';
import { Footer } from '@/components/Footer';
import { SecureVideoModal } from '@/components/SecureVideoModal';
import {
  PackageCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  Crown,
  Wrench,
  Sparkles,
  FolderDown,
  Database,
  Smartphone,
  Download,
  Video,
  Gift,
  ShieldCheck,
  FolderOpen,
  ExternalLink,
  HardDrive,
  Copy,
  Check,
  Search,
  Filter,
  Monitor,
  HelpCircle,
  MessageSquare,
  AlertTriangle,
  Compass,
  CheckSquare,
  Sparkle
} from 'lucide-react';
import { SITE_CONFIG } from '@/config/site';

interface MyOrdersPageClientProps {
  orders: any[];
  userSession: any;
}

export const MyOrdersPageClient: React.FC<MyOrdersPageClientProps> = ({ orders, userSession }) => {
  const [activeVideo, setActiveVideo] = useState<{ title: string; videoUrl: string; description?: string } | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [watchedVideos, setWatchedVideos] = useState<Set<number>>(new Set());
  const [downloadedFiles, setDownloadedFiles] = useState<Set<string>>(new Set());

  const handleCopyOrderId = (orderId: string) => {
    navigator.clipboard.writeText(orderId);
    setCopiedOrderId(orderId);
    setTimeout(() => setCopiedOrderId(null), 2500);
  };

  const handleVideoClick = (v: any) => {
    setWatchedVideos((prev) => new Set(prev).add(v.id));
    setActiveVideo({ title: v.title, videoUrl: v.videoUrl, description: v.description });
  };

  const handleFileDownload = (fileKey: string) => {
    setDownloadedFiles((prev) => new Set(prev).add(fileKey));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0B1220] flex flex-col font-sans" dir="rtl">
      <HeaderNavbar session={userSession} isSubscriberPage={true} />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-8">

        {/* Page Welcome Header */}
        <div className="bg-gradient-to-l from-[#0B1220] via-[#0F172A] to-[#1E293B] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-white/10">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#0F9D58]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F9D58]/20 border border-[#0F9D58]/40 text-[#2ECC8F] text-xs font-black">
                <ShieldCheck className="w-4 h-4" />
                <span>منطقة المشتركين المعتمدة</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
                <span>أهلاً بك، {userSession?.user?.name}</span>
              </h1>

              <p className="text-xs sm:text-sm text-gray-300 max-w-xl leading-relaxed">
                جميع أدواتك، كورساتك، وفيديوهات الشرح متاحة لك فوراً أدناه بدون أي قيود.
              </p>
            </div>

            {/* Account Status Badge */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white/5 border border-white/10 p-3.5 rounded-2xl backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 block">حالة الحساب</span>
                  <span className="text-xs font-black text-emerald-400">مُفعّل بالكامل</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── IMPORTANT SOFTWARE USAGE INSTRUCTIONS & RULES BANNER ─── */}
        <div className="bg-gradient-to-br from-amber-50 via-white to-emerald-50 border-2 border-amber-300/80 rounded-3xl p-6 sm:p-8 shadow-lg space-y-6 relative overflow-hidden text-[#0B1220]">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-200/80">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25 shrink-0">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 border border-amber-400/40 text-[11px] font-black mb-1">
                  <span>هام جداً قبل الاستخدام</span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-gray-900">
                  إرشادات وقوانين تشغيل واستخدام برامج GROWIX
                </h2>
              </div>
            </div>

            <span className="text-xs font-black text-amber-900 bg-amber-200/70 border border-amber-400/60 px-3.5 py-1.5 rounded-xl self-start sm:self-auto shadow-2xs">
              ⚠️ يرجى القراءة بعناية لتفادي حظر الحساب
            </span>
          </div>

          {/* The 5 Key Instructions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Rule 1: No sharing (Ban warning) */}
            <div className="p-4 sm:p-5 bg-red-50/70 border border-red-200 rounded-2xl space-y-2 shadow-2xs relative">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-red-600 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-sm">
                  1
                </span>
                <h4 className="text-xs sm:text-sm font-black text-red-900">
                  ممنوع مشاركة البرامج أو الروابط
                </h4>
              </div>
              <p className="text-xs text-red-800 leading-relaxed font-medium">
                يُمنع منعاً باتاً مشاركة الروابط أو الملفات مع أي شخص آخر. السيرفر يرصد الأجهزة تلقائياً، وأي مشاركة تعرض حسابك **للحظر النهائي الفوري بدون استرجاع**.
              </p>
            </div>

            {/* Rule 2: Download & Extract completely */}
            <div className="p-4 sm:p-5 bg-white border border-gray-200 rounded-2xl space-y-2 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-[#0F9D58] text-white flex items-center justify-center text-xs font-black shrink-0 shadow-sm">
                  2
                </span>
                <h4 className="text-xs sm:text-sm font-black text-gray-900">
                  تحميل البرامج وفك الضغط كاملاً
                </h4>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                قم بتحميل ملف الأداة بالكامل على جهاز الكمبيوتر، ثم استخدم برنامج (WinRAR أو 7-Zip) لفك الضغط عن المجلد بالكامل قبل محاولة فتح أو تشغيل أي ملف.
              </p>
            </div>

            {/* Rule 3: Disable Antivirus (Cracked software explanation) */}
            <div className="p-4 sm:p-5 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-amber-600 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-sm">
                  3
                </span>
                <h4 className="text-xs sm:text-sm font-black text-amber-950">
                  إيقاف الأنتي فيروس (Antivirus) مؤقتاً
                </h4>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed font-medium">
                البرامج مفعلة ومكركة مسبقاً، لذا يتعرف عليها الأنتي فيروس كإنذار خاطئ (False Positive). يجب إيقاف الحماية مؤقتاً أثناء فك الضغط والتثبيت، والبرامج آمنة ومجربة 100%.
              </p>
            </div>

            {/* Rule 4: Watch tutorial video first */}
            <div className="p-4 sm:p-5 bg-cyan-50/70 border border-cyan-200 rounded-2xl space-y-2 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-cyan-600 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-sm">
                  4
                </span>
                <h4 className="text-xs sm:text-sm font-black text-cyan-950">
                  مشاهدة فيديو الشرح أولاً
                </h4>
              </div>
              <p className="text-xs text-cyan-900 leading-relaxed font-medium">
                شاهد فيديو الشرح الخاص بالأداة (المتاح بالأسفل) قبل البدء في استخدامها، لتتعلم خطوات التشغيل والإعداد الصحيحة وتحصل على أفضل نتائج وتفادي أي أخطاء.
              </p>
            </div>

            {/* Rule 5: Run as administrator & install */}
            <div className="p-4 sm:p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2 shadow-2xs md:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-[#0F9D58] text-white flex items-center justify-center text-xs font-black shrink-0 shadow-sm">
                  5
                </span>
                <h4 className="text-xs sm:text-sm font-black text-emerald-950">
                  التشغيل والتثبيت كمسؤول (Run as Administrator)
                </h4>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                بعد فك الضغط، اضغط بزر الفأرة الأيمن على ملف البرنامج واختر «تشغيل كمسؤول»، وسيعمل البرنامج معك بكل كفاءة وسلاسة ومدى الحياة بدون قيود.
              </p>
            </div>

          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-amber-200/50">
            <span className="flex items-center gap-1.5 font-bold text-gray-700">
              <ShieldCheck className="w-4 h-4 text-[#0F9D58]" />
              <span>فريق الدعم الفني متواجد لمساعدتك عبر الواتساب على مدار الساعة</span>
            </span>
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsappNumber}?text=مرحباً، أحتاج مساعدة في تثبيت وتشغيل البرامج`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-black text-[#0F9D58] hover:underline flex items-center gap-1"
            >
              <span>مراسلة الدعم الفني</span>
              <MessageSquare className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>

        {orders.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
              <PackageCheck className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">ليس لديك أي طلبات اشتراك بعد</h2>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              تواصل مع الدعم الفني لطلب تفعيل حسابك مباشرة.
            </p>
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsappNumber}?text=مرحباً، أريد تفعيل اشتراكي`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0F9D58] text-white font-extrabold text-xs shadow-md shadow-[#0F9D58]/20"
            >
              <MessageSquare className="w-4 h-4" />
              <span>تواصل مع الدعم عبر الواتساب</span>
            </a>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((ord) => {
              const isPending = ord.status === 'pending';
              const isApproved = ord.status === 'approved';
              const isRejected = ord.status === 'rejected';

              const toolFiles = (ord.files || []).filter(
                (f: any) => f.category !== 'data' && f.category !== 'bonus'
              );
              const giftFiles = (ord.files || []).filter(
                (f: any) => f.category === 'data' || f.category === 'bonus'
              );

              // Filtering files by search and category
              const filteredTools = toolFiles.filter((f: any) => {
                const matchesSearch = !searchQuery.trim() ||
                  f.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (f.description && f.description.toLowerCase().includes(searchQuery.toLowerCase()));

                if (!matchesSearch) return false;
                if (selectedCategory === 'all') return true;
                if (selectedCategory === 'whatsapp' && (f.fileName.includes('واتساب') || f.fileName.includes('WhatsApp'))) return true;
                if (selectedCategory === 'telegram' && (f.fileName.includes('تليجرام') || f.fileName.includes('Telegram'))) return true;
                if (selectedCategory === 'facebook' && (f.fileName.includes('فيسبوك') || f.fileName.includes('Facebook'))) return true;
                if (selectedCategory === 'design' && (f.fileName.includes('كانفا') || f.fileName.includes('مونتاج') || f.fileName.includes('Canva'))) return true;
                if (selectedCategory === 'apk' && f.fileType === 'apk') return true;
                return selectedCategory === 'other';
              });

              const totalItemsCount = (ord.videos?.length || 0) + toolFiles.length + giftFiles.length;
              const completedCount = watchedVideos.size + downloadedFiles.size;
              const progressPercentage = totalItemsCount > 0 ? Math.min(100, Math.round((completedCount / totalItemsCount) * 100)) : 0;

              return (
                <div
                  key={ord.id}
                  className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-7 transition-all"
                >
                  {/* Order Header Info & One-Click Copy */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-lg border border-gray-200">
                          ID: {ord.id}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyOrderId(ord.id)}
                          className="p-1.5 text-xs text-gray-500 hover:text-[#0F9D58] hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          title="نسخ رقم الطلب"
                        >
                          {copiedOrderId === ord.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-[#0F9D58]" />
                              <span className="text-[10px] text-[#0F9D58] font-bold">تم النسخ!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span className="text-[10px]">نسخ</span>
                            </>
                          )}
                        </button>
                      </div>

                      <h3 className="text-lg font-black text-[#0B1220] flex items-center gap-2 pt-1">
                        {ord.packageId === 'bundle-vip' ? (
                          <>
                            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
                              <Crown className="w-4 h-4" />
                            </div>
                            <span>باقة VIP الشاملة (كورسات + الـ 12 أداة + الداتا)</span>
                          </>
                        ) : ord.packageId === 'bundle-premium' ? (
                          <>
                            <div className="w-8 h-8 rounded-xl bg-[#0F9D58]/10 border border-[#0F9D58]/30 flex items-center justify-center text-[#0F9D58] shrink-0">
                              <Sparkles className="w-4 h-4" />
                            </div>
                            <span>باقة Premium (الـ 12 أداة + الداتا)</span>
                          </>
                        ) : (
                          <>
                            <div className="w-8 h-8 rounded-xl bg-[#0F9D58]/10 border border-[#0F9D58]/30 flex items-center justify-center text-[#0F9D58] shrink-0">
                              <Wrench className="w-4 h-4" />
                            </div>
                            <span>باقة برنامج واحد</span>
                          </>
                        )}
                      </h3>
                    </div>

                    <div>
                      {isPending && (
                        <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-amber-500/10 text-amber-600 border border-amber-500/30 flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>جاري مراجعة التحويل وتفعيل الحساب</span>
                        </span>
                      )}
                      {isApproved && (
                        <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>مفعل ونشط</span>
                        </span>
                      )}
                      {isRejected && (
                        <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-red-500/10 text-red-600 border border-red-500/30 flex items-center gap-1.5">
                          <XCircle className="w-4 h-4" />
                          <span>الطلب مرفوض</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pending Order Notice */}
                  {isPending && (
                    <div className="p-4 sm:p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                          <span className="font-bold text-[#0B1220]">
                            تم تسجيل طلبك بنجاح! جاري مراجعة وتأكيد التحويل ({ord.amount} جنية من {ord.senderNumber}).
                          </span>
                        </div>
                        {ord.receiptUrl && (
                          <a
                            href={ord.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-bold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded-lg border border-purple-200 flex items-center gap-1 w-fit transition-colors"
                          >
                            <span>معاينة الإيصال المرفق 🖼️</span>
                          </a>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 leading-relaxed">
                        بمجرد تأكيد وصول التحويل لحسابنا، سيتم تفعيل حسابك فوراً وإتاحة كافة روابط التحميل والفيديوهات والكورسات في هذه الصفحة تلقائياً.
                      </p>
                    </div>
                  )}

                  {/* Progress Tracker Bar */}
                  {isApproved && (
                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                        <span className="flex items-center gap-1.5">
                          <CheckSquare className="w-4 h-4 text-[#0F9D58]" />
                          <span>مستوى الاستفادة من المحتوى:</span>
                        </span>
                        <span className="text-[#0F9D58]">{completedCount} من {totalItemsCount} عنصر ({progressPercentage}%)</span>
                      </div>

                      <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-l from-[#0F9D58] to-[#2ECC8F] transition-all duration-500 rounded-full"
                          style={{ width: `${Math.max(10, progressPercentage)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {isApproved && (
                    <div className="space-y-8 pt-2">

                      {/* ============================================================ */}
                      {/* SECTION 1: فيديوهات الشرح والتدريب (Videos First) */}
                      {/* ============================================================ */}
                      <div id="my-videos" className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-black text-[#0B1220] flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-[#2ECC8F]/15 border border-[#2ECC8F]/30 flex items-center justify-center text-[#0F9D58]">
                              <Video className="w-4 h-4" />
                            </div>
                            <span>1. فيديوهات الشرح والتدريب المباشر ({ord.videos?.length || 0} فيديو)</span>
                          </h4>
                          {ord.videos && ord.videos.length > 0 && (
                            <span className="text-[10px] font-bold bg-[#2ECC8F]/10 text-[#0F9D58] px-2.5 py-1 rounded-full border border-[#2ECC8F]/20">
                              مشغّل محمي خاص
                            </span>
                          )}
                        </div>

                        {ord.videos && ord.videos.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {ord.videos.map((v: any) => (
                              <div
                                key={v.id}
                                className="bg-[#0B1220] border border-white/10 hover:border-[#2ECC8F]/40 rounded-2xl overflow-hidden shadow-md transition-all flex flex-col justify-between"
                              >
                                {/* Video Thumbnail Card */}
                                <div className="relative aspect-video bg-gradient-to-tr from-slate-900 via-slate-800 to-emerald-950 flex items-center justify-center p-4 group cursor-pointer"
                                  onClick={() => handleVideoClick(v)}
                                >
                                  <div className="w-12 h-12 rounded-full bg-[#0F9D58] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <Play className="w-5 h-5 fill-current text-white translate-x-0.5" />
                                  </div>

                                  <span className="absolute top-2 right-2 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-black/60 text-white backdrop-blur-md border border-white/10 flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-[#2ECC8F]" />
                                    <span>شرح تفصيلي</span>
                                  </span>

                                  {watchedVideos.has(v.id) && (
                                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500 text-white flex items-center gap-1">
                                      <Check className="w-3 h-3" />
                                      <span>تمت المشاهدة</span>
                                    </span>
                                  )}
                                </div>

                                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                                  <div className="space-y-1">
                                    <span className="font-extrabold text-xs text-white block leading-snug">{v.title}</span>
                                    {v.description && (
                                      <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">{v.description}</p>
                                    )}
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleVideoClick(v)}
                                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-l from-[#0F9D58] to-[#2ECC8F] hover:opacity-90 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-[#0F9D58]/20 transition-transform active:scale-95 cursor-pointer"
                                  >
                                    <Play className="w-3.5 h-3.5 fill-current text-white" />
                                    <span>مشاهدة الشرح الآن</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs text-gray-500 font-bold text-center">
                            لا يوجد فيديوهات مضافة حالياً لهذا الاشتراك.
                          </div>
                        )}
                      </div>

                      {/* ============================================================ */}
                      {/* SECTION 2: كورسات التسويق السحابية (Courses Second) */}
                      {/* ============================================================ */}
                      {ord.megaLinks && ord.megaLinks.length > 0 && (
                        <div id="my-courses" className="space-y-4 pt-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-black text-[#0B1220] flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-600">
                                <FolderOpen className="w-4 h-4" />
                              </div>
                              <span>2. كورسات التسويق الشاملة</span>
                            </h4>
                            <span className="text-[10px] font-bold bg-blue-500/10 text-blue-600 px-2.5 py-1 rounded-full border border-blue-500/20">
                              سيرفر محمي
                            </span>
                          </div>

                          <div className="grid grid-cols-1 gap-3">
                            {ord.megaLinks.map((ml: any) => (
                              <div
                                key={ml.id}
                                className="p-5 bg-gradient-to-l from-blue-50/80 via-indigo-50/40 to-white border border-blue-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-blue-300/80 transition-colors"
                              >
                                <div className="flex items-start sm:items-center gap-3.5">
                                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/30 font-black">
                                    <FolderOpen className="w-6 h-6" />
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-black text-sm text-gray-900">{ml.title}</span>
                                      {ml.sizeLabel && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white shadow-xs flex items-center gap-1">
                                          <HardDrive className="w-2.5 h-2.5" />
                                          {ml.sizeLabel}
                                        </span>
                                      )}
                                    </div>
                                    {ml.description && (
                                      <p className="text-xs text-gray-600 font-medium">{ml.description}</p>
                                    )}
                                    {ml.contentCount && (
                                      <span className="text-[11px] font-bold text-blue-700 block flex items-center gap-1">
                                        <Video className="w-3 h-3" />
                                        {ml.contentCount}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <a
                                  href={ml.megaUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all active:scale-95 shrink-0"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  <span>فتح السيرفر السحابي</span>
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* ============================================================ */}
                      {/* SECTION 3: البرامج والأدوات المتاحة (Tools Third with Search & Filters) */}
                      {/* ============================================================ */}
                      <div id="my-tools" className="space-y-4 pt-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <h4 className="text-sm font-black text-[#0B1220] flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-[#0F9D58]/15 border border-[#0F9D58]/30 flex items-center justify-center text-[#0F9D58]">
                              <Wrench className="w-4 h-4" />
                            </div>
                            <span>3. البرامج والأدوات التسويقية المتاحة ({toolFiles.length} برنامج)</span>
                          </h4>

                          {/* Smart Search Bar */}
                          <div className="relative w-full sm:w-64">
                            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="ابحث باسم البرنامج..."
                              className="w-full pl-3 pr-9 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium focus:outline-none focus:border-[#0F9D58] transition-colors"
                            />
                          </div>
                        </div>

                        {/* Category Filter Tabs */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
                          {[
                            { id: 'all', label: 'الكل' },
                            { id: 'whatsapp', label: 'واتساب' },
                            { id: 'telegram', label: 'تليجرام' },
                            { id: 'facebook', label: 'فيسبوك' },
                            { id: 'design', label: 'تصميم ومونتاج' },
                            { id: 'apk', label: 'تطبيقات أندرويد' },
                          ].map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setSelectedCategory(cat.id)}
                              className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${selectedCategory === cat.id
                                  ? 'bg-[#0B1220] text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>

                        {filteredTools.length > 0 ? (
                          <div className="grid grid-cols-1 gap-3">
                            {filteredTools.map((f: any) => (
                              <div
                                key={f.id || f.fileKey}
                                className="p-4 bg-gray-50/90 border border-gray-200/80 hover:border-[#0F9D58]/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors shadow-2xs"
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 font-extrabold text-[11px] ${f.fileType === 'apk'
                                      ? 'bg-blue-500/10 border-blue-500/20 text-blue-600'
                                      : 'bg-[#0F9D58]/10 border-[#0F9D58]/20 text-[#0F9D58]'
                                    }`}>
                                    {f.fileType === 'apk' ? 'APK' : 'ZIP'}
                                  </div>

                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-extrabold text-xs text-[#0B1220] block">{f.fileName}</span>

                                      {/* Compatibility Badges */}
                                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-200 text-gray-700 flex items-center gap-1">
                                        {f.fileType === 'apk' ? (
                                          <>
                                            <Smartphone className="w-3 h-3 text-blue-600" />
                                            <span>Android APK</span>
                                          </>
                                        ) : (
                                          <>
                                            <Monitor className="w-3 h-3 text-gray-600" />
                                            <span>Windows 10/11</span>
                                          </>
                                        )}
                                      </span>

                                      {downloadedFiles.has(f.fileKey) && (
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                          <Check className="w-3 h-3" />
                                          <span>تم التحميل</span>
                                        </span>
                                      )}
                                    </div>

                                    {f.fileSize && (
                                      <span className="text-[10px] text-gray-500 block">
                                        الحجم: {f.fileSize}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <a
                                  href={`/api/download?orderId=${ord.id}&fileKey=${encodeURIComponent(f.fileKey)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => handleFileDownload(f.fileKey)}
                                  className="py-2.5 px-4 rounded-xl bg-[#0F9D58] hover:bg-[#0D8B4E] text-white text-xs font-black flex items-center justify-center gap-2 shadow-sm shadow-[#0F9D58]/20 transition-transform active:scale-95 shrink-0 cursor-pointer"
                                >
                                  <Download className="w-4 h-4" />
                                  <span>تحميل البرامج ({f.fileType === 'apk' ? 'APK' : 'ZIP'})</span>
                                </a>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl text-xs text-gray-500 font-bold text-center">
                            لا توجد نتائج مطابقة للبحث حالياً.
                          </div>
                        )}
                      </div>

                      {/* ============================================================ */}
                      {/* SECTION 4: الهدية الإضافية: داتا مصر التسويقية (Bonus Fourth) */}
                      {/* ============================================================ */}
                      <div id="my-bonus" className="space-y-4 pt-2">
                        <h4 className="text-sm font-black text-[#0B1220] flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600">
                            <Gift className="w-4 h-4" />
                          </div>
                          <span>4. الهدية الحصرية المرفقة (داتا مصر التسويقية)</span>
                        </h4>

                        {giftFiles.length > 0 ? (
                          <div className="grid grid-cols-1 gap-3">
                            {giftFiles.map((f: any) => (
                              <div
                                key={f.id || f.fileKey}
                                className="p-5 bg-gradient-to-l from-amber-50/90 via-amber-50/50 to-white border border-amber-300/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                              >
                                <div className="flex items-start sm:items-center gap-3.5">
                                  <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/30 font-black">
                                    <Database className="w-5 h-5" />
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-black text-sm text-gray-900">{f.fileName}</span>
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white shadow-xs">
                                        هدية VIP
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-600 font-medium">
                                      داتا مصر التسويقية الشاملة مقسمة ومفلترة حسب المحافظات والأنشطة التجارية جاهزة للاستخدام.
                                    </p>
                                    {f.fileSize && (
                                      <span className="text-[10px] font-bold text-amber-700 block">
                                        الحجم الكامل: {f.fileSize}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <a
                                  href={`/api/download?orderId=${ord.id}&fileKey=${encodeURIComponent(f.fileKey)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => handleFileDownload(f.fileKey)}
                                  className="py-3 px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-transform active:scale-95 shrink-0 cursor-pointer"
                                >
                                  <Download className="w-4 h-4" />
                                  <span>تحميل الهدية الآن</span>
                                </a>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 bg-amber-50/50 border border-amber-200/60 rounded-2xl text-xs text-amber-800 font-bold text-center">
                            هدية داتا مصر التسويقية الشاملة مجمّعة مع الباقة الفاخرة VIP.
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {isRejected && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs leading-relaxed">
                      <p className="font-bold">لم نتمكن من المطابقة المالية لبيانات التحويل.</p>
                      {ord.adminNotes && <p className="mt-1">ملاحظة الأدمن: {ord.adminNotes}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Direct Subscriber Support Hub at Bottom (No Sales CTAs!) */}
        <div id="my-support" className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0F9D58]/10 text-[#0F9D58] border border-[#0F9D58]/20 flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900">مركز دعم ومساعدة المشتركين</h3>
                <p className="text-xs text-gray-500">نحن هنا لمساعدتك في أي استفسار أو مشكلة في التثبيت</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsappNumber}?text=مرحباً، أنا مشترك بالفعل وأحتاج مساعدة في التثبيت`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-2xl bg-emerald-50/60 hover:bg-emerald-50 border border-emerald-200 text-emerald-950 transition-colors flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#0F9D58] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#0F9D58]/20">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <span className="font-black text-sm block group-hover:text-[#0F9D58] transition-colors">الدعم الفني المباشر (واتساب)</span>
                <span className="text-xs text-emerald-700 block">تواصل فوري مع مهندسي الدعم والتفعيل</span>
              </div>
            </a>

            <a
              href={`https://wa.me/${SITE_CONFIG.whatsappNumber}?text=إبلاغ عن مشكلة في أداة أو رابط لا يعمل`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-2xl bg-amber-50/60 hover:bg-amber-50 border border-amber-200 text-amber-950 transition-colors flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <span className="font-black text-sm block group-hover:text-amber-700 transition-colors">الإبلاغ عن رابط أو أداة</span>
                <span className="text-xs text-amber-700 block">تحديث فوري لروابط التحميل والسيريال</span>
              </div>
            </a>
          </div>
        </div>

      </main>

      {/* Private Secure Video Modal */}
      {activeVideo && (
        <SecureVideoModal
          isOpen={!!activeVideo}
          onClose={() => setActiveVideo(null)}
          title={activeVideo.title}
          videoUrl={activeVideo.videoUrl}
          description={activeVideo.description}
        />
      )}

      <Footer hideSalesBanner={true} />
    </div>
  );
};
