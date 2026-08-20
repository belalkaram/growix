'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, XCircle, Trash2, ExternalLink, Loader2, Check, AlertTriangle } from 'lucide-react';
import { deleteReceiptAction } from '@/lib/actions/receipts';

interface OrderReceiptViewerProps {
  orderId: string;
  receiptUrl: string | null;
  receiptKey: string | null;
  customerName: string | null;
  customerPhone: string;
  amount: string;
}

export const OrderReceiptViewer: React.FC<OrderReceiptViewerProps> = ({
  orderId,
  receiptUrl,
  receiptKey,
  customerName,
  customerPhone,
  amount,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (!receiptUrl || deleted) {
    return <span className="text-[11px] text-gray-500 italic">لا يوجد مرفق</span>;
  }

  const handleDelete = async () => {
    if (!receiptKey) return;
    const confirmDelete = window.confirm('هل أنت متأكد من رغبتك في حذف صورة الإثبات نهائياً من Cloudflare R2 لتوفير المساحة؟');
    if (!confirmDelete) return;

    setIsDeleting(true);
    setDeleteError(null);

    const res = await deleteReceiptAction(orderId, receiptKey);
    setIsDeleting(false);

    if (res.success) {
      setDeleted(true);
      setIsOpen(false);
    } else {
      setDeleteError(res.error || 'فشل في حذف الصورة من R2');
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="px-2.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
      >
        <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
        <span>عرض الإثبات</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 dir-rtl">
          <div className="bg-[#0F172A] border border-white/15 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">إثبات التحويل المرفق من العميل</h3>
                  <span className="text-[11px] text-gray-400 block font-mono">
                    {customerName || 'عميل'} ({customerPhone}) — {amount} جنية
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Image Display */}
            <div className="bg-[#080D1A] rounded-2xl p-2 border border-white/10 flex items-center justify-center max-h-[58vh] overflow-hidden">
              <img
                src={receiptUrl}
                alt="لقطة شاشة إثبات التحويل"
                className="max-h-[55vh] w-auto object-contain rounded-xl shadow-md select-all"
              />
            </div>

            {deleteError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            {/* Modal Footer Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10 gap-3">
              {receiptKey ? (
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  <span>{isDeleting ? 'جاري الحذف من R2...' : 'حذف الصورة من R2 (لتنظيف المساحة)'}</span>
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                <a
                  href={receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
                  <span>فتح بالحجم الكامل</span>
                </a>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-bold transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
