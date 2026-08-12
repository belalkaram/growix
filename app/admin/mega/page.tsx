'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  getAllMegaLinksAction,
  createMegaLinkAction,
  updateMegaLinkAction,
  deleteMegaLinkAction,
} from '@/lib/actions/mega';
import {
  FolderOpen,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  HardDrive,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react';

const PACKAGE_OPTIONS = [
  { value: 'all', label: 'جميع الباقات (للكل)' },
  { value: 'bundle-vip', label: 'باقة VIP (الشاملة)' },
  { value: 'bundle-premium', label: 'باقة Premium' },
  { value: 'single-tool', label: 'باقة أداة واحدة' },
];

export default function AdminMegaPage() {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    packageId: 'bundle-vip',
    title: '',
    description: '',
    megaUrl: '',
    sizeLabel: '',
    contentCount: '',
    sortOrder: 0,
  });

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllMegaLinksAction();
      setLinks(data);
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'حدث خطأ في جلب البيانات' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.megaUrl.trim()) {
      setMessage({ type: 'error', text: 'العنوان ورابط MEGA مطلوبان' });
      return;
    }
    setSubmitting(true);
    const res = await createMegaLinkAction(form);
    if (res.success) {
      setMessage({ type: 'success', text: 'تم إضافة رابط MEGA بنجاح ✅' });
      setShowForm(false);
      setForm({ packageId: 'bundle-vip', title: '', description: '', megaUrl: '', sizeLabel: '', contentCount: '', sortOrder: 0 });
      await fetchLinks();
    } else {
      setMessage({ type: 'error', text: res.error || 'حدث خطأ' });
    }
    setSubmitting(false);
  };

  const handleToggleActive = async (link: any) => {
    const res = await updateMegaLinkAction(link.id, { isActive: !link.isActive });
    if (res.success) {
      setLinks((prev) => prev.map((l) => (l.id === link.id ? { ...l, isActive: !l.isActive } : l)));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الرابط؟')) return;
    const res = await deleteMegaLinkAction(id);
    if (res.success) {
      setMessage({ type: 'success', text: 'تم حذف الرابط بنجاح' });
      setLinks((prev) => prev.filter((l) => l.id !== id));
    } else {
      setMessage({ type: 'error', text: res.error || 'حدث خطأ' });
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-8" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FolderOpen className="w-5 h-5" />
            </div>
            روابط كورسات MEGA
          </h1>
          <p className="text-xs text-gray-400 mt-1">أضف روابط مجلدات MEGA لإتاحتها لأصحاب الباقات المشتركين.</p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة رابط جديد</span>
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
          message.type === 'success'
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
            : 'bg-red-500/10 text-red-400 border border-red-500/30'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4"
        >
          <h3 className="text-sm font-black text-white">إضافة رابط MEGA جديد</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5">الباقة المستهدفة *</label>
              <select
                value={form.packageId}
                onChange={(e) => setForm({ ...form, packageId: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-blue-400"
              >
                {PACKAGE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-[#0B1220]">{o.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5">عنوان المجلد *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="كورس التسويق الشامل على فيسبوك"
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-blue-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-400 mb-1.5">رابط MEGA *</label>
              <input
                type="url"
                required
                value={form.megaUrl}
                onChange={(e) => setForm({ ...form, megaUrl: e.target.value })}
                placeholder="https://mega.nz/folder/..."
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-blue-400 dir-ltr"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5">حجم المحتوى</label>
              <input
                type="text"
                value={form.sizeLabel}
                onChange={(e) => setForm({ ...form, sizeLabel: e.target.value })}
                placeholder="1 TB"
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5">عدد المحتويات</label>
              <input
                type="text"
                value={form.contentCount}
                onChange={(e) => setForm({ ...form, contentCount: e.target.value })}
                placeholder="200+ فيديو ودرس"
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-blue-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-400 mb-1.5">الوصف (اختياري)</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="محتوى تعليمي شامل يغطي التسويق الرقمي من الصفر..."
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-blue-400 resize-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{submitting ? 'جاري الإضافة...' : 'إضافة الرابط'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-extrabold cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      {/* Links List */}
      {loading ? (
        <div className="flex justify-center py-12 text-gray-400">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </div>
      ) : links.length === 0 ? (
        <div className="text-center py-16 text-gray-400 border border-white/10 rounded-2xl">
          <FolderOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-bold">لا توجد روابط MEGA مضافة بعد.</p>
          <p className="text-xs mt-1 text-gray-500">اضغط "إضافة رابط جديد" لإضافة أول رابط.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((link) => (
            <div
              key={link.id}
              className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                link.isActive
                  ? 'bg-white/5 border-white/10 hover:border-blue-500/30'
                  : 'bg-white/2 border-white/5 opacity-60'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-white">{link.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                      {PACKAGE_OPTIONS.find((o) => o.value === link.packageId)?.label || link.packageId}
                    </span>
                    {link.sizeLabel && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600/20 text-blue-300 flex items-center gap-1">
                        <HardDrive className="w-2.5 h-2.5" />
                        {link.sizeLabel}
                      </span>
                    )}
                  </div>
                  {link.description && (
                    <p className="text-xs text-gray-400">{link.description}</p>
                  )}
                  <p className="text-[11px] text-gray-500 font-mono truncate max-w-xs dir-ltr" dir="ltr">
                    {link.megaUrl}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={link.megaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/10 hover:bg-blue-600/20 text-gray-400 hover:text-blue-400 transition-colors"
                  title="فتح في MEGA"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  onClick={() => handleToggleActive(link)}
                  className={`p-2 rounded-lg transition-colors ${
                    link.isActive
                      ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      : 'bg-white/10 text-gray-500 hover:bg-white/20'
                  }`}
                  title={link.isActive ? 'إخفاء الرابط' : 'إظهار الرابط'}
                >
                  {link.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => handleDelete(link.id)}
                  className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  title="حذف الرابط"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
