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
  Edit2,
  X,
} from 'lucide-react';

const PACKAGE_OPTIONS = [
  { value: 'all', label: 'جميع الباقات (للكل)' },
  { value: 'bundle-vip', label: 'باقة VIP (الشاملة)' },
  { value: 'courses-500gb', label: 'باقة كورسات الـ 500 جيجا (+500 GB MEGA)' },
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

  // Edit state
  const [editingLink, setEditingLink] = useState<any | null>(null);
  const [editLoading, setEditLoading] = useState(false);

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
      setMessage({ type: 'success', text: 'تم إضافة رابط MEGA بنجاح' });
      setShowForm(false);
      setForm({ packageId: 'bundle-vip', title: '', description: '', megaUrl: '', sizeLabel: '', contentCount: '', sortOrder: 0 });
      await fetchLinks();
    } else {
      setMessage({ type: 'error', text: res.error || 'حدث خطأ' });
    }
    setSubmitting(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink) return;

    setEditLoading(true);
    const res = await updateMegaLinkAction(editingLink.id, {
      packageId: editingLink.packageId,
      title: editingLink.title,
      description: editingLink.description || null,
      megaUrl: editingLink.megaUrl,
      sizeLabel: editingLink.sizeLabel || null,
      contentCount: editingLink.contentCount || null,
      sortOrder: Number(editingLink.sortOrder) || 0,
      isActive: editingLink.isActive,
    });
    setEditLoading(false);

    if (res.success) {
      setEditingLink(null);
      await fetchLinks();
    } else {
      alert(res.error || 'حدث خطأ أثناء تعديل الرابط');
    }
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
    <div className="space-y-6 dir-rtl text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-[#2ECC8F]" />
            <span>إدارة روابط كورسات MEGA (Full CRUD)</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            إضافة وتعديل وحذف روابط مجلدات MEGA المفتوحة للمشتركين بعد تفعيل الطلب
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchLinks}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/10 cursor-pointer"
            title="تحديث"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2.5 rounded-xl bg-[#00FF87] hover:bg-[#00E676] text-[#0A1128] font-black text-xs flex items-center gap-1.5 shadow-lg shadow-[#00FF87]/20 transition-transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة رابط MEGA جديد</span>
          </button>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-2.5 text-xs font-bold ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div className="p-6 rounded-2xl bg-[#0F172A] border border-white/10 space-y-4">
          <h2 className="text-sm font-bold text-white">إضافة مجلد / كورس جديد على MEGA</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  الباقة المخصصة <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.packageId}
                  onChange={(e) => setForm({ ...form, packageId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#2ECC8F]"
                >
                  {PACKAGE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-[#0F172A]">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  عنوان المجلد / الكورس <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: كورس التسويق الإعلاني على فيسبوك 2026"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#2ECC8F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">
                رابط MEGA المباشر <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                required
                placeholder="https://mega.nz/folder/..."
                value={form.megaUrl}
                onChange={(e) => setForm({ ...form, megaUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#2ECC8F] dir-ltr text-right"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">الوصف (اختياري)</label>
              <textarea
                placeholder="شرح محتوى المجلد أو عدد الكورسات والملفات..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#2ECC8F]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">حجم المجلد التقريبي</label>
                <input
                  type="text"
                  placeholder="مثال: 45 GB"
                  value={form.sizeLabel}
                  onChange={(e) => setForm({ ...form, sizeLabel: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#2ECC8F]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">عدد الملفات / الساعات</label>
                <input
                  type="text"
                  placeholder="مثال: 12 كورس / 80 ساعة"
                  value={form.contentCount}
                  onChange={(e) => setForm({ ...form, contentCount: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#2ECC8F]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">ترتيب الظهور</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#2ECC8F]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-[#00FF87] hover:bg-[#00E676] text-[#0A1128] font-black text-xs transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'جاري الإضافة...' : 'حفظ الرابط'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Links List */}
      {loading ? (
        <div className="p-12 text-center text-gray-400 text-xs">جاري التحميل...</div>
      ) : links.length === 0 ? (
        <div className="p-12 text-center text-gray-400 text-xs rounded-2xl bg-white/5 border border-white/10">
          لا توجد روابط MEGA مضافة حتى الآن.
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
                <button
                  onClick={() => setEditingLink({ ...link })}
                  className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors cursor-pointer"
                  title="تعديل بيانات الرابط"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

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
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
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
                  className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                  title="حذف الرابط"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDIT MEGA MODAL */}
      {editingLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-400" />
                <span>تعديل رابط كورس MEGA</span>
              </h3>
              <button
                onClick={() => setEditingLink(null)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">الباقة المخصصة</label>
                <select
                  value={editingLink.packageId}
                  onChange={(e) => setEditingLink({ ...editingLink, packageId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-blue-400"
                >
                  {PACKAGE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">العنوان</label>
                <input
                  type="text"
                  required
                  value={editingLink.title}
                  onChange={(e) => setEditingLink({ ...editingLink, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">رابط MEGA</label>
                <input
                  type="url"
                  required
                  value={editingLink.megaUrl}
                  onChange={(e) => setEditingLink({ ...editingLink, megaUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-blue-400 dir-ltr text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">الوصف</label>
                <textarea
                  value={editingLink.description || ''}
                  onChange={(e) => setEditingLink({ ...editingLink, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">الحجم</label>
                  <input
                    type="text"
                    value={editingLink.sizeLabel || ''}
                    onChange={(e) => setEditingLink({ ...editingLink, sizeLabel: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">الترتيب</label>
                  <input
                    type="number"
                    value={editingLink.sortOrder || 0}
                    onChange={(e) => setEditingLink({ ...editingLink, sortOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-black text-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {editLoading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingLink(null)}
                  className="px-5 py-3 rounded-xl bg-white/10 text-white font-bold text-xs cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
