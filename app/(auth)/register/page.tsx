'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/actions/users';
import { GrowixLogo } from '@/components/GrowixLogo';
import { User, Mail, Lock, Phone, ArrowLeft, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await registerUser({ name, email, password, phone });

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
    <main className="min-h-screen bg-[#0B1220] text-white flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-2">
            <GrowixLogo />
          </div>
          <h1 className="text-2xl font-black text-white">إنشاء حساب جديد</h1>
          <p className="text-xs text-gray-400">انضم إلى GROWIX وابدأ في استخدام أدواتك التسويقية</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>تم إنشاء الحساب بنجاح! جاري تحويلك لصفحة الدخول...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#2ECC8F]" />
              <span>الاسم الكامل</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="محمد أحمد"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white focus:outline-none focus:border-[#2ECC8F] transition-colors"
            />
          </div>

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

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#2ECC8F]" />
              <span>رقم الموبايل (اختياري)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010XXXXXXXX"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white focus:outline-none focus:border-[#2ECC8F] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-l from-[#0F9D58] to-[#2ECC8F] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#0F9D58]/30 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span>جاري الإنشاء...</span>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>إنشاء حساب جديد</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-white/10 text-center text-xs text-gray-400 flex items-center justify-between">
          <span>لديك حساب بالفعل؟</span>
          <Link href="/login" className="text-[#2ECC8F] font-bold hover:underline flex items-center gap-1">
            <span>سجل الدخول هنا</span>
            <ArrowLeft className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </main>
  );
}
