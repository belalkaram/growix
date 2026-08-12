'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HeaderNavbar } from '@/components/HeaderNavbar';
import { Footer } from '@/components/Footer';
import { SecureVideoModal } from '@/components/SecureVideoModal';
import { 
  PackageCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Play, 
  Crown, 
  Wrench, 
  Sparkles, 
  FolderDown, 
  Database, 
  GraduationCap, 
  Smartphone, 
  Download, 
  Video,
  Gift,
  ShieldCheck,
  Sparkle
} from 'lucide-react';

interface MyOrdersPageClientProps {
  orders: any[];
  userSession: any;
}

export const MyOrdersPageClient: React.FC<MyOrdersPageClientProps> = ({ orders, userSession }) => {
  const router = useRouter();
  const [activeVideo, setActiveVideo] = useState<{ title: string; videoUrl: string; description?: string } | null>(null);

  const handleNavigateToCheckout = () => {
    router.push('/#pricing');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0B1220] flex flex-col font-sans" dir="rtl">
      <HeaderNavbar onOpenPaymentModal={handleNavigateToCheckout} session={userSession} />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-20 space-y-8">
        {/* Page Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-200/80 p-6 rounded-3xl shadow-sm">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B1220] flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#0F9D58]/10 border border-[#0F9D58]/20 flex items-center justify-center text-[#0F9D58]">
                <PackageCheck className="w-6 h-6" />
              </div>
              <span>طلباتي واشتراكاتي</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              مرحباً <strong className="text-[#0F9D58] font-extrabold">{userSession?.user?.name}</strong>، متابعة حالة اشتراكك وتحميل أدواتك وفيديوهات الشرح.
            </p>
          </div>

          <Link
            href="/"
            className="text-xs font-extrabold text-gray-600 hover:text-[#0F9D58] flex items-center gap-1.5 self-start sm:self-center px-4 py-2 rounded-xl bg-gray-50 hover:bg-emerald-50 transition-colors border border-gray-200/60"
          >
            <span>العودة للموقع</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
              <PackageCheck className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">ليس لديك أي طلبات اشتراك بعد</h2>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              تصفح الباقات المتاحة واشترك للحصول على الكورس الشامل وأدوات التسويق.
            </p>
            <Link
              href="/#pricing"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-growix-gradient text-white font-extrabold text-xs shadow-md shadow-[#0F9D58]/20 hover:opacity-95 transition-opacity"
            >
              استعرض الباقات والأسعار
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((ord) => {
              const isPending = ord.status === 'pending';
              const isApproved = ord.status === 'approved';
              const isRejected = ord.status === 'rejected';

              // Separate regular tools from bonus gift files
              const toolFiles = (ord.files || []).filter(
                (f: any) => f.category !== 'data' && f.category !== 'bonus'
              );
              const giftFiles = (ord.files || []).filter(
                (f: any) => f.category === 'data' || f.category === 'bonus'
              );

              return (
                <div
                  key={ord.id}
                  className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6 hover:border-[#0F9D58]/30 transition-all"
                >
                  {/* Order Header Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                    <div>
                      <span className="text-[11px] font-mono text-gray-400 block mb-1">رقم الطلب: {ord.id}</span>
                      <h3 className="text-lg font-black text-[#0B1220] flex items-center gap-2">
                        {ord.packageId === 'bundle-vip' ? (
                          <>
                            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
                              <Crown className="w-4 h-4" />
                            </div>
                            <span>الباقة الكاملة VIP (الكورس + الأدوات + الداتا)</span>
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
                          <span>تم التفعيل بنجاح</span>
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

                  {/* Payment Details Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3.5 bg-gray-50/80 border border-gray-100 rounded-2xl">
                      <span className="text-gray-400 block mb-1">طريقة الدفع:</span>
                      <span className="font-extrabold text-gray-800">
                        {ord.paymentMethod === 'instapay' ? 'إنستاباي (InstaPay)' : 'محفظة إلكترونية'}
                      </span>
                    </div>

                    <div className="p-3.5 bg-gray-50/80 border border-gray-100 rounded-2xl">
                      <span className="text-gray-400 block mb-1">الرقم المحوّل منه:</span>
                      <span className="font-extrabold text-gray-800 font-mono dir-ltr inline-block">{ord.senderNumber}</span>
                    </div>

                    <div className="p-3.5 bg-gray-50/80 border border-gray-100 rounded-2xl">
                      <span className="text-gray-400 block mb-1">المبلغ المحوّل:</span>
                      <span className="font-extrabold text-[#0F9D58] text-sm">{ord.amount} جنية</span>
                    </div>
                  </div>

                  {isApproved && (
                    <div className="space-y-6 pt-2">
                      {/* Activation Success Banner */}
                      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 text-xs leading-relaxed space-y-1">
                        <p className="font-black text-[#0F9D58] text-sm flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-[#0F9D58] shrink-0" />
                          <span>تهانينا! حسابك مفعل بالكامل. يمكنك مشاهدة الشروحات وتحميل الأدوات أدناه:</span>
                        </p>
                        <p className="text-gray-600 font-medium">
                          الفيديوهات والأدوات والهدايا مرتبة ومتاحة لك فوراً.
                        </p>
                      </div>

                      {/* ============================================================ */}
                      {/* SECTION 1: 🎥 فيديوهات الشرح والتدريب (Videos First) */}
                      {/* ============================================================ */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-black text-[#0B1220] flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-[#2ECC8F]/15 border border-[#2ECC8F]/30 flex items-center justify-center text-[#0F9D58]">
                              <Video className="w-4 h-4" />
                            </div>
                            <span>1. فيديوهات الشرح والتدريب ({ord.videos?.length || 0} فيديو)</span>
                          </h4>
                          {ord.videos && ord.videos.length > 0 && (
                            <span className="text-[10px] font-bold bg-[#2ECC8F]/10 text-[#0F9D58] px-2.5 py-1 rounded-full border border-[#2ECC8F]/20">
                              مشغّل محمي خاص
                            </span>
                          )}
                        </div>

                        {ord.videos && ord.videos.length > 0 ? (
                          <div className="grid grid-cols-1 gap-3">
                            {ord.videos.map((v: any) => (
                              <div
                                key={v.id}
                                className="p-4 bg-[#0B1220] border border-white/10 hover:border-[#2ECC8F]/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white shadow-md transition-all"
                              >
                                <div className="space-y-1 max-w-lg">
                                  <span className="font-extrabold text-xs text-white block">{v.title}</span>
                                  {v.description && (
                                    <p className="text-[11px] text-gray-400 line-clamp-2">{v.description}</p>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setActiveVideo({ title: v.title, videoUrl: v.videoUrl, description: v.description })}
                                  className="py-2.5 px-5 rounded-xl bg-gradient-to-l from-[#0F9D58] to-[#2ECC8F] hover:opacity-90 text-white text-xs font-black flex items-center justify-center gap-2 shrink-0 shadow-md shadow-[#0F9D58]/20 transition-transform active:scale-95 cursor-pointer"
                                >
                                  <Play className="w-4 h-4 fill-current text-white" />
                                  <span>مشاهدة الشرح المباشر</span>
                                </button>
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
                      {/* SECTION 2: 🛠️ الأدوات والبرامج المتاحة (Tools Second) */}
                      {/* ============================================================ */}
                      <div className="space-y-3 pt-2">
                        <h4 className="text-sm font-black text-[#0B1220] flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#0F9D58]/15 border border-[#0F9D58]/30 flex items-center justify-center text-[#0F9D58]">
                            <Wrench className="w-4 h-4" />
                          </div>
                          <span>2. البرامج والأدوات التسويقية المتاحة ({toolFiles.length} برنامج)</span>
                        </h4>

                        {toolFiles.length > 0 ? (
                          <div className="grid grid-cols-1 gap-2.5">
                            {toolFiles.map((f: any) => (
                              <div
                                key={f.id || f.fileKey}
                                className="p-4 bg-gray-50/90 border border-gray-200/80 hover:border-[#0F9D58]/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors shadow-2xs"
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 font-extrabold text-[10px] ${
                                    f.fileType === 'apk'
                                      ? 'bg-blue-500/10 border-blue-500/20 text-blue-600'
                                      : 'bg-[#0F9D58]/10 border-[#0F9D58]/20 text-[#0F9D58]'
                                  }`}>
                                    {f.fileType === 'apk' ? 'APK' : 'ZIP'}
                                  </div>
                                  <div>
                                    <span className="font-extrabold text-xs text-[#0B1220] block">{f.fileName}</span>
                                    <span className="text-[10px] text-gray-500 block mt-0.5 flex items-center gap-1">
                                      {f.fileType === 'apk' ? (
                                        <>
                                          <Smartphone className="w-3 h-3 text-blue-500 shrink-0" />
                                          <span>تطبيق أندرويد</span>
                                        </>
                                      ) : (
                                        <>
                                          <Wrench className="w-3 h-3 text-[#0F9D58] shrink-0" />
                                          <span>برنامج وأداة تسويق</span>
                                        </>
                                      )}
                                      {f.fileSize ? ` • الحجم: ${f.fileSize}` : ''}
                                    </span>
                                  </div>
                                </div>

                                <a
                                  href={`/api/download?orderId=${ord.id}&fileKey=${encodeURIComponent(f.fileKey)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="py-2.5 px-4 rounded-xl bg-[#0F9D58] hover:bg-[#0D8B4E] text-white text-xs font-black flex items-center justify-center gap-2 shadow-sm shadow-[#0F9D58]/20 transition-transform active:scale-95 shrink-0"
                                >
                                  <Download className="w-4 h-4" />
                                  <span>تحميل ({f.fileType === 'apk' ? 'APK' : 'ZIP'})</span>
                                </a>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs text-gray-500 font-bold text-center">
                            تواصل مع الدعم الفني عبر الواتساب للحصول على الروابط المباشرة.
                          </div>
                        )}
                      </div>

                      {/* ============================================================ */}
                      {/* SECTION 3: 🎁 الهدية الإضافية: داتا مصر التسويقية (Bonus Third) */}
                      {/* ============================================================ */}
                      <div className="space-y-3 pt-2">
                        <h4 className="text-sm font-black text-[#0B1220] flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600">
                            <Gift className="w-4 h-4" />
                          </div>
                          <span>3. الهدية الحصرية المرفقة</span>
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
                                        هدية VIP 🔥
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
                                  className="py-3 px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-transform active:scale-95 shrink-0"
                                >
                                  <Download className="w-4 h-4" />
                                  <span>تحميل الهدية الآن</span>
                                </a>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 bg-amber-50/50 border border-amber-200/60 rounded-2xl text-xs text-amber-800 font-bold text-center">
                            🎁 هدية داتا مصر التسويقية الشاملة مجمّعة مع الباقة الفاخرة VIP.
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

      <Footer />
    </div>
  );
};
