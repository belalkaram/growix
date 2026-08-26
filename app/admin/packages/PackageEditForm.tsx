'use client';

import React, { useState } from 'react';
import { updatePackageAction } from '@/lib/actions/packages';
import { Save, AlertCircle, CheckCircle2, Plus, Trash2 } from 'lucide-react';

interface FeatureItem {
  text: string;
  included: boolean;
  highlight?: boolean;
}

export const PackageEditForm: React.FC<{ initialData: any }> = ({ initialData }) => {
  const [name, setName] = useState(initialData.name);
  const [badge, setBadge] = useState(initialData.badge || '');
  const [discountedPrice, setDiscountedPrice] = useState(initialData.discountedPrice);
  const [originalPrice, setOriginalPrice] = useState(initialData.originalPrice);
  const [period, setPeriod] = useState(initialData.period);
  const [description, setDescription] = useState(initialData.description);
  const [ctaText, setCtaText] = useState(initialData.ctaText || 'اشترك الآن');
  const [features, setFeatures] = useState<FeatureItem[]>((initialData.features as FeatureItem[]) || []);
  const [isPopular, setIsPopular] = useState(initialData.isPopular);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAutoGenerateCta = () => {
    if (initialData.id === 'single-tool') {
      setCtaText(`اختر برنامجك واشترك بـ ${discountedPrice} ج`);
    } else if (initialData.id === 'bundle-vip') {
      setCtaText(`احصل على الباقة VIP بـ ${discountedPrice} ج`);
    } else if (initialData.id === 'bundle-premium') {
      setCtaText(`احصل على باقة Premium بـ ${discountedPrice} ج`);
    } else {
      setCtaText(`احصل على ${name} بـ ${discountedPrice} ج`);
    }
  };

  const handleFeatureChange = (index: number, field: keyof FeatureItem, value: any) => {
    const updated = [...features];
    updated[index] = { ...updated[index], [field]: value };
    setFeatures(updated);
  };

  const addFeature = () => {
    setFeatures([...features, { text: '', included: true, highlight: false }]);
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await updatePackageAction({
      id: initialData.id,
      name,
      badge,
      isPopular,
      originalPrice,
      discountedPrice,
      currency: initialData.currency || 'جنية',
      period,
      description,
      features,
      ctaText: ctaText.trim() || 'اشترك الآن',
    });

    setLoading(false);

    if (res.success) {
      setMessage({ type: 'success', text: 'تم حفظ التعديلات بنجاح وتحديث الموقع!' });
    } else {
      setMessage({ type: 'error', text: res.error || 'حدث خطأ أثناء الحفظ' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-[#0F172A] border border-white/10 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <span className="text-xs font-mono font-bold text-[#2ECC8F]">{initialData.id}</span>
          <h3 className="text-base font-black text-white">{initialData.name}</h3>
        </div>
        <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
          <input
            type="checkbox"
            checked={isPopular}
            onChange={(e) => setIsPopular(e.target.checked)}
            className="rounded border-gray-600 bg-white/5 text-[#0F9D58] focus:ring-0"
          />
          <span>علامة الباقة الأكثر طلباً</span>
        </label>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-300 mb-1">اسم الباقة</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-[#2ECC8F]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-300 mb-1">الشارة (Badge)</label>
          <input
            type="text"
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            placeholder="مثال: الأكثر طلباً"
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-[#2ECC8F]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-300 mb-1">السعر الحالي (بعد الخصم)</label>
          <input
            type="text"
            value={discountedPrice}
            onChange={(e) => setDiscountedPrice(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-[#2ECC8F] focus:outline-none focus:border-[#2ECC8F]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-300 mb-1">السعر الأصلي (قبل الخصم)</label>
          <input
            type="text"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-gray-400 focus:outline-none focus:border-[#2ECC8F]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-300 mb-1">وصف فترة التفعيل</label>
        <input
          type="text"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-[#2ECC8F]"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-300 mb-1">الوصف العام</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-[#2ECC8F]"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-bold text-gray-300">نص زر الشراء / الإجراء (CTA Button Text)</label>
          <button
            type="button"
            onClick={handleAutoGenerateCta}
            className="text-[11px] font-bold text-[#2ECC8F] hover:underline"
            title="تحديث النص تلقائياً بحسب السعر واسم الباقة"
          >
            🔄 ضبط تلقائي مع السعر
          </button>
        </div>
        <input
          type="text"
          value={ctaText}
          onChange={(e) => setCtaText(e.target.value)}
          placeholder="مثال: احصل على الباقة VIP بـ 500 ج"
          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-[#2ECC8F]"
        />
        <p className="text-[11px] text-gray-400 mt-1">هذا هو النص الذي سيظهر داخل أزرار الشراء الرئيسية في صفحات الأسعار والمتجر.</p>
      </div>

      {/* Dynamic Features List */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-gray-300">قائمة المميزات</label>
          <button
            type="button"
            onClick={addFeature}
            className="text-[11px] font-bold text-[#2ECC8F] hover:underline flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>إضافة ميزة</span>
          </button>
        </div>

        {features.map((feat, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={feat.text}
              onChange={(e) => handleFeatureChange(i, 'text', e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-[#2ECC8F]"
            />
            <label className="text-[11px] text-gray-400 flex items-center gap-1">
              <input
                type="checkbox"
                checked={feat.included}
                onChange={(e) => handleFeatureChange(i, 'included', e.target.checked)}
              />
              <span>متاحة</span>
            </label>
            <button
              type="button"
              onClick={() => removeFeature(i)}
              className="text-red-400 hover:text-red-300 p-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-[#0F9D58] hover:bg-[#0F9D58]/80 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
      >
        <Save className="w-4 h-4" />
        <span>{loading ? 'جاري الحفظ...' : 'حفظ وتحديث الباقة'}</span>
      </button>
    </form>
  );
};
