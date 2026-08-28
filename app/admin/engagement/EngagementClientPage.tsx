'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  BarChart2,
  AlertTriangle,
  CheckCircle2,
  Download,
  MessageCircle,
  Search,
  ArrowDownUp,
  ExternalLink,
} from 'lucide-react';

interface EngagementRow {
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  createdAt: string;
  orderId: string;
  packageId: string;
  toolId: string | null;
  orderCreatedAt: string;
  downloadCount: number;
}

interface TopFile {
  fileName: string;
  category: string;
  downloads: number;
}

interface Stats {
  totalApproved: number;
  zeroDownloads: number;
  withDownloads: number;
}

interface Props {
  rows: EngagementRow[];
  topFiles: TopFile[];
  stats: Stats;
}

const PACKAGE_LABELS: Record<string, string> = {
  'bundle-vip': 'باقة VIP الشاملة',
  'single-tool': 'أداة واحدة',
  'bundle-pro': 'الباقة المتقدمة',
  'bundle-starter': 'الباقة الأساسية',
};

function whatsappLink(phone: string, userName: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const intl = cleaned.startsWith('0') ? '2' + cleaned : cleaned;
  const msg = encodeURIComponent(
    `السلام عليكم ${userName}،\n\nمعك فريق GROWIX 🎉\nلاحظنا إنك سجّلت في المنصة ولسه ما بدأتش تحمّل الأدوات أو ما استفدتش من الباقة كاملة.\n\nإحنا هنا معاك خطوة بخطوة — ابعتلنا وهنساعدك في التركيب والتشغيل فوراً 💪`
  );
  return `https://wa.me/${intl}?text=${msg}`;
}

