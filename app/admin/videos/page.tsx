'use client';

import React, { useState, useEffect } from 'react';
import { SITE_CONFIG } from '@/config/site';
import { 
  getAllVideosAdminAction, 
  addVideoAction, 
  deleteVideoAction, 
  toggleVideoActiveAction 
} from '@/lib/actions/videos';
import { Video, Plus, Trash2, ExternalLink, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    toolId: '', // empty = عام / كورس
    videoUrl: '',
    description: '',
    sortOrder: 0,
  });

  const loadVideos = async () => {
    setLoading(true);
    try {
      const data = await getAllVideosAdminAction();
      setVideos(data || []);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تحميل الفيديوهات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.videoUrl) {
      setError('العنوان ورابط الفيديو مطلوبان');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const res = await addVideoAction({
      title: formData.title,
      toolId: formData.toolId || undefined,
      videoUrl: formData.videoUrl,
      description: formData.description,
      sortOrder: Number(formData.sortOrder) || 0,
    });

    setSubmitting(false);

    if (res.success) {
      setSuccess('تمت إضافة فيديو الشرح بنجاح!');
      setFormData({
        title: '',
        toolId: '',
        videoUrl: '',
        description: '',
        sortOrder: 0,
      });
      loadVideos();
    } else {
      setError(res.error || 'حدث خطأ أثناء الإضافة');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت تأكد من رغبتك في حذف هذا الفيديو؟')) return;
    const res = await deleteVideoAction(id);
    if (res.success) {
      loadVideos();
    } else {
      alert(res.error || 'حدث خطأ في الحذف');
    }
  };

  const handleToggleActive = async (id: number, currentActive: boolean) => {
    const res = await toggleVideoActiveAction(id, !currentActive);
    if (res.success) {
      loadVideos();
    } else {
      alert(res.error || 'حدث خطأ في التغيير');
    }
  };

  return (
    <div className="space-y-8 dir-rtl" dir="rtl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
          <Video className="w-8 h-8 text-[#2ECC8F]" />
          <span>إدارة فيديوهات الشرح والتدريب</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          أضف ودعّم طلبات المشتركين بفيديوهات شرح للأدوات والكورس. تظهر هذه الفيديوهات تلقائياً في صفحة "طلباتي" للمشتركين المفعّلين.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl text-xs font-bold">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl text-xs font-bold">
          {success}
        </div>
      )}

      {/* Add New Video Form */}
      <div className="bg-[#1E293B] border border-white/10 rounded-3xl p-6 shadow-xl space-y-6">
        <h2 className="text-base font-extrabold text-white flex items-center gap-2">
          <Plus className="w-5 h-5 text-[#2ECC8F]" />
          <span>إضافة فيديو شرح جديد</span>
        </h2>

        <form onSubmit={handleAddVideo} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1 sm:col-span-2">
            <label className="text-gray-300 font-bold block">عنوان الفيديو *</label>
            <input
              type="text"
              required
              placeholder="مثال: شرح طريقة تشغيل واستخراج الداتا ببرنامج واتساب سندر"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-white focus:border-[#2ECC8F] outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-gray-300 font-bold block">الأداة / القسم التابع له</label>
            <select
              value={formData.toolId}
              onChange={(e) => setFormData({ ...formData, toolId: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-white focus:border-[#2ECC8F] outline-none"
            >
              <option value="">🎓 عام / فيديو شرح الكورس الأساسي</option>
              {SITE_CONFIG.tools.map((t) => (
                <option key={t.id} value={t.id}>
                  🛠️ {t.name} ({t.id})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-gray-300 font-bold block">ترتيب العرض</label>
            <input
              type="number"
              value={formData.sortOrder}
              onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-white focus:border-[#2ECC8F] outline-none"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-gray-300 font-bold block">رابط الفيديو (YouTube / Drive / Direct Link) *</label>
            <input
              type="url"
              required
              placeholder="https://www.youtube.com/watch?v=... أو رابط مباشر"
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-white focus:border-[#2ECC8F] outline-none dir-ltr text-left"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-gray-300 font-bold block">وصف مختصر أو تعليمات إضافية (اختياري)</label>
            <textarea
              rows={2}
              placeholder="اكتب ملاحظات أو خطوات هامة قبل مشاهدة الفيديو..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-white focus:border-[#2ECC8F] outline-none"
            />
          </div>

          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-xl bg-gradient-to-l from-[#0F9D58] to-[#2ECC8F] text-white font-extrabold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-[#0F9D58]/20"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>حفظ إضافة الفيديو</span>
            </button>
          </div>
        </form>
      </div>

      {/* Videos List Table */}
      <div className="bg-[#1E293B] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-base font-extrabold text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#2ECC8F]" />
            <span>قائمة فيديوهات الشرح المضافة ({videos.length})</span>
          </span>
        </h2>

        {loading ? (
          <div className="p-8 text-center text-gray-400 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#2ECC8F]" />
            <span>جاري تحميل قائمة الفيديوهات...</span>
          </div>
        ) : videos.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-xs border border-dashed border-white/10 rounded-2xl">
            لم يتم إضافة أي فيديوهات شرح بعد. استخدم النموذج أعلاه لإضافة فيديو.
          </div>
        ) : (
          <div className="space-y-3">
            {videos.map((vid) => {
              const matchedTool = SITE_CONFIG.tools.find((t) => t.id === vid.toolId);

              return (
                <div
                  key={vid.id}
                  className="p-4 bg-[#0F172A] border border-white/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs hover:border-[#2ECC8F]/40 transition-colors"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-white text-sm">{vid.title}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#2ECC8F]/10 text-[#2ECC8F] border border-[#2ECC8F]/30">
                        {matchedTool ? matchedTool.name : '🎓 شرح عام / كورس'}
                      </span>
                      {!vid.isActive && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/30">
                          مخفي
                        </span>
                      )}
                    </div>

                    {vid.description && (
                      <p className="text-gray-400 text-xs line-clamp-1">{vid.description}</p>
                    )}

                    <a
                      href={vid.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2ECC8F] hover:underline inline-flex items-center gap-1 font-mono text-[11px] dir-ltr text-left"
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <span className="truncate max-w-sm">{vid.videoUrl}</span>
                    </a>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleActive(vid.id, vid.isActive)}
                      title={vid.isActive ? 'إخفاء الفيديو' : 'إظهار الفيديو'}
                      className={`p-2 rounded-xl border transition-colors ${
                        vid.isActive
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-gray-500/10 border-gray-500/30 text-gray-400 hover:bg-gray-500/20'
                      }`}
                    >
                      {vid.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleDelete(vid.id)}
                      title="حذف الفيديو"
                      className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
