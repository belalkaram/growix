'use client';

import React, { useState, useEffect } from 'react';
import { SITE_CONFIG } from '@/config/site';
import { 
  getAllVideosAdminAction, 
  addVideoAction, 
  updateVideoAction,
  deleteVideoAction, 
  toggleVideoActiveAction 
} from '@/lib/actions/videos';
import { Video, Plus, Trash2, ExternalLink, Eye, EyeOff, Loader2, Sparkles, Edit2, X, Save } from 'lucide-react';

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

  // Edit Video State
  const [editingVideo, setEditingVideo] = useState<any | null>(null);
  const [editLoading, setEditLoading] = useState(false);

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

  const handleUpdateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;

    setEditLoading(true);
    const res = await updateVideoAction({
      id: editingVideo.id,
      title: editingVideo.title,
      toolId: editingVideo.toolId || null,
      videoUrl: editingVideo.videoUrl,
      description: editingVideo.description || null,
      sortOrder: Number(editingVideo.sortOrder) || 0,
      isActive: editingVideo.isActive,
    });
    setEditLoading(false);

    if (res.success) {
      setEditingVideo(null);
      loadVideos();
    } else {
      alert(res.error || 'حدث خطأ أثناء تعديل الفيديو');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا الفيديو نهائياً؟')) return;
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
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
          <Video className="w-7 h-7 text-[#2ECC8F]" />
          <span>إدارة فيديوهات الشرح والتثبيت (Full CRUD)</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          إضافة وتعديل وحذف الفيديوهات التي تظهر للمشتركين في صفحة حسابي وطلباتي لشرح وتثبيت البرامج
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs font-bold">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-bold">
          {success}
        </div>
      )}

      {/* Add Video Form Card */}
      <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
        <h2 className="text-base font-extrabold text-white flex items-center gap-2">
          <Plus className="w-5 h-5 text-[#2ECC8F]" />
          <span>إضافة فيديو شرح جديد</span>
        </h2>

        <form onSubmit={handleAddVideo} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                عنوان الفيديو <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="مثال: شرح أداة سحب داتا فيسبوك Pro بالتفصيل"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-[#2ECC8F]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                البرنامج المرتبط بالفيديو
              </label>
              <select
                value={formData.toolId}
                onChange={(e) => setFormData({ ...formData, toolId: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-[#2ECC8F]"
              >
                <option value="">🎓 فيديو عام / كورس التسويق (يظهر لجميع المشتركين)</option>
                {SITE_CONFIG.tools.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-300 mb-1">
                رابط الفيديو (YouTube / Vimeo / Direct Link) <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                required
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-[#2ECC8F] dir-ltr text-right"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                الترتيب (Sort Order)
              </label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-[#2ECC8F]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">
              وصف مختصر أو تعليمات إضافية (اختياري)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="اكتب ملاحظات حول تشغيل وتفعيل الأداة المذكورة في الفيديو..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-[#2ECC8F]"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="py-3 px-7 rounded-2xl bg-[#00FF87] hover:bg-[#00E676] text-[#0A1128] font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-[#00FF87]/25 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>إضافة الفيديو الآن</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Videos List Table */}
      <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
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
                  className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs hover:border-[#2ECC8F]/40 transition-colors"
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
                      onClick={() => setEditingVideo({ ...vid })}
                      className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-colors cursor-pointer"
                      title="تعديل بيانات الفيديو"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleToggleActive(vid.id, vid.isActive)}
                      title={vid.isActive ? 'إخفاء الفيديو' : 'إظهار الفيديو'}
                      className={`p-2 rounded-xl border transition-colors cursor-pointer ${
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
                      className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
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

      {/* EDIT VIDEO MODAL */}
      {editingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-400" />
                <span>تعديل فيديو الشرح</span>
              </h3>
              <button
                onClick={() => setEditingVideo(null)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateVideo} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">عنوان الفيديو</label>
                <input
                  type="text"
                  required
                  value={editingVideo.title}
                  onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">البرنامج المرتبط</label>
                <select
                  value={editingVideo.toolId || ''}
                  onChange={(e) => setEditingVideo({ ...editingVideo, toolId: e.target.value || null })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-blue-400"
                >
                  <option value="">🎓 فيديو عام / كورس التسويق</option>
                  {SITE_CONFIG.tools.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">رابط الفيديو</label>
                <input
                  type="url"
                  required
                  value={editingVideo.videoUrl}
                  onChange={(e) => setEditingVideo({ ...editingVideo, videoUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-blue-400 dir-ltr text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">الوصف</label>
                <textarea
                  value={editingVideo.description || ''}
                  onChange={(e) => setEditingVideo({ ...editingVideo, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-blue-400"
                />
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
                  onClick={() => setEditingVideo(null)}
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
