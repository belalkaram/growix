'use client';

import React, { useState } from 'react';
import { createToolAction } from '@/lib/actions/tools';
import { X, Plus, Wrench, AlertCircle, Save } from 'lucide-react';

interface AddToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToolAdded: () => void;
}

export const AddToolModal: React.FC<AddToolModalProps> = ({ isOpen, onClose, onToolAdded }) => {
  const [id, setId] = useState('');
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'social' | 'messaging' | 'design' | 'ai' | 'data'>('social');
  const [badge, setBadge] = useState('');
  const [iconName, setIconName] = useState('sparkles');
  const [shortDesc, setShortDesc] = useState('');
  const [longDesc, setLongDesc] = useState('');
  const [features, setFeatures] = useState<string[]>(['']);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddFeature = () => setFeatures([...features, '']);
  const handleFeatureChange = (index: number, val: string) => {
    const updated = [...features];
    updated[index] = val;
    setFeatures(updated);
  };
  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const generatedId = id.trim() || slug.trim();
    const generatedSlug = slug.trim() || id.trim();

    if (!generatedId || !name.trim() || !shortDesc.trim()) {
      setError('يرجى ملء الحقول الإلزامية: المعرف، الاسم، والوصف المختصر');
      setLoading(false);
      return;
    }

    const res = await createToolAction({
      id: generatedId,
      slug: generatedSlug,
      name: name.trim(),
      category,
      badge: badge.trim() || undefined,
      iconName: iconName.trim() || 'sparkles',
      shortDesc: shortDesc.trim(),
      longDesc: longDesc.trim() || undefined,
      features: features.filter((f) => f.trim().length > 0),
      isActive: true,
    });

    setLoading(false);

    if (res.success) {
      onToolAdded();
      onClose();
    } else {
      setError(res.error || 'حدث خطأ أثناء إضافة الأداة');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" dir="rtl">
      <div className="w-full max-w-2xl bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0F9D58]/20 text-[#2ECC8F] flex items-center justify-center font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">إضافة أداة تسويقية جديدة</h3>
              <p className="text-xs text-gray-400">إدراج أداة جديدة مع ضبط الاسم، الوصف، والمميزات والـ SEO</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">المعرف (ID - فريد)</label>
              <input
                type="text"
                required
                value={id}
                onChange={(e) => {
                  setId(e.target.value);
                  if (!slug) setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                }}
                placeholder="مثال: tiktok-marketing"
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-[#2ECC8F] dir-ltr text-right"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">الرابط المخصص (Slug)</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="مثال: tiktok-marketing-bot"
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-[#2ECC8F] dir-ltr text-right"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">اسم الأداة بالعربية</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="برنامج تيك توك التلقائي"
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-[#2ECC8F]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">الفئة (Category)</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-[#2ECC8F]"
              >
                <option value="social">سوشيال ميديا (Social)</option>
                <option value="messaging">رسائل ومحادثات (Messaging)</option>
                <option value="design">تصميم ومونتاج (Design)</option>
                <option value="ai">ذكاء اصطناعي (AI)</option>
                <option value="data">سحب داتا (Data)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">الأيقونة (Lucide Icon)</label>
              <input
                type="text"
                value={iconName}
                onChange={(e) => setIconName(e.target.value)}
                placeholder="sparkles / video / send"
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-[#2ECC8F] dir-ltr text-right"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">الشارة الترويجية (Badge - اختياري)</label>
            <input
              type="text"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="مثال: إصدار Pro 2026 الحصري"
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-[#2ECC8F]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">الوصف المختصر (Short Description)</label>
            <textarea
              required
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              placeholder="وصف مختصر ومباشر لوظيفة الأداة يظهر في كروت الموقع..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-[#2ECC8F]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">الوصف التفصيلي (اختياري)</label>
            <textarea
              value={longDesc}
              onChange={(e) => setLongDesc(e.target.value)}
              placeholder="شرح كامل لصفحة الأداة المنفردة..."
              rows={3}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-[#2ECC8F]"
            />
          </div>

          {/* Features list */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-300">
                مميزات واستخدامات الأداة (Features)
              </label>
              <button
                type="button"
                onClick={handleAddFeature}
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
                  value={feat}
                  onChange={(e) => handleFeatureChange(i, e.target.value)}
                  placeholder={`ميزة ${i + 1}`}
                  className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-[#2ECC8F]"
                />
                {features.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(i)}
                    className="text-red-400 hover:text-red-300 p-1.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-3 border-t border-white/10">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3.5 rounded-xl bg-[#00FF87] hover:bg-[#00E676] text-[#0A1128] font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00FF87]/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? <span>جاري الحفظ...</span> : <span>إضافة الأداة الآن</span>}
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
