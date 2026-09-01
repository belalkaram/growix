'use client';

import React, { useState, useMemo } from 'react';
import { 
  Smartphone, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Copy, 
  Check, 
  Search, 
  Filter, 
  Eye, 
  RefreshCw, 
  Radio, 
  ExternalLink,
  Info,
  Calendar,
  Clock,
  User,
  CreditCard,
  Trash2,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteTransactionAction } from '@/lib/actions/transactions';

interface TransactionItem {
  id: number;
  transactionId: string;
  provider: string;
  amount: string;
  amountCents: number;
  senderPhone: string;
  senderName: string | null;
  walletPhone: string;
  referenceId: string | null;
  rawTransactionDate: string | null;
  rawTransactionTime: string | null;
  rawMessage: string;
  status: string;
  matchedOrderId: string | null;
  reviewReason: string | null;
  metadata: any;
  isDryRun: boolean;
  createdAt: Date;
  orderAmount: string | null;
  orderStatus: string | null;
  orderPackageId: string | null;
  orderUserName: string | null;
  orderUserEmail: string | null;
  orderUserPhone: string | null;
}

export function TransactionsClient({ initialTransactions }: { initialTransactions: TransactionItem[] }) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<TransactionItem[]>(initialTransactions);

  React.useEffect(() => {
    setTransactions(initialTransactions);
  }, [initialTransactions]);
  
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDeleteTransaction = async (id: number, txCode?: string) => {
    if (!confirm(`هل أنت متأكد من حذف هذه المعاملة (${txCode || id}) نهائياً من سجل الـ Webhook؟`)) {
      return;
    }
    setDeletingId(id);
    const res = await deleteTransactionAction(id);
    setDeletingId(null);
    if (res.success) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      if (selectedTx?.id === id) {
        setSelectedTx(null);
      }
      router.refresh();
    } else {
      alert(res.error || 'فشل في حذف المعاملة');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 800);
  };
  
  // Filters
  const [providerFilter, setProviderFilter] = useState<'all' | 'vodafone_cash' | 'instapay'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Provider filter
      if (providerFilter !== 'all' && tx.provider !== providerFilter) return false;

      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'MATCHED' && !['WOULD_AUTO_APPROVE', 'AUTO_APPROVED'].includes(tx.status)) return false;
        if (statusFilter === 'REVIEW' && !['REVIEW_REQUIRED', 'PHONE_MISMATCH', 'WRONG_WALLET', 'AMOUNT_MISMATCH', 'TIME_MISMATCH'].includes(tx.status)) return false;
        if (statusFilter === 'NO_MATCH' && tx.status !== 'NO_MATCH') return false;
        if (statusFilter === 'INVALID' && !['INVALID_MESSAGE', 'DUPLICATE', 'FAILED'].includes(tx.status)) return false;
      }

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const matchTxId = tx.transactionId?.toLowerCase().includes(q);
        const matchPhone = tx.senderPhone?.toLowerCase().includes(q);
        const matchName = tx.senderName?.toLowerCase().includes(q);
        const matchMsg = tx.rawMessage?.toLowerCase().includes(q);
        const matchAmount = tx.amount?.toLowerCase().includes(q);
        const matchOrderUser = tx.orderUserName?.toLowerCase().includes(q);
        if (!matchTxId && !matchPhone && !matchName && !matchMsg && !matchAmount && !matchOrderUser) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, providerFilter, statusFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = transactions.length;
    const matched = transactions.filter(t => ['WOULD_AUTO_APPROVE', 'AUTO_APPROVED'].includes(t.status)).length;
    const review = transactions.filter(t => ['REVIEW_REQUIRED', 'PHONE_MISMATCH', 'WRONG_WALLET', 'AMOUNT_MISMATCH'].includes(t.status)).length;
    const noMatch = transactions.filter(t => t.status === 'NO_MATCH').length;
    const invalid = transactions.filter(t => ['INVALID_MESSAGE', 'DUPLICATE', 'FAILED'].includes(t.status)).length;
    return { total, matched, review, noMatch, invalid };
  }, [transactions]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AUTO_APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>مقبول تلقائياً</span>
          </span>
        );
      case 'WOULD_AUTO_APPROVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>مطابق 100% (DRY RUN)</span>
          </span>
        );
      case 'NO_MATCH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <Info className="w-3.5 h-3.5" />
            <span>لم يُعثر على طلب مطابق</span>
          </span>
        );
      case 'REVIEW_REQUIRED':
      case 'PHONE_MISMATCH':
      case 'WRONG_WALLET':
      case 'AMOUNT_MISMATCH':
      case 'TIME_MISMATCH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>يتطلب مراجعة الأدمين ({status})</span>
          </span>
        );
      case 'DUPLICATE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-gray-500/20 text-gray-400 border border-gray-500/30">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>معاملة مكررة (Duplicate)</span>
          </span>
        );
      case 'INVALID_MESSAGE':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" />
            <span>رسالة غير صالحة ({status})</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 dir-rtl">
      {/* Top Header & Fast Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0F172A] p-6 rounded-2xl border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-emerald-500/10 text-[#2ECC8F] rounded-xl border border-emerald-500/20">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                سجل تحويلات وطلبات الـ Webhook
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-mono font-bold">
                  LIVE INGESTION
                </span>
              </h1>
              <p className="text-xs text-gray-400">
                مراقبة حية لكل الرسائل والتحويلات القادمة من هواتف الـ iPhone والشورت كات (ناجحة / فاشلة / معلقة)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-[#2ECC8F] border border-emerald-500/30 rounded-xl text-xs font-black transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'جاري التحديث...' : 'تحديث السجل فوري'}</span>
          </button>

          <Link
            href="/admin/orders"
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-white/10"
          >
            <CreditCard className="w-4 h-4 text-[#2ECC8F]" />
            <span>العودة لجدول الطلبات</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-[#0F172A] p-4 rounded-xl border border-white/10">
          <span className="text-[11px] text-gray-400 block mb-1">إجمالي الريكويستات</span>
          <span className="text-2xl font-black text-white font-mono">{stats.total}</span>
        </div>

        <div className="bg-[#0F172A] p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
          <span className="text-[11px] text-emerald-400 block mb-1">مطابقة جاهزة للقبول</span>
          <span className="text-2xl font-black text-emerald-400 font-mono">{stats.matched}</span>
        </div>

        <div className="bg-[#0F172A] p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
          <span className="text-[11px] text-blue-400 block mb-1">تحويلات بدون طلب مسجل</span>
          <span className="text-2xl font-black text-blue-400 font-mono">{stats.noMatch}</span>
        </div>

        <div className="bg-[#0F172A] p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <span className="text-[11px] text-amber-400 block mb-1">تحتاج مراجعة دقيقة</span>
          <span className="text-2xl font-black text-amber-400 font-mono">{stats.review}</span>
        </div>

        <div className="bg-[#0F172A] p-4 rounded-xl border border-rose-500/20 bg-rose-500/5">
          <span className="text-[11px] text-rose-400 block mb-1">مرفوضة / مكررة / أخطاء</span>
          <span className="text-2xl font-black text-rose-400 font-mono">{stats.invalid}</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#0F172A] p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث برقم العملية، الهاتف، المبلغ، أو النص..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#2ECC8F]"
          />
        </div>

        {/* Provider Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
          <span className="text-[11px] text-gray-400 ml-1">المزود:</span>
          {(['all', 'vodafone_cash', 'instapay'] as const).map((prov) => (
            <button
              key={prov}
              onClick={() => setProviderFilter(prov)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                providerFilter === prov
                  ? 'bg-[#0F9D58] text-white shadow'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {prov === 'all' ? 'الكل' : prov === 'vodafone_cash' ? 'فودافون كاش' : 'إنستاباي'}
            </button>
          ))}
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
          <span className="text-[11px] text-gray-400 ml-1">الحالة:</span>
          {[
            { id: 'all', label: 'الكل' },
            { id: 'MATCHED', label: 'مطابق' },
            { id: 'NO_MATCH', label: 'بدون طلب' },
            { id: 'REVIEW', label: 'مراجعة' },
            { id: 'INVALID', label: 'أخطاء' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === st.id
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-[#0F172A] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            لا توجد تحويلات أو ريكويستات مطابقة لخيارات البحث المحددة.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-white/5 text-gray-400 border-b border-white/10">
                <tr>
                  <th className="p-4">وقت الوصول</th>
                  <th className="p-4">المزود وطريقة الدفع</th>
                  <th className="p-4">رقم العملية / المرجع</th>
                  <th className="p-4">المبلغ المستلم</th>
                  <th className="p-4">بيانات المحوّل</th>
                  <th className="p-4">نتيجة المطابقة</th>
                  <th className="p-4">الطلب المرتبط</th>
                  <th className="p-4 text-center">الرسالة الأصلية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTransactions.map((tx) => {
                  return (
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                      {/* Received Time */}
                      <td className="p-4 text-gray-300">
                        <div className="flex items-center gap-1 text-[11px] text-gray-300 font-mono">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>{new Date(tx.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <span className="text-[10px] text-gray-500 block font-mono">
                          {new Date(tx.createdAt).toLocaleDateString('ar-EG')}
                        </span>
                      </td>

                      {/* Provider */}
                      <td className="p-4">
                        {tx.provider === 'vodafone_cash' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-red-500/15 text-red-400 border border-red-500/25">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            فودافون كاش
                          </span>
                        ) : tx.provider === 'instapay' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                            إنستاباي (InstaPay)
                          </span>
                        ) : (
                          <span className="text-gray-400 font-mono text-[11px]">{tx.provider}</span>
                        )}
                      </td>

                      {/* Transaction ID */}
                      <td className="p-4 font-mono font-bold text-white">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            {tx.transactionId}
                          </span>
                          <button
                            onClick={() => copyToClipboard(tx.transactionId, `tx-${tx.id}`)}
                            className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                            title="نسخ رقم المعاملة"
                          >
                            {copiedId === `tx-${tx.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        {tx.referenceId && tx.referenceId !== tx.transactionId && (
                          <span className="text-[10px] text-gray-400 block mt-0.5">
                            مرجع: {tx.referenceId}
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="p-4">
                        <span className="text-sm font-black text-white font-mono block">
                          {tx.amount} ج.م
                        </span>
                      </td>

                      {/* Sender details */}
                      <td className="p-4 text-gray-200">
                        {tx.senderPhone && tx.senderPhone !== 'unknown' && (
                          <span className="text-xs font-mono font-bold text-[#2ECC8F] block dir-ltr text-right">
                            {tx.senderPhone}
                          </span>
                        )}
                        {tx.senderName && (
                          <span className="text-[11px] text-gray-300 font-bold block truncate max-w-[150px]">
                            {tx.senderName}
                          </span>
                        )}
                        <span className="text-[10px] text-gray-500 block">
                          محفظة الشركة: {tx.walletPhone}
                        </span>
                      </td>

                      {/* Match Status */}
                      <td className="p-4">
                        {getStatusBadge(tx.status)}
                        {tx.reviewReason && (
                          <span className="text-[10px] text-gray-400 block mt-1 truncate max-w-[180px]" title={tx.reviewReason}>
                            {tx.reviewReason}
                          </span>
                        )}
                      </td>

                      {/* Matched Order */}
                      <td className="p-4 text-gray-300">
                        {tx.matchedOrderId ? (
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-white block">
                              {tx.orderUserName || 'طلب مسجل'}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono block">
                              مبلغ الطلب: {tx.orderAmount} ج
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded inline-block ${
                              tx.orderStatus === 'approved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                            }`}>
                              حالة الطلب: {tx.orderStatus}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-500 italic">لا يوجد ربط</span>
                        )}
                      </td>

                      {/* Actions: View Raw SMS & Delete */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedTx(tx)}
                            className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 hover:text-white text-gray-300 rounded-lg text-xs font-bold transition-all border border-white/10 inline-flex items-center gap-1 cursor-pointer"
                            title="عرض تفاصيل الرسالة"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#2ECC8F]" />
                            <span>عرض</span>
                          </button>

                          <button
                            onClick={() => handleDeleteTransaction(tx.id, tx.transactionId)}
                            disabled={deletingId === tx.id}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs transition-all cursor-pointer disabled:opacity-50"
                            title="حذف هذا السجل"
                          >
                            {deletingId === tx.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
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

      {/* Raw SMS Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-white/15 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#2ECC8F]" />
                <h3 className="text-base font-black text-white">تفاصيل الريكويست والرسالة الواردة</h3>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Transaction Quick Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/5 p-3.5 rounded-xl border border-white/10 text-xs">
              <div>
                <span className="text-gray-400 block text-[10px]">المزود:</span>
                <span className="font-bold text-white">{selectedTx.provider}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">المبلغ المستخرج:</span>
                <span className="font-bold text-emerald-400 font-mono">{selectedTx.amount} EGP</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">رقم العملية:</span>
                <span className="font-bold text-white font-mono">{selectedTx.transactionId}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">الحالة:</span>
                <span className="font-bold text-white">{selectedTx.status}</span>
              </div>
            </div>

            {/* Raw SMS Body */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-300">نص الرسالة الخام المستلمة من الـ iPhone:</label>
                <button
                  onClick={() => copyToClipboard(selectedTx.rawMessage, 'modal-raw')}
                  className="text-[11px] text-[#2ECC8F] hover:underline flex items-center gap-1"
                >
                  {copiedId === 'modal-raw' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>نسخ النص كاملاً</span>
                </button>
              </div>
              <div className="bg-[#080D1A] p-4 rounded-xl border border-white/10 font-mono text-xs text-gray-200 whitespace-pre-wrap leading-relaxed select-all">
                {selectedTx.rawMessage}
              </div>
            </div>

            {/* Technical Metadata */}
            {selectedTx.metadata && (
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">بيانات الـ Request الفنية (Metadata):</label>
                <div className="bg-white/5 p-3 rounded-xl border border-white/10 font-mono text-[11px] text-gray-300 space-y-1">
                  <div>الجهاز المرسل: <span className="text-emerald-400">{selectedTx.metadata.device || 'iphone'}</span></div>
                  {selectedTx.metadata.ip && <div>عنوان الـ IP: <span className="text-gray-400">{selectedTx.metadata.ip}</span></div>}
                  {selectedTx.metadata.userAgent && <div>User-Agent: <span className="text-gray-400">{selectedTx.metadata.userAgent}</span></div>}
                  {selectedTx.metadata.reasons && (
                    <div>شروط المطابقة: <span className="text-emerald-300">{JSON.stringify(selectedTx.metadata.reasons)}</span></div>
                  )}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-white/10">
              <button
                type="button"
                onClick={() => handleDeleteTransaction(selectedTx.id, selectedTx.transactionId)}
                disabled={deletingId === selectedTx.id}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {deletingId === selectedTx.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>حذف هذه المعاملة</span>
              </button>

              <button
                onClick={() => setSelectedTx(null)}
                className="px-5 py-2 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
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
