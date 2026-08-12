'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { GrowixLogo } from '@/components/GrowixLogo';
import { TurnstileWidget } from '@/components/TurnstileWidget';
import { Lock, Mail, ArrowLeft, LogIn, AlertCircle, Eye, EyeOff, Check } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Cloudflare Turnstile token validation
    if (!turnstileToken) {
      setError('يرجى إكمال التحقق الأمني (أنا لست روبوت)');
      return;
    }

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
    <main className="min-h-screen bg-[#0A1128] text-white flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-[#00FF87] selection:text-[#0A1128]" dir="rtl">
      
      {/* Ambient Radial Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-[#00FF87]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#1C2541] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative z-10 backdrop-blur-xl">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-2">
            <GrowixLogo theme="dark" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide">تسجيل الدخول</h1>
          <p className="text-xs text-gray-300 font-medium">أدخل بيانات حسابك والتحقق الأمني للوصول إلى GROWIX</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

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
              className="w-full px-4 py-3 rounded-xl bg-[#0A1128]/70 border border-white/10 text-sm font-medium text-white placeholder:text-gray-500 focus:outline-none focus:border-[#38BDF8] focus:ring-2 focus:ring-[#38BDF8]/20 transition-all dir-ltr text-right"
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
                className="w-full px-4 py-3 rounded-xl bg-[#0A1128]/70 border border-white/10 text-sm font-medium text-white placeholder:text-gray-500 focus:outline-none focus:border-[#38BDF8] focus:ring-2 focus:ring-[#38BDF8]/20 transition-all dir-ltr text-right pl-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPassword ? <EyeOff className="w-4 h-4 text-[#38BDF8]" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me (تذكرني) Checkbox */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-gray-300 font-medium cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-[#0A1128] border-white/20 text-[#00FF87] focus:ring-[#38BDF8]/30 cursor-pointer"
              />
              <span className="group-hover:text-white transition-colors">تذكر الحساب على هذا الجهاز</span>
            </label>
          </div>

          {/* Cloudflare Turnstile "I am human" Widget (Dark Mode) */}
          <div className="pt-1">
            <TurnstileWidget
              onVerify={(token) => setTurnstileToken(token)}
              onExpire={() => setTurnstileToken(null)}
              onError={() => setTurnstileToken(null)}
            />
          </div>

          {/* Cyber Neon Action Button */}
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
          <Link href="/register" className="text-[#38BDF8] font-bold hover:underline flex items-center gap-1">
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
