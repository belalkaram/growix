'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addPackageFileAction, updatePackageFileAction, deletePackageFileAction, seedInitialDefaultFilesAction, deleteDummyFilesAction } from '@/lib/actions/files';
import { FolderDown, Plus, Trash2, Database, FileArchive, CheckCircle2, AlertCircle, Sparkles, RefreshCw, Eraser, Edit2, X, Crown, Wrench, Globe, GraduationCap } from 'lucide-react';
import { SITE_CONFIG } from '@/config/site';

interface AdminFilesClientProps {
  filesList: any[];
}

export const AdminFilesClient: React.FC<AdminFilesClientProps> = ({ filesList }) => {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit State
  const [editingFile, setEditingFile] = useState<any | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Form states
  const [packageId, setPackageId] = useState('bundle-vip');
  const [toolId, setToolId] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileKey, setFileKey] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [category, setCategory] = useState('tool');

  const handleAddFile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const res = await addPackageFileAction({
      packageId,
      toolId: toolId || undefined,
      fileName,
      fileKey,
      fileSize: fileSize || '50 MB',
      fileType: 'zip',
      category,
    });

    setLoading(false);

    if (res.success) {
      setMsg({ type: 'success', text: 'تمت إضافة الملف بنجاح إلى النظام' });
      setFileName('');
      setFileKey('');
      setFileSize('');
      setShowAddForm(false);
      router.refresh();
    } else {
      setMsg({ type: 'error', text: res.error || 'فشل في حفظ الملف' });
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    if (!confirm('هل أنت تأكد من إزالة هذا الملف من قائمة النظام؟')) return;

    const res = await deletePackageFileAction(fileId);
    if (res.success) {
      setMsg({ type: 'success', text: 'تم حذف الملف بنجاح' });
      router.refresh();
    } else {
      setMsg({ type: 'error', text: res.error || 'فشل الحذف' });
    }
  };

  const handleDeleteDummyFiles = async () => {
    if (!confirm('هل أنت تأكد من إزالة جميع الملفات الوهمية بحجم 45 MB؟')) return;
    setLoading(true);
    setMsg(null);

    const res = await deleteDummyFilesAction();
    setLoading(false);

    if (res.success) {
      setMsg({ type: 'success', text: res.message || 'تم حذف الملفات الوهمية بنجاح' });
      router.refresh();
    } else {
      setMsg({ type: 'error', text: res.error || 'فشل الحذف' });
    }
  };

  const handleSeedDefaults = async () => {
    setLoading(true);
    setMsg(null);

    const res = await seedInitialDefaultFilesAction();
    setLoading(false);

    if (res.success) {
      setMsg({ type: 'success', text: res.message || 'تم ربط ملفات الـ 12 أداة والداتا بنجاح!' });
      router.refresh();
    } else {
      setMsg({ type: 'error', text: res.error || 'فشل الربط الأولي' });
    }
  };

  const handleSyncR2 = async () => {
    setLoading(true);
    setMsg(null);

    const { syncR2BucketObjectsAction } = await import('@/lib/actions/files');
    const res = await syncR2BucketObjectsAction();
    setLoading(false);

    if (res.success) {
      setMsg({ type: 'success', text: res.message || 'تم جلب وتأكيد أحجام الملفات الحقيقية من R2!' });
      router.refresh();
    } else {
      setMsg({ type: 'error', text: res.error || 'فشل الفحص' });
    }
  };

  const hasDummyFiles = filesList.some((f) => f.fileSize === '45 MB' || (f.fileSize && f.fileSize.includes('45 MB')));

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white mb-1 flex items-center gap-2">
            <FolderDown className="w-6 h-6 text-[#2ECC8F]" />
            <span>إدارة ملفات الباقات و Cloudflare R2</span>
          </h1>
          <p className="text-xs text-gray-400">ربط وإدارة ملفات الـ ZIP الخاصة بالكورس والأدوات الـ 12 والداتا المرفوعة على R2</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSyncR2}
            disabled={loading}
            className="py-2.5 px-4 rounded-xl bg-[#0F9D58]/20 text-[#2ECC8F] border border-[#0F9D58]/40 text-xs font-bold flex items-center gap-2 hover:bg-[#0F9D58]/30 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>مزامنة ملفات R2 الحقيقية</span>
          </button>

          {hasDummyFiles && (
            <button
              onClick={handleDeleteDummyFiles}
              disabled={loading}
              className="py-2.5 px-4 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold flex items-center gap-1.5 hover:bg-red-500/30 transition-colors"
            >
              <Eraser className="w-4 h-4" />
              <span>تنظيف الملفات الوهمية (45 MB)</span>
            </button>
          )}

          {filesList.length === 0 && (
            <button
              onClick={handleSeedDefaults}
              disabled={loading}
              className="py-2.5 px-4 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 hover:bg-amber-500/30 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>إنشاء السجلات الأولية</span>
            </button>
          )}

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="py-2.5 px-4 rounded-xl bg-growix-gradient text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-[#0F9D58]/20"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'إغلاق النموذج' : 'إضافة ملف جديد'}</span>
          </button>
        </div>
      </div>

      {/* Alert Notification */}
      {msg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
            msg.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-red-500/10 text-red-400 border-red-500/30'
          }`}
        >
          {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Add New File Form Panel */}
      {showAddForm && (
        <form onSubmit={handleAddFile} className="bg-[#0F172A] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl dir-rtl">
          <h2 className="text-sm font-black text-[#2ECC8F] flex items-center gap-2">
            <Database className="w-4 h-4" />
            <span>بيانات الملف المرفوع على Cloudflare R2</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-gray-300 font-bold mb-1">اسم الملف المعروض للعميل *</label>
              <input
                type="text"
                required
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="مثلاً: برنامج واتساب سندر (Anti-Block) ZIP"
                className="w-full bg-[#0B1220] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#2ECC8F] outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-bold mb-1">مسار الملف في Cloudflare R2 (Key) *</label>
              <input
                type="text"
                required
                value={fileKey}
                onChange={(e) => setFileKey(e.target.value)}
                placeholder="مثلاً: whatsapp-sender.zip"
                className="w-full bg-[#0B1220] border border-white/10 rounded-xl px-3 py-2 text-white font-mono dir-ltr focus:border-[#2ECC8F] outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-bold mb-1">حجم الملف (توضيحي)</label>
              <input
                type="text"
                value={fileSize}
                onChange={(e) => setFileSize(e.target.value)}
                placeholder="مثلاً: 45 MB"
                className="w-full bg-[#0B1220] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#2ECC8F] outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-bold mb-1">الباقة المخصص لها الملف *</label>
              <select
                value={packageId}
                onChange={(e) => setPackageId(e.target.value)}
                className="w-full bg-[#0B1220] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#2ECC8F] outline-none"
              >
                <option value="bundle-vip">الباقة الكاملة (bundle-vip)</option>
                <option value="single-tool">باقة برنامج واحد (single-tool)</option>
                <option value="all">جميع الباقات بدون استثناء (all)</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 font-bold mb-1">الأداة المرتبطة (اختياري)</label>
              <select
                value={toolId}
                onChange={(e) => setToolId(e.target.value)}
                className="w-full bg-[#0B1220] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#2ECC8F] outline-none"
              >
                <option value="">بدون أداة مخصصة (ملف عام/كورس/داتا)</option>
                {SITE_CONFIG.tools.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.number}. {t.name} ({t.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 font-bold mb-1">فئة الملف</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#0B1220] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#2ECC8F] outline-none"
              >
                <option value="tool">أداة تسويقية (tool)</option>
                <option value="course">كورس تعليمي (course)</option>
                <option value="data">داتا تسويقية (data)</option>
                <option value="bonus">هدية خاصة (bonus)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={loading}
              className="py-2 px-6 rounded-xl bg-[#0F9D58] hover:bg-[#0D8B4E] text-white text-xs font-bold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>حفظ الملف في النظام</span>
            </button>
          </div>
        </form>
      )}

      {/* Files Table */}
      <div className="bg-[#0F172A] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        {filesList.length === 0 ? (
          <div className="p-12 text-center text-gray-400 space-y-3">
            <FileArchive className="w-12 h-12 text-gray-500 mx-auto" />
            <p className="text-sm font-bold text-gray-300">لا توجد ملفات مسجلة في قاعدة البيانات حالياً</p>
            <p className="text-xs text-gray-500">اضغط على زر "إنشاء السجلات الأولية تلقائياً" لإضافة ملفات الـ 12 أداة والداتا بنقرة واحدة.</p>
            <button
              onClick={handleSeedDefaults}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-growix-gradient text-white text-xs font-black shadow-md mt-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>توليد سجلات الملفات تلقائياً</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-white/5 text-gray-400 border-b border-white/10">
                <tr>
                  <th className="p-4">اسم الملف والمعرف</th>
                  <th className="p-4">مسار R2 Key</th>
                  <th className="p-4">الباقة المخصصة</th>
                  <th className="p-4">الفئة والحجم</th>
                  <th className="p-4">التحكم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filesList.map((f) => (
                  <tr key={f.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <FileArchive className="w-4 h-4 text-[#2ECC8F] shrink-0" />
                        <div>
                          <span className="block font-black">{f.fileName}</span>
                          {f.toolId && (
                            <span className="text-[10px] text-[#2ECC8F] font-mono block">الأداة: {f.toolId}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-mono dir-ltr text-gray-300 text-xs">
                      <span className="bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 inline-block">
                        {f.fileKey}
                      </span>
                    </td>

                    <td className="p-4 text-gray-300">
                      <span className="font-bold block text-white">
                        {f.packageId === 'bundle-vip' ? (
                          <span className="flex items-center gap-1.5">
                            <Crown className="w-3.5 h-3.5 text-amber-400" />
                            <span>الباقة الكاملة VIP</span>
                          </span>
                        ) : f.packageId === 'single-tool' ? (
                          <span className="flex items-center gap-1.5">
                            <Wrench className="w-3.5 h-3.5 text-blue-400" />
                            <span>باقة برنامج واحد</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-emerald-400" />
                            <span>جميع الباقات</span>
                          </span>
                        )}
                      </span>
                    </td>

                    <td className="p-4 text-gray-300">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1 mb-1">
                        {f.category === 'data' ? (
                          <>
                            <Database className="w-3 h-3" />
                            <span>داتا</span>
                          </>
                        ) : f.category === 'course' ? (
                          <>
                            <GraduationCap className="w-3 h-3" />
                            <span>كورس</span>
                          </>
                        ) : (
                          <>
                            <Wrench className="w-3 h-3" />
                            <span>أداة</span>
                          </>
                        )}
                      </span>
                      {f.fileSize && <span className="block text-[11px] text-gray-400">{f.fileSize}</span>}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingFile({ ...f })}
                          className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
                          title="تعديل بيانات الملف"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>تعديل</span>
                        </button>

                        <button
                          onClick={() => handleDeleteFile(f.id)}
                          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EDIT FILE MODAL */}
      {editingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" dir="rtl">
          <div className="w-full max-w-lg bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-400" />
                <span>تعديل بيانات الملف</span>
              </h3>
              <button
                onClick={() => setEditingFile(null)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setEditLoading(true);
                const res = await updatePackageFileAction({
                  id: editingFile.id,
                  packageId: editingFile.packageId,
                  toolId: editingFile.toolId || null,
                  fileName: editingFile.fileName,
                  fileKey: editingFile.fileKey,
                  fileSize: editingFile.fileSize || null,
                  category: editingFile.category,
                  description: editingFile.description || null,
                  sortOrder: Number(editingFile.sortOrder) || 0,
                  isActive: editingFile.isActive,
                });
                setEditLoading(false);
                if (res.success) {
                  setEditingFile(null);
                  router.refresh();
                } else {
                  alert(res.error || 'حدث خطأ أثناء تعديل الملف');
                }
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-gray-300 font-bold mb-1">اسم الملف</label>
                <input
                  type="text"
                  required
                  value={editingFile.fileName}
                  onChange={(e) => setEditingFile({ ...editingFile, fileName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-bold focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">مسار ملف R2 (Key)</label>
                <input
                  type="text"
                  required
                  value={editingFile.fileKey}
                  onChange={(e) => setEditingFile({ ...editingFile, fileKey: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono dir-ltr text-right focus:outline-none focus:border-blue-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">حجم الملف</label>
                  <input
                    type="text"
                    value={editingFile.fileSize || ''}
                    onChange={(e) => setEditingFile({ ...editingFile, fileSize: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">الفئة</label>
                  <select
                    value={editingFile.category}
                    onChange={(e) => setEditingFile({ ...editingFile, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-white/10 text-white font-bold focus:outline-none focus:border-blue-400"
                  >
                    <option value="tool">برنامج / أداة</option>
                    <option value="data">داتا تسويقية</option>
                    <option value="course">كورس تدريبي</option>
                  </select>
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
                  onClick={() => setEditingFile(null)}
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
};
