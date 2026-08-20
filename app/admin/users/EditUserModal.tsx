'use client';

import React, { useState } from 'react';
import { updateUserAction } from '@/lib/actions/users';
import { X, Edit, User, Mail, Phone, Lock, Shield, AlertCircle, Check } from 'lucide-react';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    role: string;
  };
  onUserUpdated: () => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, user, onUserUpdated }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || '');
  const [role, setRole] = useState<'user' | 'admin' | 'test'>(
    user.role === 'admin' ? 'admin' : user.role === 'test' ? 'test' : 'user'
  );
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await updateUserAction({
      id: user.id,
      name,
      email,
      phone: phone || null,
      role,
      password: newPassword.trim() || undefined,
    });

    setLoading(false);

    if (res.success) {
      onUserUpdated();
      onClose();
    } else {
      setError(res.error || 'حدث خطأ أثناء التعديل');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" dir="rtl">
      <div className="w-full max-w-lg bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <Edit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">تعديل بيانات المستخدم</h3>
              <p className="text-xs text-gray-400">تحديث الاسم، الإيميل، الهاتف، الدور، أو تعيين كلمة مرور جديدة</p>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span>الاسم بالكامل</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white focus:outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>البريد الإلكتروني</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white focus:outline-none focus:border-blue-400 dir-ltr text-right"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                <span>رقم الهاتف</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010..."
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white focus:outline-none focus:border-blue-400 dir-ltr text-right"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>نوع الحساب / الدور</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'user' | 'admin' | 'test')}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-sm font-bold text-white focus:outline-none focus:border-blue-400"
              >
                <option value="user">👤 مستخدم عادي (User)</option>
                <option value="admin">👑 مدير نظام (Admin)</option>
                <option value="test">🧪 مستخدم تجريبي (Test Account)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span>تغيير كلمة المرور (اتركها فارغة إذا لم ترغب في التغيير)</span>
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="كلمة مرور جديدة (اختياري)"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-400 dir-ltr text-right"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? <span>جاري الحفظ...</span> : <span>حفظ التعديلات</span>}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm transition-colors cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
