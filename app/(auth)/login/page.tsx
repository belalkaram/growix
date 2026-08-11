'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { GrowixLogo } from '@/components/GrowixLogo';
import { Lock, Mail, ArrowLeft, LogIn, AlertCircle } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: any) {
      if (err?.message?.includes('NEXT_REDIRECT') || err?.type === 'Navigation') {
        router.push(callbackUrl);
        return;
      }
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0B1220] text-white flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-2">
            <GrowixLogo />
          </div>
          <h1 className="text-2xl font-black text-white">تسجيل الدخول</h1>
          <p className="text-xs text-gray-400">أدخل بيانات حسابك للوصول إلى GROWIX</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#2ECC8F]" />
              <span>البريد الإلكتروني</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@domain.com"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white focus:outline-none focus:border-[#2ECC8F] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#2ECC8F]" />
              <span>كلمة المرور</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white focus:outline-none focus:border-[#2ECC8F] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-l from-[#0F9D58] to-[#2ECC8F] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#0F9D58]/30 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span>جاري التحقق...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>تسجيل الدخول</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-white/10 text-center text-xs text-gray-400 flex items-center justify-between">
          <span>ليس لديك حساب؟</span>
          <Link href="/register" className="text-[#2ECC8F] font-bold hover:underline flex items-center gap-1">
            <span>أنشئ حساب جديد</span>
            <ArrowLeft className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
