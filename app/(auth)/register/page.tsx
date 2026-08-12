'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/actions/users';
import { GrowixLogo } from '@/components/GrowixLogo';
import { TurnstileWidget } from '@/components/TurnstileWidget';
import { User, Mail, Lock, ArrowLeft, UserPlus, AlertCircle, CheckCircle2, ShieldCheck, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين. يرجى إعادة التأكد.');
      return;
    }

    if (!turnstileToken) {
      setError('يرجى إكمال التحقق الأمني (أنا لست روبوت)');
      return;
    }

    setLoading(true);

    try {
      const res = await registerUser({ 
        name, 
        email, 
        password, 
        turnstileToken 
      });

      if (!res.success) {
        setError(res.error || 'حدث خطأ أثناء الإنشاء');
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      }
    } catch {
      setError('حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0A1128] text-white flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-[#00FF87] selection:text-[#0A1128]" dir="rtl">
      
      {/* Ambient Radial Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-[#00FF87]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#1C2541] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative z-10 backdrop-blur-xl">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-2">
            <GrowixLogo theme="dark" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide">إنشاء حساب جديد</h1>
          <p className="text-xs text-gray-300 font-medium">أنشئ حسابك للوصول المباشر إلى أدوات GROWIX</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>تم إنشاء الحساب بنجاح! جاري تحويلك لصفحة الدخول...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. الاسم */}
          <div>
            <label className="block text-xs font-bold text-gray-200 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>الاسم</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="محمد أحمد"
              className="w-full px-4 py-3 rounded-xl bg-[#0A1128]/70 border border-white/10 text-sm font-medium text-white placeholder:text-gray-500 focus:outline-none focus:border-[#38BDF8] focus:ring-2 focus:ring-[#38BDF8]/20 transition-all"
            />
          </div>

          {/* 2. البريد الإلكتروني */}
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

          {/* 3. كلمة المرور */}
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

          {/* 4. تأكيد كلمة المرور */}
          <div>
            <label className="block text-xs font-bold text-gray-200 mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>تأكيد كلمة المرور</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="أعد كتابة كلمة المرور"
                className="w-full px-4 py-3 rounded-xl bg-[#0A1128]/70 border border-white/10 text-sm font-medium text-white placeholder:text-gray-500 focus:outline-none focus:border-[#38BDF8] focus:ring-2 focus:ring-[#38BDF8]/20 transition-all dir-ltr text-right pl-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                title={showConfirmPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4 text-[#38BDF8]" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
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
              <span>جاري الإنشاء...</span>
            ) : (
              <>
                <span>إنشاء حساب جديد</span>
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-white/10 text-center text-xs text-gray-400 flex items-center justify-between">
          <span>لديك حساب بالفعل؟</span>
          <Link href="/login" className="text-[#38BDF8] font-bold hover:underline flex items-center gap-1">
            <span>سجل الدخول هنا</span>
            <ArrowLeft className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </main>
  );
}
