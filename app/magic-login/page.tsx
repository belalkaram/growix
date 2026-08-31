'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { GrowixLogo } from '@/components/GrowixLogo';
import { Sparkles, CheckCircle2, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

function MagicLoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const orderId = searchParams.get('orderId');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('رابط الدخول السريع غير مكتمل أو مفقود.');
      return;
    }

    let isMounted = true;

    async function executeMagicLogin() {
      try {
        const result = await signIn('credentials', {
          magicToken: token,
          redirect: false,
        });

        if (!isMounted) return;

        if (result?.ok) {
          setStatus('success');
          setTimeout(() => {
            const dest = orderId ? `/my-orders?orderId=${orderId}&success=1` : '/my-orders';
            window.location.href = dest;
          }, 1000);
        } else {
          setStatus('error');
          setErrorMessage('رابط الدخول السريع غير صالح أو منتهي الصلاحية. يرجى تسجيل الدخول بالإيميل ورقم هاتفك المحول منه.');
        }
      } catch (err: any) {
        if (!isMounted) return;
        setStatus('error');
        setErrorMessage('حدث خطأ أثناء معالجة تسجيل الدخول السريع.');
      }
    }

    executeMagicLogin();

    return () => {
      isMounted = false;
    };
  }, [token, orderId, router]);

  return (
    <div className="w-full max-w-md bg-[#0F172A] border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl text-center space-y-6">
      <div className="flex justify-center">
        <GrowixLogo theme="dark" iconSize={40} />
      </div>

      {status === 'loading' && (
        <div className="space-y-4 py-6">
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-[#00FF87]/20 border-t-[#00FF87] animate-spin" />
            <Sparkles className="w-6 h-6 text-[#00FF87] animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">جاري تسجيل الدخول السريع...</h2>
            <p className="text-xs text-gray-400 mt-1.5">
              يتم التحقق من هويتك وتجهيز مساحة الأدوات والكورسات الخاصة بك
            </p>
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="space-y-4 py-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#00FF87]/20 border border-[#00FF87]/40 flex items-center justify-center text-[#00FF87] shadow-lg shadow-[#00FF87]/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">تم تسجيل دخولك بنجاح! 🎉</h2>
            <p className="text-xs text-[#00FF87] font-bold mt-1.5 flex items-center justify-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>جاري توجيهك لصفحة طلباتك وأدواتك فوراً...</span>
            </p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-4 py-4 animate-in fade-in duration-300">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">تعذر تسجيل الدخول التلقائي</h2>
            <p className="text-xs text-red-300 mt-1 leading-relaxed">
              {errorMessage}
            </p>
          </div>

          <div className="pt-3 space-y-2.5">
            <Link
              href="/login"
              className="w-full py-3.5 rounded-xl bg-growix-gradient hover:bg-growix-gradient-hover text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#0F9D58]/30 transition-transform hover:scale-[1.02] active:scale-95"
            >
              <span>تسجيل الدخول العادي بالبريد وكلمة المرور</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <Link
              href="/"
              className="block text-xs text-gray-400 hover:text-white transition-colors pt-1"
            >
              العودة للرئيسية
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MagicLoginPage() {
  return (
    <main className="min-h-screen bg-[#070C1A] text-white flex items-center justify-center p-4 font-sans selection:bg-[#00FF87] selection:text-[#0A1128]" dir="rtl">
      <Suspense fallback={<div className="text-white text-sm">جاري التحميل...</div>}>
        <MagicLoginContent />
      </Suspense>
    </main>
  );
}
