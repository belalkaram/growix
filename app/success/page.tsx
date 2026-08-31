import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getSiteSettings } from '@/lib/queries';
import { auth } from '@/lib/auth';
import { HeaderNavbar } from '@/components/HeaderNavbar';
import { Footer } from '@/components/Footer';
import { SITE_CONFIG } from '@/config/site';
import { 
  CheckCircle2, 
  PackageCheck, 
  MessageSquare, 
  Clock, 
  ShieldCheck, 
  Receipt, 
  User, 
  Mail, 
  KeyRound, 
  Sparkles,
  ExternalLink,
  Package
} from 'lucide-react';
import { db } from '@/db';
import { orders, users, packages, tools } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export const metadata: Metadata = {
  title: 'تم استلام وتأكيد طلبك بنجاح | GROWIX',
  description: 'شكراً لاشتراكك في GROWIX. تم استلام طلبك وجاري تفعيل حسابك واستلام الترسانة التسويقية.',
};

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;

  const [siteSettings, session] = await Promise.all([
    getSiteSettings(),
    auth(),
  ]);

  let userOrder: any = null;

  try {
    if (orderId) {
      const ords = await db
        .select({
          id: orders.id,
          userId: orders.userId,
          packageId: orders.packageId,
          toolId: orders.toolId,
          amount: orders.amount,
          originalAmount: orders.originalAmount,
          discountAmount: orders.discountAmount,
          couponCode: orders.couponCode,
          senderNumber: orders.senderNumber,
          paymentMethod: orders.paymentMethod,
          status: orders.status,
          createdAt: orders.createdAt,
          userName: users.name,
          userEmail: users.email,
          userPhone: users.phone,
        })
        .from(orders)
        .leftJoin(users, eq(orders.userId, users.id))
        .where(eq(orders.id, orderId))
        .limit(1);

      if (ords.length > 0) {
        userOrder = ords[0];
      }
    } else if (session?.user?.id) {
      const ords = await db
        .select({
          id: orders.id,
          userId: orders.userId,
          packageId: orders.packageId,
          toolId: orders.toolId,
          amount: orders.amount,
          originalAmount: orders.originalAmount,
          discountAmount: orders.discountAmount,
          couponCode: orders.couponCode,
          senderNumber: orders.senderNumber,
          paymentMethod: orders.paymentMethod,
          status: orders.status,
          createdAt: orders.createdAt,
          userName: users.name,
          userEmail: users.email,
          userPhone: users.phone,
        })
        .from(orders)
        .leftJoin(users, eq(orders.userId, users.id))
        .where(eq(orders.userId, session.user.id))
        .orderBy(desc(orders.createdAt))
        .limit(1);

      if (ords.length > 0) {
        userOrder = ords[0];
      }
    }
  } catch (err) {
    console.error('Error loading order on success page:', err);
  }

  // Resolve Package Name
  let packageName = 'باقة GROWIX التسويقية';
  if (userOrder?.packageId === 'bundle-vip') {
    packageName = 'باقة VIP الشاملة (12 أداة + كورس + داتا)';
  } else if (userOrder?.packageId === 'bundle-premium') {
    packageName = 'باقة Premium (12 أداة + داتا مصر)';
  } else if (userOrder?.packageId === 'single-tool') {
    packageName = 'باقة البرنامج الفردي المختار';
  }

  return (
    <main className="min-h-screen bg-[#F7F9FA] text-[#0B1220] font-sans" dir="rtl">
      <HeaderNavbar session={session} settings={siteSettings} />

      <section className="pt-32 sm:pt-36 pb-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl p-6 sm:p-10 md:p-12 border border-gray-200 shadow-xl text-center space-y-6">
          
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-[#0F9D58] flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0F9D58]/10 text-[#0F9D58] text-xs font-black">
            <Clock className="w-4 h-4" />
            <span>{userOrder?.status === 'approved' ? 'تم التفعيل التلقائي الفوري 🎉' : 'جاري مراجعة وتأكيد التفعيل خلال دقائق'}</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B1220]">
              تم تسجيل وتأكيد طلبك بنجاح! 🎉
            </h1>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-xl mx-auto mt-2">
              شكراً لثقتك في <strong>منصة GROWIX</strong>. تم توثيق طلبك وإنشاء مساحتك التسويقية تلقائياً بنجاح.
            </p>
          </div>

          {/* 🔑 Guest User Account Credentials Notice Box */}
          {userOrder && (
            <div className="p-5 sm:p-6 bg-[#0B1220] text-white rounded-3xl border border-white/10 text-right space-y-4 shadow-lg relative overflow-hidden">
              <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#0F9D58]/20 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-white/10 pb-3 relative z-10">
                <div className="flex items-center gap-2 text-xs font-bold text-[#2ECC8F]">
                  <Sparkles className="w-4 h-4" />
                  <span>بيانات الدخول لحسابك الجديد على المنصة:</span>
                </div>
                <span className="text-[10px] bg-[#0F9D58]/20 text-[#2ECC8F] px-2.5 py-0.5 rounded-full font-bold border border-[#2ECC8F]/30">
                  تم الإنشاء تلقائياً
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs relative z-10">
                <div className="p-3 bg-white/10 rounded-2xl border border-white/10 space-y-1">
                  <div className="flex items-center gap-1.5 text-gray-300 text-[11px]">
                    <Mail className="w-3.5 h-3.5 text-[#2ECC8F]" />
                    <span>البريد الإلكتروني:</span>
                  </div>
                  <span className="font-mono font-bold text-sm text-white block dir-ltr text-right truncate">
                    {userOrder.userEmail || '—'}
                  </span>
                </div>

                <div className="p-3 bg-white/10 rounded-2xl border border-white/10 space-y-1">
                  <div className="flex items-center gap-1.5 text-gray-300 text-[11px]">
                    <KeyRound className="w-3.5 h-3.5 text-[#2ECC8F]" />
                    <span>كلمة المرور الافتراضية:</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono font-bold text-sm text-[#2ECC8F] block dir-ltr text-right">
                      {userOrder.senderNumber}
                    </span>
                    <span className="text-[10px] text-gray-400 font-normal">
                      (رقم التحويل)
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-gray-300 leading-relaxed relative z-10">
                💡 يمكنك تسجيل الدخول في أي وقت باستخدام بريدك الإلكتروني ورقم الهاتف المحوّل منه ككلمة مرور.
              </p>
            </div>
          )}

          {/* Order & Coupon Summary Box if available */}
          {userOrder && (
            <div className="p-5 bg-gradient-to-br from-emerald-50/80 to-white rounded-2xl border border-emerald-200/80 text-right space-y-3 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                <span className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-[#0F9D58]" />
                  <span>تفاصيل الطلب:</span>
                </span>
                <span className="text-xs font-mono font-bold text-gray-500 dir-ltr">
                  #{userOrder.id.slice(0, 8)}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-emerald-100">
                  <span className="text-gray-500 block text-[11px]">الباقة:</span>
                  <span className="font-bold text-xs text-[#0B1220] block truncate mt-0.5">{packageName}</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-emerald-100">
                  <span className="text-gray-500 block text-[11px]">المبلغ المطلوب:</span>
                  <span className="font-black text-sm text-[#0F9D58]">{userOrder.amount} جنية</span>
                </div>

                {userOrder.couponCode && (
                  <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-300">
                    <span className="text-emerald-800 block text-[11px] font-bold">كود الخصم:</span>
                    <span className="font-mono font-black text-xs text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-300 inline-block mt-0.5">
                      🏷️ {userOrder.couponCode}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="p-6 bg-[#F7F9FA] rounded-2xl border border-gray-200 text-right space-y-3">
            <h3 className="font-extrabold text-sm text-[#0B1220] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0F9D58]" />
              <span>الخطوات التالية لاستلام وتشغيل حسابك:</span>
            </h3>
            <ol className="list-decimal list-inside text-xs sm:text-sm text-gray-600 space-y-2 font-medium leading-relaxed">
              <li>يقوم النظام والدعم الفني بمطابقة تحويلك وتفعيل باقتك فوراً.</li>
              <li>يمكنك الوصول إلى روابط البرامج وشروحات الفيديو مباشرة من صفحة <strong>«طلباتي وحسابي»</strong>.</li>
              <li>إذا كنت تود التأكيد الفوري السريع أو إرسال صورة التحويل، يمكنك التواصل فوراً مع الدعم عبر الواتساب.</li>
            </ol>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={userOrder?.id ? `/my-orders?orderId=${userOrder.id}` : '/my-orders'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[#0F9D58] hover:bg-[#0D8B4E] text-white font-extrabold text-sm shadow-lg shadow-[#0F9D58]/25 hover:scale-105 transition-all cursor-pointer"
            >
              <PackageCheck className="w-4 h-4" />
              <span>الانتقال إلى لوحة طلباتي وأدواتي</span>
            </Link>

            <a
              href={`https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(`مرحباً، قمت بإرسال طلب اشتراك جديد على GROWIX ${userOrder ? `(رقم الطلب: ${userOrder.id} - ${userOrder.userName || ''})` : ''} وأود تأكيد التفعيل فوراً.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[#0B1220] text-white font-extrabold text-sm hover:bg-[#1a263d] transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-[#2ECC8F]" />
              <span>تأكيد التفعيل السريع عبر واتساب</span>
            </a>
          </div>

        </div>
      </section>

      <Footer settings={siteSettings} />
    </main>
  );
}
