'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { GrowixLogo } from '@/components/GrowixLogo';
import { AuthBrandShowcase } from '@/components/AuthBrandShowcase';
import { Lock, Mail, ArrowLeft, LogIn, AlertCircle, Eye, EyeOff, Check, ArrowRight } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

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
        window.location.href = callbackUrl;
      }
    } catch (err: any) {
      if (err?.message?.includes('NEXT_REDIRECT') || err?.type === 'Navigation') {
        window.location.href = callbackUrl;
        return;
      }
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#070C1A] text-white flex items-center justify-center p-0 lg:p-6 font-sans selection:bg-[#00FF87] selection:text-[#0A1128]" dir="rtl">
      
      <div className="w-full max-w-6xl min-h-screen lg:min-h-[720px] bg-[#0A1128] lg:border lg:border-white/10 lg:rounded-[32px] overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 relative backdrop-blur-2xl">
        
        {/* RIGHT COLUMN (نصف اليمين): Sleek Login Form */}
        <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-between p-6 sm:p-10 lg:p-12 z-20 bg-[#0F172A]/90 backdrop-blur-xl border-l border-white/5">
          
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="hover:opacity-90 transition-opacity">
              <GrowixLogo theme="dark" iconSize={32} />
            </Link>
            
            <Link
              href="/"
              className="text-xs font-bold text-gray-400 hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <span>الرئيسية</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#00FF87]" />
            </Link>
          </div>

          <div className="space-y-6 max-w-md mx-auto w-full">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-[#00FF87]/10 text-[#00FF87] border border-[#00FF87]/20 mb-2">
                <LogIn className="w-3.5 h-3.5" />
                <span>مرحباً بعودتك</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">تسجيل الدخول</h1>
              <p className="text-xs sm:text-sm text-gray-400 font-medium mt-1">
                أدخل بيانات حسابك للوصول المباشر إلى أدوات وكورسات GROWIX
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* 🌐 Google OAuth 1-Click Login */}
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl })}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-gray-100 text-[#0F172A] font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all hover:scale-[1.01] active:scale-95 cursor-pointer border border-gray-200"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>المتابعة باستخدام حساب Google</span>
            </button>

            {/* OR Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-white/15 w-full" />
              <span className="bg-[#0F172A] px-3 text-[11px] font-bold text-gray-400 whitespace-nowrap">
                أو الدخول عبر البريد الإلكتروني
              </span>
              <div className="border-t border-white/15 w-full" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-xs font-bold text-gray-200 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>البريد الإلكتروني</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@domain.com"
                  className="w-full px-4 py-3 rounded-xl bg-[#070C1A] border border-white/15 text-sm font-medium text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00FF87] focus:ring-2 focus:ring-[#00FF87]/20 transition-all dir-ltr text-right"
                />
              </div>

              {/* Password Input with Show/Hide Toggle */}
              <div>
                <label className="block text-xs font-bold text-gray-200 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>كلمة المرور</span>
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl bg-[#070C1A] border border-white/15 text-sm font-medium text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00FF87] focus:ring-2 focus:ring-[#00FF87]/20 transition-all dir-ltr text-right pl-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                    title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-[#00FF87]" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-gray-300 font-medium cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#070C1A] border-white/20 text-[#00FF87] focus:ring-[#00FF87]/30 cursor-pointer"
                  />
                  <span className="group-hover:text-white transition-colors">تذكر الحساب على هذا الجهاز</span>
                </label>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#00FF87] hover:bg-[#00E676] text-[#0A1128] font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00FF87]/25 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span>جاري التحقق...</span>
                ) : (
                  <>
                    <span>تسجيل الدخول</span>
                    <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-white/10 text-center text-xs text-gray-400 flex items-center justify-between">
              <span>ليس لديك حساب بعد؟</span>
              <Link href="/register" className="text-[#00FF87] font-bold hover:underline flex items-center gap-1">
                <span>إنشاء حساب جديد</span>
                <ArrowLeft className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="pt-6 text-center text-[11px] text-gray-500">
            © {new Date().getFullYear()} GROWIX Platform — جميع الحقوق محفوظة
          </div>
        </div>

        {/* LEFT COLUMN (نصف الشمال): Brand Showcase & Motion Graphics */}
        <div className="lg:col-span-6 xl:col-span-7 hidden lg:block bg-gradient-to-br from-[#0B1528] via-[#0E1E38] to-[#070C1A] relative">
          <AuthBrandShowcase />
        </div>

      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#070C1A] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#00FF87] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
