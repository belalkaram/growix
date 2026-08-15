import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getSiteSettings } from '@/lib/queries';
import { auth } from '@/lib/auth';
import { HeaderNavbar } from '@/components/HeaderNavbar';
import { Footer } from '@/components/Footer';
import { SITE_CONFIG } from '@/config/site';
import { CheckCircle2, PackageCheck, MessageSquare, ArrowLeft, Clock, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'تم استلام طلبك بنجاح | GROWIX',
  description: 'شكراً لاشتراكك في GROWIX. تم استلام طلبك وجاري تفعيل حسابك واستلام الترسانة التسويقية.',
};

export default async function SuccessPage() {
  const [siteSettings, session] = await Promise.all([
    getSiteSettings(),
    auth(),
  ]);

  return (
    <main className="min-h-screen bg-[#F7F9FA] text-[#0B1220] font-sans" dir="rtl">
      <HeaderNavbar session={session} />

      <section className="pt-36 pb-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-xl text-center space-y-6">
          
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-[#0F9D58] flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0F9D58]/10 text-[#0F9D58] text-xs font-black">
            <Clock className="w-4 h-4" />
            <span>جاري التفعيل خلال 60 دقيقة</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#0B1220]">
            تم إرسال واستلام طلبك بنجاح! 🎉
          </h1>

          <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-xl mx-auto">
            شكراً لثقتك في **منصة GROWIX**. تم تسجيل طلبك بنجاح، وفريق الدعم متاح لمراجعة إيصال التحويل وتفعيل حسابك فوراً.
          </p>

          <div className="p-6 bg-[#F7F9FA] rounded-2xl border border-gray-200 text-right space-y-3">
            <h3 className="font-extrabold text-sm text-[#0B1220] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0F9D58]" />
              <span>الخطوات التالية لاستلام حسابك:</span>
            </h3>
            <ol className="list-decimal list-inside text-xs sm:text-sm text-gray-600 space-y-2 font-medium">
              <li>سيقوم فريق الدعم الفني بمراجعة الإيصال وتفعيل حسابك على منصة GROWIX.</li>
              <li>يمكنك متابعة حالة الطلب والوصول إلى برامجك وكورساتك في أي وقت عبر صفحة **«طلباتي وحسابي»**.</li>
              <li>إذا لم تقم بإرسال إيصال الدفع بعد، يمكنك إرساله مباشرة لممثل الدعم الفني عبر الواتساب.</li>
            </ol>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/my-orders"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-growix-gradient text-white font-extrabold text-sm shadow-lg hover:scale-105 transition-transform"
            >
              <PackageCheck className="w-4 h-4" />
              <span>الانتقال إلى طلباتي وحسابي</span>
            </Link>

            <a
              href={`https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent('مرحباً، قمت بإرسال طلب جديد وأود متابعة التفعيل.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[#0B1220] text-white font-extrabold text-sm hover:bg-[#1a263d] transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-[#2ECC8F]" />
              <span>تأكيد التفعيل عبر الواتساب</span>
            </a>
          </div>

        </div>
      </section>

      <Footer settings={siteSettings} />
    </main>
  );
}
