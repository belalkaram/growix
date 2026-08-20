'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateToolAction, deleteToolAction } from '@/lib/actions/tools';
import { Save, CheckCircle2, AlertCircle, Edit2, ChevronDown, ChevronUp, Plus, Trash2, X } from 'lucide-react';

export const ToolEditRow: React.FC<{ tool: any }> = ({ tool }) => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [name, setName] = useState(tool.name);
  const [badge, setBadge] = useState(tool.badge || '');
  const [shortDesc, setShortDesc] = useState(tool.shortDesc);
  const [longDesc, setLongDesc] = useState(tool.longDesc || '');
  const [category, setCategory] = useState(tool.category);
  const [iconName, setIconName] = useState(tool.iconName);
  const [features, setFeatures] = useState<string[]>((tool.features as string[]) || []);
  const [isActive, setIsActive] = useState(tool.isActive);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFeatureChange = (index: number, value: string) => {
    const updated = [...features];
    updated[index] = value;
    setFeatures(updated);
  };

  const addFeature = () => {
    setFeatures([...features, '']);
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await updateToolAction({
      id: tool.id,
      slug: tool.slug,
      number: tool.number,
      name,
      category,
      badge,
      shortDesc,
      longDesc,
      features: features.filter((f) => f.trim().length > 0),
      iconName,
      isActive,
    });

    setLoading(false);

    if (res.success) {
      setMessage({ type: 'success', text: 'تم حفظ وتحديث محتوى الأداة ومميزاتها بنجاح في الموقع!' });
      router.refresh();
    } else {
      setMessage({ type: 'error', text: res.error || 'حدث خطأ أثناء الحفظ' });
    }
  };

  const handleDelete = async () => {
    if (!confirm(`هل أنت متأكد من حذف أداة "${tool.name}" نهائياً من الموقع وقاعدة البيانات؟`)) {
      return;
    }
    setDeleting(true);
    const res = await deleteToolAction(tool.id);
    setDeleting(false);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error || 'حدث خطأ أثناء الحذف');
    }
  };

  return (
    <div className={`p-4 sm:p-5 space-y-4 transition-all ${
      isExpanded ? 'bg-emerald-950/20 border-l-4 border-l-[#2ECC8F]' : ''
    }`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-gray-400 bg-white/5 px-2.5 py-1 rounded-lg">
            #{tool.number}
          </span>
          <div>
            <h3 className="text-sm font-black text-white">{name}</h3>
            <span className="text-[11px] text-gray-400 font-mono">{tool.slug}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
            isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {isActive ? 'نشطة' : 'غير نشطة'}
          </span>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`py-2 px-3.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
              isExpanded
                ? 'bg-[#0F9D58] text-white ring-2 ring-[#2ECC8F]/50'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {isExpanded ? (
              <>
                <X className="w-3.5 h-3.5" />
                <span>إغلاق التعديل</span>
              </>
            ) : (
              <>
                <Edit2 className="w-3.5 h-3.5 text-[#2ECC8F]" />
                <span>تعديل المحتوى</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors disabled:opacity-50 cursor-pointer"
            title="حذف الأداة نهائياً"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <form onSubmit={handleSubmit} className="pt-4 border-t border-white/5 space-y-4">
          {message && (
            <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
              message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">اسم الأداة</label>
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
                placeholder="مثال: أكثر الأداة طلباً"
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-[#2ECC8F]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">اسم الأيقونة (Lucide Icon)</label>
              <input
                type="text"
                value={iconName}
                onChange={(e) => setIconName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-[#2ECC8F]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">الوصف المختصر (Short Description)</label>
            <textarea
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-[#2ECC8F]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">الوصف التفصيلي الشامل (Long Description)</label>
            <textarea
              value={longDesc}
              onChange={(e) => setLongDesc(e.target.value)}
              placeholder="اكتب الشرح التفصيلي لعمل هذه الأداة وطريقة استخدامها في الحملات..."
              rows={3}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-[#2ECC8F]"
            />
          </div>

          {/* Dynamic Features List */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-300">
                مميزات واستخدامات الأداة التفصيلية (Features List)
              </label>
              <button
                type="button"
                onClick={addFeature}
                className="text-[11px] font-bold text-[#2ECC8F] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>إضافة ميزة جديدة</span>
              </button>
            </div>

            {features.map((feat, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#0F9D58]/20 text-[#2ECC8F] flex items-center justify-center shrink-0 text-[10px] font-black">
                  ✓
                </span>
                <input
                  type="text"
                  value={feat}
                  onChange={(e) => handleFeatureChange(i, e.target.value)}
                  placeholder="مثال: نشر وجدولة بوستات وفيديوهات على مئات المجموعات..."
                  className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-[#2ECC8F]"
                />
                <button
                  type="button"
                  onClick={() => removeFeature(i)}
                  className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-gray-600 bg-white/5 text-[#0F9D58] focus:ring-0"
              />
              <span>تفعيل الأداة ورؤيتها في الموقع</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-6 rounded-xl bg-[#0F9D58] hover:bg-[#0F9D58]/80 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{loading ? 'جاري الحفظ...' : 'حفظ وتحديث الأداة'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
