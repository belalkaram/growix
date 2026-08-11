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
  Video 
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
    <div className="min-h-screen bg-[#F7F9FA] text-[#0B1220] flex flex-col font-sans" dir="rtl">
      <HeaderNavbar onOpenPaymentModal={handleNavigateToCheckout} session={userSession} />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-32 pb-20 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B1220] flex items-center gap-2">
              <PackageCheck className="w-7 h-7 text-[#0F9D58]" />
              <span>طلباتي واشتراكاتي</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              مرحباً <strong className="text-[#0F9D58] font-bold">{userSession?.user?.name}</strong>، هنا يمكنك متابعة حالة طلباتك وتفعيل حسابتك
            </p>
          </div>

          <Link
            href="/"
            className="text-xs font-extrabold text-gray-600 hover:text-[#0F9D58] flex items-center gap-1"
          >
            <span>العودة للموقع</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center space-y-4 shadow-sm">
            <PackageCheck className="w-12 h-12 text-gray-300 mx-auto" />
            <h2 className="text-lg font-bold text-gray-800">ليس لديك أي طلبات اشتراك بعد</h2>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              تصفح الباقات المتاحة واشترك للحصول على الكورس الشامل وأدوات التسويق.
            </p>
            <Link
              href="/#pricing"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-growix-gradient text-white font-extrabold text-xs shadow-md"
            >
              استعرض الباقات والأسعار
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((ord) => {
              const isPending = ord.status === 'pending';
              const isApproved = ord.status === 'approved';
              const isRejected = ord.status === 'rejected';

              return (
                <div
                  key={ord.id}
                  className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4 hover:border-[#0F9D58]/40 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                    <div>
                      <span className="text-[10px] font-mono text-gray-400 block mb-0.5">رقم الطلب: {ord.id}</span>
                      <h3 className="text-base font-black text-[#0B1220] flex items-center gap-2">
                        {ord.packageId === 'bundle-vip' ? (
                          <>
                            <Crown className="w-5 h-5 text-amber-500 shrink-0" />
                            <span>الباقة الكاملة (الكورس + الأدوات + الداتا)</span>
                          </>
                        ) : (
                          <>
                            <Wrench className="w-5 h-5 text-[#0F9D58] shrink-0" />
                            <span>باقة برنامج واحد</span>
                          </>
                        )}
                      </h3>
                    </div>

                    <div>
                      {isPending && (
                        <span className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-amber-500/10 text-amber-600 border border-amber-500/30 flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>جاري مراجعة التحويل وتفعيل الحساب</span>
                        </span>
                      )}
                      {isApproved && (
                        <span className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>تم قبول التحويل وتفعيل الحساب بنجاح!</span>
                        </span>
                      )}
                      {isRejected && (
                        <span className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-red-500/10 text-red-600 border border-red-500/30 flex items-center gap-1.5">
                          <XCircle className="w-4 h-4" />
                          <span>الطلب مرفوض</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-600">
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <span className="text-gray-400 block mb-1">طريقة الدفع المحوّل بها:</span>
                      <span className="font-bold text-gray-800">
                        {ord.paymentMethod === 'instapay' ? 'إنستاباي (InstaPay)' : 'محفظة إلكترونية'}
                      </span>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl">
                      <span className="text-gray-400 block mb-1">الرقم المحوّل منه:</span>
                      <span className="font-bold text-gray-800 font-mono dir-ltr inline-block">{ord.senderNumber}</span>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl">
                      <span className="text-gray-400 block mb-1">المبلغ المطلوب:</span>
                      <span className="font-extrabold text-[#0F9D58]">{ord.amount} جنية</span>
                    </div>
                  </div>

                  {isApproved && (
                    <div className="space-y-4 pt-2">
                      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 text-xs leading-relaxed space-y-1">
                        <p className="font-extrabold text-[#0F9D58] text-sm flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-[#0F9D58] shrink-0" />
                          <span>تهانينا! حسابك مفعل بالكامل. يمكنك تحميل ملفاتك المتاحة مباشرة أدناه:</span>
                        </p>
                        <p className="text-gray-700 font-medium">
                          جميع الملفات مرفوعة بأمان على Cloudflare R2 وبصيغة جاهزة للتحميل الفوري.
                        </p>
                      </div>

                      {/* Downloadable Files List */}
                      {ord.files && ord.files.length > 0 ? (
                        <div className="space-y-2">
                          <h4 className="text-xs font-black text-[#0B1220] flex items-center gap-1.5 pt-1">
                            <FolderDown className="w-4 h-4 text-[#0F9D58]" />
                            <span>ملفات التحميل الخاصة بطلبك ({ord.files.length} ملف):</span>
                          </h4>

                          <div className="grid grid-cols-1 gap-2.5">
                            {ord.files.map((f: any) => (
                              <div
                                key={f.id || f.fileKey}
                                className="p-3.5 bg-gray-50 border border-gray-200 hover:border-[#0F9D58]/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 font-bold text-[10px] ${
                                    f.fileType === 'apk'
                                      ? 'bg-blue-500/10 border-blue-500/20 text-blue-600'
                                      : f.fileType === 'doc'
                                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-600'
                                      : 'bg-[#0F9D58]/10 border-[#0F9D58]/20 text-[#0F9D58]'
                                  }`}>
                                    {f.fileType === 'apk' ? 'APK' : f.fileType === 'doc' ? 'DOC' : 'ZIP'}
                                  </div>
                                  <div>
                                    <span className="font-black text-xs text-[#0B1220] block">{f.fileName}</span>
                                    <span className="text-[10px] text-gray-500 block mt-0.5 flex items-center gap-1">
                                      {f.category === 'data' ? (
                                        <>
                                          <Database className="w-3 h-3 text-amber-500 shrink-0" />
                                          <span>داتا مصر التسويقية (هدية)</span>
                                        </>
                                      ) : f.category === 'course' ? (
                                        <>
                                          <GraduationCap className="w-3 h-3 text-blue-500 shrink-0" />
                                          <span>ملف تعليمي</span>
                                        </>
                                      ) : f.fileType === 'apk' ? (
                                        <>
                                          <Smartphone className="w-3 h-3 text-emerald-500 shrink-0" />
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
                                  className="py-2 px-4 rounded-xl bg-[#0F9D58] hover:bg-[#0D8B4E] text-white text-xs font-black flex items-center justify-center gap-2 shadow-sm shadow-[#0F9D58]/20 transition-transform active:scale-95 shrink-0"
                                >
                                  <Download className="w-4 h-4" />
                                  <span>تحميل ({f.fileType === 'apk' ? 'APK' : f.fileType === 'doc' ? 'DOC' : 'ZIP'})</span>
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-gray-50 rounded-2xl text-xs text-gray-600 font-bold text-center">
                          تواصل مع الدعم الفني عبر الواتساب للحصول على الروابط المباشرة.
                        </div>
                      )}

                      {/* Tutorial Videos Section */}
                      {ord.videos && ord.videos.length > 0 && (
                        <div className="space-y-2 pt-3 border-t border-gray-100">
                          <h4 className="text-xs font-black text-[#0B1220] flex items-center gap-1.5">
                            <Video className="w-4 h-4 text-[#2ECC8F]" />
                            <span>فيديوهات الشرح والتدريب المتاحة لك ({ord.videos.length} فيديو):</span>
                          </h4>

                          <div className="grid grid-cols-1 gap-2.5">
                            {ord.videos.map((v: any) => (
                              <div
                                key={v.id}
                                className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-xs text-white">{v.title}</span>
                                  </div>
                                  {v.description && (
                                    <p className="text-[11px] text-gray-400">{v.description}</p>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setActiveVideo({ title: v.title, videoUrl: v.videoUrl, description: v.description })}
                                  className="py-2 px-4 rounded-xl bg-[#2ECC8F] hover:bg-[#25B57D] text-[#0B1220] text-xs font-extrabold flex items-center justify-center gap-2 shrink-0 shadow-sm transition-transform active:scale-95 cursor-pointer"
                                >
                                  <Play className="w-4 h-4 fill-current" />
                                  <span>مشاهدة الشرح المباشر</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
