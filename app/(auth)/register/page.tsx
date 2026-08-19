'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/actions/users';
import { GrowixLogo } from '@/components/GrowixLogo';
import { TurnstileWidget } from '@/components/TurnstileWidget';
import { AuthBrandShowcase } from '@/components/AuthBrandShowcase';
import { User, Mail, Lock, ArrowLeft, ArrowRight, UserPlus, AlertCircle, CheckCircle2, ShieldCheck, Eye, EyeOff } from 'lucide-react';

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
    <main className="min-h-screen bg-[#070C1A] text-white flex items-center justify-center p-0 lg:p-6 font-sans selection:bg-[#00FF87] selection:text-[#0A1128]" dir="rtl">
      
      <div className="w-full max-w-6xl min-h-screen lg:min-h-[760px] bg-[#0A1128] lg:border lg:border-white/10 lg:rounded-[32px] overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 relative backdrop-blur-2xl">
        
        {/* RIGHT COLUMN (نصف اليمين): Sleek Register Form */}
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

          <div className="space-y-5 max-w-md mx-auto w-full">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-[#00FF87]/10 text-[#00FF87] border border-[#00FF87]/20 mb-2">
                <UserPlus className="w-3.5 h-3.5" />
                <span>انضم إلينا اليوم</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">إنشاء حساب جديد</h1>
              <p className="text-xs sm:text-sm text-gray-400 font-medium mt-1">
                أنشئ حسابك للوصول المباشر إلى ترسانة أدوات وكورسات GROWIX
              </p>
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

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* 1. الاسم */}
              <div>
                <label className="block text-xs font-bold text-gray-200 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>الاسم بالكامل</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="محمد أحمد"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#070C1A] border border-white/15 text-sm font-medium text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00FF87] focus:ring-2 focus:ring-[#00FF87]/20 transition-all"
                />
              </div>

              {/* 2. البريد الإلكتروني */}
              <div>
                <label className="block text-xs font-bold text-gray-200 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>البريد الإلكتروني</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@domain.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#070C1A] border border-white/15 text-sm font-medium text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00FF87] focus:ring-2 focus:ring-[#00FF87]/20 transition-all dir-ltr text-right"
                />
              </div>

              {/* 3. كلمة المرور */}
              <div>
                <label className="block text-xs font-bold text-gray-200 mb-1 flex items-center gap-1.5">
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
                    className="w-full px-4 py-2.5 rounded-xl bg-[#070C1A] border border-white/15 text-sm font-medium text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00FF87] focus:ring-2 focus:ring-[#00FF87]/20 transition-all dir-ltr text-right pl-10"
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

              {/* 4. تأكيد كلمة المرور */}
              <div>
                <label className="block text-xs font-bold text-gray-200 mb-1 flex items-center gap-1.5">
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
                    className="w-full px-4 py-2.5 rounded-xl bg-[#070C1A] border border-white/15 text-sm font-medium text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00FF87] focus:ring-2 focus:ring-[#00FF87]/20 transition-all dir-ltr text-right pl-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                    title={showConfirmPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4 text-[#00FF87]" /> : <Eye className="w-4 h-4" />}
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
              <Link href="/login" className="text-[#00FF87] font-bold hover:underline flex items-center gap-1">
                <span>سجل الدخول هنا</span>
                <ArrowLeft className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="pt-4 text-center text-[11px] text-gray-500">
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
