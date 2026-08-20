'use client';

import React, { useState } from 'react';
import { createUserManualAction, createUserAutoAction } from '@/lib/actions/users';
import { X, UserPlus, Sparkles, Copy, Check, Lock, Mail, Phone, User, Shield, AlertCircle } from 'lucide-react';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onUserCreated }) => {
  const [tab, setTab] = useState<'manual' | 'auto'>('manual');
  
  // Manual Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'user' | 'admin' | 'test'>('user');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto Generated Result
  const [autoCredentials, setAutoCredentials] = useState<{
    id: string;
    name: string;
    email: string;
    password: string;
    role: string;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await createUserManualAction({
      name,
      email,
      password,
      phone,
      role,
    });

    setLoading(false);

    if (res.success) {
      onUserCreated();
      onClose();
      // reset
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
    } else {
      setError(res.error || 'حدث خطأ أثناء الإنشاء');
    }
  };

  const handleAutoGenerate = async () => {
    setLoading(true);
    setError(null);

    const res = await createUserAutoAction();
    setLoading(false);

    if (res.success && res.credentials) {
      setAutoCredentials(res.credentials);
      onUserCreated();
    } else {
      setError(res.error || 'حدث خطأ أثناء التوليد التلقائي');
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCopyAll = () => {
    if (!autoCredentials) return;
    const summary = `بيانات الدخول لحسابك في GROWIX:\n- البريد الإلكتروني: ${autoCredentials.email}\n- كلمة المرور: ${autoCredentials.password}\n- رابط الدخول: https://growix.belalkaram.dev/login`;
    navigator.clipboard.writeText(summary);
    setCopiedField('all');
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" dir="rtl">
      <div className="w-full max-w-lg bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0F9D58]/20 text-[#2ECC8F] flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">إضافة مستخدم جديد</h3>
              <p className="text-xs text-gray-400">اختر طريقة الإنشاء اليدوية أو التلقائية بضغطة زر</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Mode Tabs */}
        {!autoCredentials && (
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-black">
            <button
              type="button"
              onClick={() => { setTab('manual'); setError(null); }}
              className={`py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all ${
                tab === 'manual'
                  ? 'bg-[#00FF87] text-[#0A1128] shadow-md'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>الطريقة 1: إنشاء يدوي</span>
            </button>

            <button
              type="button"
              onClick={() => { setTab('auto'); setError(null); }}
              className={`py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all ${
                tab === 'auto'
                  ? 'bg-[#00FF87] text-[#0A1128] shadow-md'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>الطريقة 2: توليد تلقائي ⚡</span>
            </button>
          </div>
        )}

        {/* TAB 1: MANUAL FORM */}
        {tab === 'manual' && !autoCredentials && (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#2ECC8F]" />
                <span>الاسم بالكامل</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="محمد أحمد"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white placeholder:text-gray-500 focus:outline-none focus:border-[#2ECC8F]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#2ECC8F]" />
                <span>البريد الإلكتروني</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white placeholder:text-gray-500 focus:outline-none focus:border-[#2ECC8F] dir-ltr text-right"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#2ECC8F]" />
                  <span>كلمة المرور</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white placeholder:text-gray-500 focus:outline-none focus:border-[#2ECC8F] dir-ltr text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#2ECC8F]" />
                  <span>رقم الهاتف (اختياري)</span>
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01012345678"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white placeholder:text-gray-500 focus:outline-none focus:border-[#2ECC8F] dir-ltr text-right"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#2ECC8F]" />
                <span>نوع الحساب / الدور</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'user' | 'admin' | 'test')}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-sm font-bold text-white focus:outline-none focus:border-[#2ECC8F]"
              >
                <option value="user">👤 مستخدم عادي (User)</option>
                <option value="admin">👑 مدير نظام (Admin)</option>
                <option value="test">🧪 مستخدم تجريبي (Test Account)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#00FF87] hover:bg-[#00E676] text-[#0A1128] font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00FF87]/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? <span>جاري الإنشاء...</span> : <span>إنشاء الحساب يدوياً</span>}
            </button>
          </form>
        )}

        {/* TAB 2: AUTO GENERATE READY */}
        {tab === 'auto' && !autoCredentials && (
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#00FF87]/20 text-[#00FF87] flex items-center justify-center mx-auto">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-base font-black text-white">توليد حساب مستخدم تلقائياً بضغطة زر</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto leading-relaxed">
                يقوم النظام تلقائياً بإنشاء اسم عشوائي مميز، بريد إلكتروني، وكلمة مرور قوية ومشفرة، وحفظ الحساب فوراً في قاعدة البيانات مع إمكانية نسخ البيانات بضغطة زر.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAutoGenerate}
              disabled={loading}
              className="w-full py-4 rounded-xl bg-[#00FF87] hover:bg-[#00E676] text-[#0A1128] font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00FF87]/25 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? <span>جاري التوليد التلقائي...</span> : <span>توليد وإنشاء الحساب الآن ⚡</span>}
            </button>
          </div>
        )}

        {/* RESULT OF AUTO GENERATED USER */}
        {autoCredentials && (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-4 text-white">
            <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
              <Check className="w-5 h-5" />
              <span>تم إنشاء الحساب التلقائي بنجاح!</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-[#0F172A] border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-gray-400 block text-[10px]">الاسم:</span>
                  <span className="font-bold text-white">{autoCredentials.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(autoCredentials.name, 'name')}
                  className="text-gray-400 hover:text-white p-1"
                >
                  {copiedField === 'name' ? <Check className="w-4 h-4 text-[#00FF87]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-3 rounded-xl bg-[#0F172A] border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-gray-400 block text-[10px]">البريد الإلكتروني:</span>
                  <span className="font-bold text-white font-mono">{autoCredentials.email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(autoCredentials.email, 'email')}
                  className="text-gray-400 hover:text-white p-1"
                >
                  {copiedField === 'email' ? <Check className="w-4 h-4 text-[#00FF87]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-3 rounded-xl bg-[#0F172A] border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-gray-400 block text-[10px]">كلمة المرور المولدة:</span>
                  <span className="font-bold text-[#00FF87] font-mono text-sm">{autoCredentials.password}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(autoCredentials.password, 'password')}
                  className="text-gray-400 hover:text-white p-1"
                >
                  {copiedField === 'password' ? <Check className="w-4 h-4 text-[#00FF87]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleCopyAll}
                className="flex-1 py-3 rounded-xl bg-[#00FF87] text-[#0A1128] font-black text-xs flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
              >
                {copiedField === 'all' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedField === 'all' ? 'تم نسخ كافة البيانات!' : 'نسخ كافة البيانات لإرسالها للعميل'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAutoCredentials(null);
                  onClose();
                }}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
