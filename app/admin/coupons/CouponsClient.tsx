'use client';

import React, { useState } from 'react';
import { 
  Tag, 
  Plus, 
  Trash2, 
  Edit3, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  Calendar, 
  Clock, 
  Percent, 
  AlertCircle, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  UserCheck, 
  X,
  Phone,
  Mail,
  Receipt
} from 'lucide-react';
import { 
  createCouponAction, 
  updateCouponAction, 
  deleteCouponAction, 
  toggleCouponStatusAction, 
  getCouponUsersAction 
} from '@/lib/actions/coupons';

interface CouponItem {
  id: string;
  code: string;
  discountPercent: number;
  validFrom: Date | string;
  validUntil: Date | string;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  description: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface CouponUser {
  id: number;
  discountApplied: string;
  usedAt: Date | string;
  orderId: string | null;
  userName: string;
  userEmail: string;
  userPhone: string | null;
  orderStatus: string | null;
  orderAmount: string | null;
}

export function CouponsClient({ initialCoupons }: { initialCoupons: CouponItem[] }) {
  const [couponsList, setCouponsList] = useState<CouponItem[]>(initialCoupons);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null);
  const [viewingUsersCoupon, setViewingUsersCoupon] = useState<CouponItem | null>(null);
  const [couponUsers, setCouponUsers] = useState<CouponUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    code: '',
    discountPercent: 20,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usageLimit: 100,
    description: '',
    isActive: true,
  });

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Filtered list
  const filteredCoupons = couponsList.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.code.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q))
    );
  });

  // Stats
  const totalCoupons = couponsList.length;
  const activeCouponsCount = couponsList.filter((c) => c.isActive).length;
  const totalUsesCount = couponsList.reduce((acc, curr) => acc + (curr.usedCount || 0), 0);
  const maxDiscount = couponsList.reduce((acc, curr) => Math.max(acc, curr.discountPercent || 0), 0);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleOpenCreate = () => {
    setFormData({
      code: '',
      discountPercent: 20,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      usageLimit: 100,
      description: '',
      isActive: true,
    });
    setFormError(null);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (coupon: CouponItem) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      validFrom: new Date(coupon.validFrom).toISOString().split('T')[0],
      validUntil: new Date(coupon.validUntil).toISOString().split('T')[0],
      usageLimit: coupon.usageLimit || 100,
      description: coupon.description || '',
      isActive: coupon.isActive,
    });
    setFormError(null);
  };

  const handleOpenUsers = async (coupon: CouponItem) => {
    setViewingUsersCoupon(coupon);
    setLoadingUsers(true);
    setCouponUsers([]);
    try {
      const res = await getCouponUsersAction(coupon.id);
      if (res.success && res.users) {
        setCouponUsers(res.users);
      }
    } catch (err) {
      console.error('Failed to fetch coupon users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    const res = await createCouponAction(formData);
    setFormLoading(false);

    if (!res.success) {
      setFormError(res.error || 'حدث خطأ أثناء إضافة الكوبون');
    } else if (res.coupon) {
      setCouponsList([res.coupon, ...couponsList]);
      setIsCreateOpen(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon) return;

    setFormLoading(true);
    setFormError(null);

    const res = await updateCouponAction(editingCoupon.id, formData);
    setFormLoading(false);

    if (!res.success) {
      setFormError(res.error || 'حدث خطأ أثناء تعديل الكوبون');
    } else if (res.coupon) {
      setCouponsList(couponsList.map((c) => (c.id === editingCoupon.id ? res.coupon : c)));
      setEditingCoupon(null);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`هل أنت متأكد من رغبتك في حذف الكوبون (${code}) نهائياً؟`)) {
      return;
    }

    const res = await deleteCouponAction(id);
    if (res.success) {
      setCouponsList(couponsList.filter((c) => c.id !== id));
    } else {
      alert(res.error || 'حدث خطأ أثناء الحذف');
    }
  };

  const handleToggleStatus = async (coupon: CouponItem) => {
    const newStatus = !coupon.isActive;
    const res = await toggleCouponStatusAction(coupon.id, newStatus);
    if (res.success) {
      setCouponsList(
        couponsList.map((c) => (c.id === coupon.id ? { ...c, isActive: newStatus } : c))
      );
    } else {
      alert(res.error || 'حدث خطأ أثناء تغيير الحالة');
    }
  };

  return (
    <div className="space-y-7" dir="rtl">
      
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0F9D58] to-[#2ECC8F] text-white flex items-center justify-center shadow-lg shadow-[#0F9D58]/20">
              <Tag className="w-5 h-5" />
            </div>
            <span>إدارة الكوبونات وقسائم الخصم</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            إنشاء أكواد الخصم، تحديد نسب التخفيض، فترات الصلاحية، ومتابعة المستخدمين المستفيدين بكل تفصيل.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#0F9D58] hover:bg-[#0D8B4E] text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-[#0F9D58]/25 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة كوبون جديد</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold">إجمالي الكوبونات</span>
            <Tag className="w-4 h-4 text-[#2ECC8F]" />
          </div>
          <span className="text-2xl font-black text-white">{totalCoupons}</span>
          <span className="text-[11px] text-gray-500 block mt-1">كوبون مسجل بالنظام</span>
        </div>

        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold">الكوبونات النشطة</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-black text-emerald-400">{activeCouponsCount}</span>
          <span className="text-[11px] text-gray-500 block mt-1">متاحة للاستخدام الآن</span>
        </div>

        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold">إجمالي الاستخدامات</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-2xl font-black text-cyan-400">{totalUsesCount}</span>
          <span className="text-[11px] text-gray-500 block mt-1">مستخدم استفاد من الخصم</span>
        </div>

        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold">أعلى نسبة خصم</span>
            <Percent className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-black text-amber-400">{maxDiscount}%</span>
          <span className="text-[11px] text-gray-500 block mt-1">أقوى تخفيض متاح</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بكود الكوبون أو الوصف..."
            className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white placeholder:text-gray-500 focus:outline-none focus:border-[#0F9D58] transition-colors"
          />
        </div>

        <div className="text-xs text-gray-400 font-bold self-end sm:self-center">
          عرض {filteredCoupons.length} من أصل {couponsList.length} كوبون
        </div>
      </div>

      {/* Coupons Table List */}
      <div className="bg-[#0F172A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        {filteredCoupons.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-white/5 text-gray-400 flex items-center justify-center mx-auto">
              <Tag className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-gray-300">لا توجد كوبونات مطابقة للبحث</p>
            <p className="text-xs text-gray-500">يمكنك إنشاء أول كوبون خصم بالضغط على زر «إضافة كوبون جديد» أعلاه</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-white/5 text-gray-400 border-b border-white/10 select-none">
                <tr>
                  <th className="p-4 font-bold">كود الكوبون</th>
                  <th className="p-4 font-bold">نسبة الخصم</th>
                  <th className="p-4 font-bold">فترة الصلاحية</th>
                  <th className="p-4 font-bold">معدل الاستخدام (الحد الأقصى)</th>
                  <th className="p-4 font-bold">الحالة</th>
                  <th className="p-4 font-bold text-center">المستفيدون</th>
                  <th className="p-4 font-bold text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCoupons.map((coupon) => {
                  const now = new Date();
                  const isExpired = new Date(coupon.validUntil) < now;
                  const isNotStarted = new Date(coupon.validFrom) > now;
                  const usagePercentage = coupon.usageLimit
                    ? Math.min(100, Math.round((coupon.usedCount / coupon.usageLimit) * 100))
                    : 0;

                  return (
                    <tr key={coupon.id} className="hover:bg-white/5 transition-colors">
                      {/* Code with Copy */}
                      <td className="p-4 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-black bg-white/10 px-3 py-1 rounded-xl border border-white/15 text-[#2ECC8F] tracking-wider dir-ltr">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => handleCopy(coupon.code, coupon.id)}
                            title="نسخ الكود"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                          >
                            {copiedId === coupon.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        {coupon.description && (
                          <span className="text-[11px] text-gray-400 block mt-1 line-clamp-1">
                            {coupon.description}
                          </span>
                        )}
                      </td>

                      {/* Discount % */}
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                          <span>خصم</span>
                          <span className="text-sm">{coupon.discountPercent}%</span>
                        </span>
                      </td>

                      {/* Validity Dates */}
                      <td className="p-4 text-gray-300">
                        <div className="space-y-1 text-[11px]">
                          <div className="flex items-center gap-1.5 text-gray-400">
                            <Clock className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>من: {new Date(coupon.validFrom).toLocaleDateString('ar-EG')}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-amber-400 shrink-0" />
                            <span className={isExpired ? 'text-red-400 font-bold' : 'text-gray-300'}>
                              إلى: {new Date(coupon.validUntil).toLocaleDateString('ar-EG')}
                            </span>
                          </div>

                          {isExpired ? (
                            <span className="inline-block text-[10px] font-black text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                              منتهي الصلاحية
                            </span>
                          ) : isNotStarted ? (
                            <span className="inline-block text-[10px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              قيد الانتظار
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* Usage Limit & Progress */}
                      <td className="p-4">
                        <div className="w-36 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="text-white">{coupon.usedCount} مستخدم</span>
                            <span className="text-gray-400">من أصل {coupon.usageLimit || '∞'}</span>
                          </div>
                          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                usagePercentage >= 100
                                  ? 'bg-red-500'
                                  : usagePercentage >= 75
                                  ? 'bg-amber-400'
                                  : 'bg-[#0F9D58]'
                              }`}
                              style={{ width: `${usagePercentage}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleStatus(coupon)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
                            coupon.isActive
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                          }`}
                        >
                          {coupon.isActive ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>مفعّل</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              <span>معطل</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* View Users who used coupon */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleOpenUsers(coupon)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-all cursor-pointer"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>عرض ({coupon.usedCount})</span>
                        </button>
                      </td>

                      {/* Edit / Delete Actions */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(coupon)}
                            title="تعديل الكوبون"
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4 text-amber-400" />
                          </button>

                          <button
                            onClick={() => handleDelete(coupon.id, coupon.code)}
                            title="حذف الكوبون"
                            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE COUPON MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-[#0F172A] border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#2ECC8F]" />
                <span>إضافة كود خصم جديد</span>
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Code & Discount % */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    كود الكوبون (بالإنجليزية) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="مثال: GROWIX20"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-mono font-black text-white placeholder:text-gray-500 focus:outline-none focus:border-[#0F9D58] uppercase dir-ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    نسبة الخصم (%) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      required
                      value={formData.discountPercent}
                      onChange={(e) => setFormData({ ...formData, discountPercent: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-black text-white focus:outline-none focus:border-[#0F9D58] dir-ltr text-right pl-8"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                  </div>
                </div>
              </div>

              {/* Start Date & Expiry Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    تاريخ بدء الصلاحية *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-[#0F9D58]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    تاريخ انتهاء الصلاحية *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-[#0F9D58]"
                  />
                </div>
              </div>

              {/* Usage Limit */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">
                  الحد الأقصى لعدد المستخدمين المستفيدين
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                  placeholder="100"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white focus:outline-none focus:border-[#0F9D58] dir-ltr text-right"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">
                  وصف أو ملاحظات الكوبون
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="مثال: خصم حملة رمضان الترويجية"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-[#0F9D58]"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="create-active"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded bg-white/10 text-[#0F9D58] focus:ring-[#0F9D58] cursor-pointer"
                />
                <label htmlFor="create-active" className="text-xs font-bold text-gray-300 cursor-pointer">
                  تفعيل الكوبون فوراً وإتاحته للعملاء
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 transition-colors cursor-pointer"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-2.5 rounded-xl bg-[#0F9D58] hover:bg-[#0D8B4E] text-white text-xs font-extrabold shadow-lg shadow-[#0F9D58]/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {formLoading ? 'جاري الحفظ...' : 'حفظ الكوبون'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT COUPON MODAL */}
      {editingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-[#0F172A] border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <span>تعديل الكوبون ({editingCoupon.code})</span>
              </h3>
              <button
                onClick={() => setEditingCoupon(null)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    كود الكوبون *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-mono font-black text-white uppercase dir-ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    نسبة الخصم (%) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={formData.discountPercent}
                    onChange={(e) => setFormData({ ...formData, discountPercent: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-black text-white dir-ltr text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    تاريخ بدء الصلاحية *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    تاريخ انتهاء الصلاحية *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">
                  الحد الأقصى لعدد المستخدمين
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white dir-ltr text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">
                  وصف الكوبون
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="edit-active"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded bg-white/10 text-[#0F9D58] cursor-pointer"
                />
                <label htmlFor="edit-active" className="text-xs font-bold text-gray-300 cursor-pointer">
                  الكوبون مفعّل ومتاح للاستخدام
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingCoupon(null)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 transition-colors cursor-pointer"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-[#0B1220] text-xs font-black shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                >
                  {formLoading ? 'جاري التعديل...' : 'تحديث الكوبون'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW USERS WHO USED COUPON MODAL */}
      {viewingUsersCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-3xl bg-[#0F172A] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2.5">
                  <UserCheck className="w-5 h-5 text-cyan-400" />
                  <span>المستخدمون المستفيدون من الكوبون ({viewingUsersCoupon.code})</span>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  نسبة الخصم: {viewingUsersCoupon.discountPercent}% | إجمالي مرات الاستخدام: {couponUsers.length}
                </p>
              </div>

              <button
                onClick={() => setViewingUsersCoupon(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {loadingUsers ? (
                <div className="py-12 text-center text-xs text-gray-400 font-bold space-y-2">
                  <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p>جاري جلب سجل المستخدمين...</p>
                </div>
              ) : couponUsers.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400 space-y-2">
                  <Users className="w-8 h-8 mx-auto text-gray-600" />
                  <p className="font-bold text-gray-300">لم يقم أي مستخدم باستعمال هذا الكوبون بعد.</p>
                  <p className="text-[11px] text-gray-500">سيظهر هنا اسم العميل وإيميله ورقم هاتفه وتاريخ الطلب فور تطبيق الكوبون.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-white/5 text-gray-400 border-b border-white/10">
                      <tr>
                        <th className="p-3 font-bold">العميل</th>
                        <th className="p-3 font-bold">بيانات التواصل</th>
                        <th className="p-3 font-bold">قيمة الخصم المطبقة</th>
                        <th className="p-3 font-bold">حالة الطلب</th>
                        <th className="p-3 font-bold">تاريخ الاستخدام</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {couponUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-3 font-bold text-white">
                            <span className="block">{u.userName}</span>
                          </td>

                          <td className="p-3 text-gray-300">
                            <div className="space-y-0.5">
                              <span className="flex items-center gap-1 text-[11px] text-gray-300 font-mono">
                                <Mail className="w-3 h-3 text-cyan-400 shrink-0" />
                                {u.userEmail}
                              </span>
                              {u.userPhone && (
                                <span className="flex items-center gap-1 text-[11px] text-gray-400 font-mono">
                                  <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                                  {u.userPhone}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="p-3 font-bold text-emerald-400">
                            <span className="bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              {u.discountApplied}
                            </span>
                          </td>

                          <td className="p-3">
                            {u.orderStatus === 'approved' ? (
                              <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                مفعّل
                              </span>
                            ) : u.orderStatus === 'rejected' ? (
                              <span className="text-[10px] font-black text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                                مرفوض
                              </span>
                            ) : (
                              <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                قيد الانتظار
                              </span>
                            )}
                          </td>

                          <td className="p-3 text-gray-400 text-[11px]">
                            {new Date(u.usedAt).toLocaleDateString('ar-EG')}
                            <span className="block text-[10px] text-gray-500">
                              {new Date(u.usedAt).toLocaleTimeString('ar-EG')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end shrink-0">
              <button
                onClick={() => setViewingUsersCoupon(null)}
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