export default function EngagementClientPage({ rows, topFiles, stats }: Props) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'zero' | 'active'>('all');
  const [sortBy, setSortBy] = useState<'order' | 'downloads'>('order');

  const filtered = useMemo(() => {
    let data = rows;

    if (filter === 'zero') data = data.filter(r => r.downloadCount === 0);
    else if (filter === 'active') data = data.filter(r => r.downloadCount > 0);

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        r =>
          r.userName.toLowerCase().includes(q) ||
          r.userEmail.toLowerCase().includes(q) ||
          r.userPhone.includes(q)
      );
    }

    if (sortBy === 'downloads') {
      data = [...data].sort((a, b) => a.downloadCount - b.downloadCount);
    } else {
      data = [...data].sort(
        (a, b) => new Date(b.orderCreatedAt).getTime() - new Date(a.orderCreatedAt).getTime()
      );
    }

    return data;
  }, [rows, filter, search, sortBy]);

  const pct = stats.totalApproved > 0
    ? Math.round((stats.withDownloads / stats.totalApproved) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#0F172A] text-white p-4 md:p-8 dir-rtl" dir="rtl">
      {/* ── Header ── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F9D58] to-[#2ECC8F] flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">تدقيق تفاعل العملاء</h1>
            <p className="text-sm text-gray-400">حصر العملاء المفعّلين الذين لم يستفيدوا من الباقة بالكامل</p>
          </div>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="إجمالي الطلبات المفعّلة"
          value={stats.totalApproved}
          color="blue"
        />
        <StatCard
          icon={<AlertTriangle className="w-5 h-5" />}
          label="لم يحمّلوا أي شيء ⚠️"
          value={stats.zeroDownloads}
          color="red"
        />
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5" />}
          label="يستخدمون المنصة بفعالية"
          value={stats.withDownloads}
          color="green"
        />
        <StatCard
          icon={<BarChart2 className="w-5 h-5" />}
          label="معدل الاستفادة"
          value={`${pct}%`}
          color="purple"
        />
      </div>

      {/* ── Progress Bar ── */}
      <div className="bg-white/5 rounded-2xl p-4 mb-8 border border-white/10">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>معدل الاستفادة من الباقات</span>
          <span className="font-bold text-white">{pct}% ({stats.withDownloads} من {stats.totalApproved})</span>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-[#0F9D58] to-[#2ECC8F]"
          />
        </div>
      </div>

      {/* ── Top Downloaded Files ── */}
      {topFiles.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8">
          <h2 className="text-sm font-black text-[#2ECC8F] mb-4 flex items-center gap-2">
            <Download className="w-4 h-4" />
            أكثر الملفات والأدوات تحميلاً
          </h2>
          <div className="space-y-2">
            {topFiles.map((f, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#0F9D58]/20 text-[#2ECC8F] flex items-center justify-center text-[10px] font-black shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-gray-200 truncate max-w-[220px]">{f.fileName}</span>
                  <span className="text-[10px] bg-white/10 text-gray-400 px-1.5 py-0.5 rounded-full">{f.category}</span>
                </div>
                <span className="text-[#2ECC8F] font-black shrink-0 ml-2">{f.downloads} تحميل</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Filters & Search ── */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="بحث بالاسم، الإيميل، أو الهاتف..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl px-10 py-2.5 placeholder-gray-500 focus:outline-none focus:border-[#0F9D58] focus:ring-1 focus:ring-[#0F9D58]"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'zero', 'active'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-4 py-2 rounded-xl font-bold transition-all ${
                filter === f
                  ? 'bg-gradient-to-r from-[#0F9D58] to-[#2ECC8F] text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {f === 'all' ? 'الكل' : f === 'zero' ? '⚠️ لم يحمّلوا' : '✅ نشطون'}
            </button>
          ))}
          <button
            onClick={() => setSortBy(sortBy === 'order' ? 'downloads' : 'order')}
            className="text-xs px-3 py-2 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white flex items-center gap-1.5"
          >
            <ArrowDownUp className="w-3.5 h-3.5" />
            {sortBy === 'order' ? 'ترتيب: التاريخ' : 'ترتيب: التحميلات'}
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-right">
                <th className="px-4 py-3 font-bold">العميل</th>
                <th className="px-4 py-3 font-bold">الهاتف</th>
                <th className="px-4 py-3 font-bold">الباقة</th>
                <th className="px-4 py-3 font-bold">تاريخ التفعيل</th>
                <th className="px-4 py-3 font-bold text-center">التحميلات</th>
                <th className="px-4 py-3 font-bold text-center">الحالة</th>
                <th className="px-4 py-3 font-bold text-center">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    لا توجد نتائج مطابقة للفلتر المحدد
                  </td>
                </tr>
              )}
              {filtered.map((row, i) => {
                const isZero = row.downloadCount === 0;
                const orderDate = new Date(row.orderCreatedAt).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                });
                return (
                  <motion.tr
                    key={row.orderId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`transition-colors hover:bg-white/5 ${isZero ? 'bg-red-500/5' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-bold text-white">{row.userName}</div>
                      <div className="text-gray-400 text-[11px] mt-0.5">{row.userEmail}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-300 dir-ltr text-left">
                      {row.userPhone || <span className="text-gray-600 italic">غير متاح</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-[#0F9D58]/15 text-[#2ECC8F] px-2 py-0.5 rounded-full text-[11px] font-bold">
                        {PACKAGE_LABELS[row.packageId] || row.packageId}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{orderDate}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-lg font-black ${isZero ? 'text-red-400' : 'text-[#2ECC8F]'}`}>
                        {row.downloadCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isZero ? (
                        <span className="bg-red-500/20 text-red-400 text-[11px] px-2 py-1 rounded-full font-bold flex items-center gap-1 justify-center">
                          <AlertTriangle className="w-3 h-3" />
                          لم يحمّل شيئاً
                        </span>
                      ) : row.downloadCount < 3 ? (
                        <span className="bg-yellow-500/20 text-yellow-400 text-[11px] px-2 py-1 rounded-full font-bold">
                          استخدام محدود
                        </span>
                      ) : (
                        <span className="bg-[#0F9D58]/20 text-[#2ECC8F] text-[11px] px-2 py-1 rounded-full font-bold flex items-center gap-1 justify-center">
                          <CheckCircle2 className="w-3 h-3" />
                          نشط
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {row.userPhone && (
                          <a
                            href={whatsappLink(row.userPhone, row.userName)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="تواصل عبر واتساب"
                            className="inline-flex items-center gap-1 bg-[#25D366]/20 hover:bg-[#25D366]/40 text-[#25D366] text-[11px] px-2.5 py-1.5 rounded-xl font-bold transition-all"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            واتساب
                          </a>
                        )}
                        <a
                          href={`/admin/users?userId=${row.userId}`}
                          title="فتح بيانات المستخدم"
                          className="inline-flex items-center gap-1 bg-white/10 hover:bg-white/20 text-gray-300 text-[11px] px-2.5 py-1.5 rounded-xl transition-all"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        <div className="px-4 py-3 border-t border-white/10 text-xs text-gray-500">
          يُعرض {filtered.length} من {rows.length} عميل
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: 'blue' | 'red' | 'green' | 'purple';
}) {
  const colors = {
    blue: 'from-blue-500/20 to-blue-600/10 text-blue-400 border-blue-500/20',
    red: 'from-red-500/20 to-red-600/10 text-red-400 border-red-500/20',
    green: 'from-[#0F9D58]/20 to-[#2ECC8F]/10 text-[#2ECC8F] border-[#0F9D58]/20',
    purple: 'from-purple-500/20 to-purple-600/10 text-purple-400 border-purple-500/20',
  };
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-4`}
    >
      <div className="flex items-center gap-2 mb-2 opacity-80">
        {icon}
        <span className="text-[11px] font-bold leading-tight">{label}</span>
      </div>
      <div className="text-3xl font-black">{value}</div>
    </motion.div>
  );
}
