'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { getRecentVisitorLogsAction, VisitorLogsFilterParams } from '@/lib/actions/analytics';
import { 
  Activity, 
  Search, 
  Calendar, 
  Clock, 
  Smartphone, 
  Laptop, 
  RefreshCw, 
  Download, 
  Target, 
  Copy, 
  Check, 
  ExternalLink, 
  SlidersHorizontal,
  ChevronDown,
  X,
  Eye,
  Filter
} from 'lucide-react';

interface VisitorLogItem {
  id: number;
  sessionId: string;
  path: string;
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  deviceType: string | null;
  durationSeconds: number | null;
  isAdmin: boolean;
  createdAt: string;
}

interface RealtimeVisitorFeedProps {
  initialViews?: any[];
  availablePaths?: string[];
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0 ثانية';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s} ثانية`;
  if (s === 0) return `${m} دقيقة`;
  return `${m} د و ${s} ث`;
}

export const RealtimeVisitorFeed: React.FC<RealtimeVisitorFeedProps> = ({
  initialViews = [],
  availablePaths = [],
}) => {
  const [views, setViews] = useState<VisitorLogItem[]>(
    initialViews.map((v) => ({
      ...v,
      createdAt: typeof v.createdAt === 'string' ? v.createdAt : new Date(v.createdAt).toISOString(),
    }))
  );
  const [totalCount, setTotalCount] = useState<number>(initialViews.length);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  // Filter States
  const [range, setRange] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('00:00');
  const [endDate, setEndDate] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('23:59');
  const [showCustomRange, setShowCustomRange] = useState<boolean>(false);

  const [device, setDevice] = useState<string>('all');
  const [path, setPath] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [limit, setLimit] = useState<number>(15);
  const [copiedSessionId, setCopiedSessionId] = useState<string | null>(null);
  const [selectedVisit, setSelectedVisit] = useState<VisitorLogItem | null>(null);

  const fetchLogs = async (overrideParams?: Partial<VisitorLogsFilterParams>) => {
    setLoading(true);
    const targetRange = overrideParams?.range ?? range;
    const targetStartDate = overrideParams?.startDate ?? startDate;
    const targetStartTime = overrideParams?.startTime ?? startTime;
    const targetEndDate = overrideParams?.endDate ?? endDate;
    const targetEndTime = overrideParams?.endTime ?? endTime;
    const targetDevice = overrideParams?.device ?? device;
    const targetPath = overrideParams?.path ?? path;
    const targetSearch = overrideParams?.search ?? search;
    const targetLimit = overrideParams?.limit ?? limit;

    const res = await getRecentVisitorLogsAction({
      range: targetRange,
      startDate: targetRange === 'custom' ? targetStartDate : undefined,
      startTime: targetRange === 'custom' ? targetStartTime : undefined,
      endDate: targetRange === 'custom' ? targetEndDate : undefined,
      endTime: targetRange === 'custom' ? targetEndTime : undefined,
      device: targetDevice,
      path: targetPath,
      search: targetSearch,
      limit: targetLimit,
    });

    setLoading(false);
    if (res.success) {
      setViews(res.views as VisitorLogItem[]);
      setTotalCount(res.totalCount);
      setLastUpdated(new Date());
    }
  };

  const handleRangeChange = (newRange: string) => {
    setRange(newRange);
    if (newRange === 'custom') {
      setShowCustomRange(true);
    } else {
      setShowCustomRange(false);
      startTransition(() => {
        fetchLogs({ range: newRange });
      });
    }
  };

  const handleApplyCustomRange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) return;
    startTransition(() => {
      fetchLogs({ range: 'custom', startDate, startTime, endDate, endTime });
    });
  };

  const handleDeviceChange = (newDevice: string) => {
    setDevice(newDevice);
    startTransition(() => {
      fetchLogs({ device: newDevice });
    });
  };

  const handlePathChange = (newPath: string) => {
    setPath(newPath);
    startTransition(() => {
      fetchLogs({ path: newPath });
    });
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    startTransition(() => {
      fetchLogs({ limit: newLimit });
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      fetchLogs({ search });
    });
  };

  const handleCopySession = (sessionId: string) => {
    navigator.clipboard.writeText(sessionId);
    setCopiedSessionId(sessionId);
    setTimeout(() => setCopiedSessionId(null), 2000);
  };

  const handleExportCSV = () => {
    if (views.length === 0) return;

    const headers = ['المعرف', 'الجلسة', 'الصفحة', 'نوع الجهاز', 'مدة البقاء (ثواني)', 'المصدر', 'الحملة', 'التاريخ والوقت'];
    const csvRows = [
      headers.join(','),
      ...views.map((v) =>
        [
          v.id,
          `"${v.sessionId}"`,
          `"${v.path}"`,
          `"${v.deviceType || 'غير محدد'}"`,
          v.durationSeconds || 0,
          `"${v.utmSource || v.referrer || 'Direct'}"`,
          `"${v.utmCampaign || ''}"`,
          `"${new Date(v.createdAt).toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' })}"`,
        ].join(',')
      ),
    ];

    // UTF-8 BOM to ensure Arabic characters display cleanly in Microsoft Excel
    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `growix_visitor_logs_${range}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const quickFilterTabs = [
    { id: 'all', label: 'الكل (All)' },
    { id: 'today', label: 'اليوم (Today)' },
    { id: 'yesterday', label: 'أمس (Yesterday)' },
    { id: '7days', label: 'آخر 7 أيام' },
    { id: 'month', label: 'هذا الشهر (This Month)' },
    { id: 'last_month', label: 'الشهر السابق (Last Month)' },
    { id: 'custom', label: 'نطاق مخصص (Custom)' },
  ];

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-[#0F172A] border border-white/10 space-y-6 shadow-xl relative">
      
      {/* Header & Status Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2ECC8F]/15 text-[#2ECC8F] flex items-center justify-center font-bold">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>سجل آخر الزيارات اللحظية (Realtime Live Feed)</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#2ECC8F] animate-pulse" title="بث حي ومباشر" />
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                تتبع وتحليل كل زيارة وجلسة لحظة بلحظة مع خيارات فلترة شاملة بالتاريخ، اليوم، والشهر
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start lg:self-auto">
          <span className="text-[11px] font-mono text-gray-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
            إجمالي المطابق: <b className="text-[#2ECC8F]">{totalCount}</b> زيارة
          </span>

          <button
            type="button"
            onClick={() => fetchLogs()}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-sm active:scale-95"
            title="تحديث قائمة الزيارات فوراً"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#2ECC8F]' : ''}`} />
            <span className="hidden sm:inline">تحديث</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={views.length === 0}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 border border-emerald-500/30 transition-all disabled:opacity-50 cursor-pointer shadow-sm active:scale-95"
            title="تصدير السجل إلى Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">تصدير CSV</span>
          </button>
        </div>
      </div>

      {/* Date Filter Tabs (اليوم، أمس، 7 أيام، هذا الشهر، الشهر السابق، مخصص) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#2ECC8F]" />
            <span>فلترة التاريخ والفترة الزمنية:</span>
          </span>
          <span className="text-[10px] text-gray-500 font-mono">
            آخر تحديث: {lastUpdated.toLocaleTimeString('ar-EG')}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {quickFilterTabs.map((tab) => {
            const isActive = range === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleRangeChange(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#00FF87] text-[#0A1128] shadow-md shadow-[#00FF87]/20 scale-105'
                    : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Range Expansion Form */}
      {showCustomRange && (
        <form onSubmit={handleApplyCustomRange} className="p-4 rounded-2xl bg-white/5 border border-[#2ECC8F]/30 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[#2ECC8F]">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>تحديد نطاق مخصص بالتاريخ والوقت:</span>
            </span>
            <button
              type="button"
              onClick={() => setShowCustomRange(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-gray-400 mb-1">من تاريخ (Start Date)</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-white/10 text-white focus:outline-none focus:border-[#2ECC8F]"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">من وقت (Start Time)</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-white/10 text-white focus:outline-none focus:border-[#2ECC8F]"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">إلى تاريخ (End Date)</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-white/10 text-white focus:outline-none focus:border-[#2ECC8F]"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">إلى وقت (End Time)</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-white/10 text-white focus:outline-none focus:border-[#2ECC8F]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={loading || !startDate}
              className="px-5 py-2 rounded-xl bg-[#00FF87] hover:bg-[#00E676] text-[#0A1128] font-black text-xs shadow-md transition-transform active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>تطبيق فلترة النطاق المخصص</span>
            </button>
          </div>
        </form>
      )}

      {/* Secondary Controls Bar: Search, Device, Path, Limit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 pt-1">
        
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="lg:col-span-4 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالرابط، الجلسة، أو UTM..."
            className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#2ECC8F]"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                fetchLogs({ search: '' });
              }}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Device Select */}
        <div className="lg:col-span-3">
          <select
            value={device}
            onChange={(e) => handleDeviceChange(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-[#2ECC8F] cursor-pointer"
          >
            <option value="all" className="bg-[#0F172A]">جميع الأجهزة (كل الزيارات)</option>
            <option value="mobile" className="bg-[#0F172A]">📱 موبايل فقط</option>
            <option value="desktop" className="bg-[#0F172A]">💻 كمبيوتر فقط</option>
          </select>
        </div>

        {/* Path Select */}
        <div className="lg:col-span-3">
          <select
            value={path}
            onChange={(e) => handlePathChange(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-[#2ECC8F] cursor-pointer"
          >
            <option value="all" className="bg-[#0F172A]">جميع الصفحات والمسارات</option>
            {availablePaths.map((p) => (
              <option key={p} value={p} className="bg-[#0F172A]">
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Limit Selector */}
        <div className="lg:col-span-2">
          <select
            value={limit}
            onChange={(e) => handleLimitChange(Number(e.target.value))}
            className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-[#2ECC8F] cursor-pointer"
          >
            <option value={15} className="bg-[#0F172A]">عرض 15 زيارة</option>
            <option value={30} className="bg-[#0F172A]">عرض 30 زيارة</option>
            <option value={50} className="bg-[#0F172A]">عرض 50 زيارة</option>
            <option value={100} className="bg-[#0F172A]">عرض 100 زيارة</option>
            <option value={200} className="bg-[#0F172A]">عرض 200 زيارة</option>
          </select>
        </div>

      </div>

      {/* Visitor Logs Table */}
      {views.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white/5 border border-white/5 space-y-2">
          <Activity className="w-8 h-8 text-gray-500 mx-auto" />
          <p className="text-sm font-bold text-gray-300">لا توجد زيارات مسجلة تطابق خيارات الفلترة المحددة</p>
          <p className="text-xs text-gray-500">جرب تغيير الفترة الزمنية أو إعادة تعيين الفلاتر لعرض كافة الزيارات</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-right text-xs">
            <thead className="bg-white/5 text-gray-400 border-b border-white/10 text-[11px]">
              <tr>
                <th className="py-3.5 px-3.5">الوقت والتاريخ</th>
                <th className="py-3.5 px-3.5">الجلسة (Session ID)</th>
                <th className="py-3.5 px-3.5">الصفحة (Path)</th>
                <th className="py-3.5 px-3.5">الجهاز (Device)</th>
                <th className="py-3.5 px-3.5">مدة البقاء</th>
                <th className="py-3.5 px-3.5">المصدر (Source / Referrer)</th>
                <th className="py-3.5 px-3.5 text-center">التفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-[#0A1128]/40">
              {views.map((view) => (
                <tr key={view.id} className="hover:bg-white/5 transition-colors">
                  
                  {/* Time & Date */}
                  <td className="py-3 px-3.5 text-gray-300 whitespace-nowrap font-mono text-[11px]">
                    <div className="flex flex-col">
                      <span className="font-bold text-white">
                        {new Date(view.createdAt).toLocaleTimeString('ar-EG', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {new Date(view.createdAt).toLocaleDateString('ar-EG', {
                          month: 'numeric',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </td>

                  {/* Session ID with copy button */}
                  <td className="py-3 px-3.5 font-mono text-gray-400 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-300 font-semibold">{view.sessionId.slice(0, 12)}...</span>
                      <button
                        type="button"
                        onClick={() => handleCopySession(view.sessionId)}
                        className="text-gray-500 hover:text-[#2ECC8F] p-1 transition-colors"
                        title="نسخ معرف الجلسة"
                      >
                        {copiedSessionId === view.sessionId ? (
                          <Check className="w-3.5 h-3.5 text-[#2ECC8F]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Page Path with Link */}
                  <td className="py-3 px-3.5 text-white font-mono font-bold max-w-xs truncate">
                    <a
                      href={view.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#2ECC8F] transition-colors inline-flex items-center gap-1"
                      title={view.path}
                    >
                      <span className="truncate">{view.path}</span>
                      <ExternalLink className="w-3 h-3 text-gray-500 shrink-0" />
                    </a>
                  </td>

                  {/* Device Badge */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 w-fit ${
                      view.deviceType === 'mobile'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    }`}>
                      {view.deviceType === 'mobile' ? (
                        <>
                          <Smartphone className="w-3 h-3" />
                          <span>موبايل</span>
                        </>
                      ) : (
                        <>
                          <Laptop className="w-3 h-3" />
                          <span>كمبيوتر</span>
                        </>
                      )}
                    </span>
                  </td>

                  {/* Stay Duration */}
                  <td className="py-3 px-3.5 font-mono text-amber-400 whitespace-nowrap font-bold text-xs">
                    {formatDuration(view.durationSeconds || 0)}
                  </td>

                  {/* Traffic Source / Referrer */}
                  <td className="py-3 px-3.5 text-gray-300 text-[11px] truncate max-w-xs">
                    {view.utmSource ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#2ECC8F]/10 text-[#2ECC8F] border border-[#2ECC8F]/20 font-bold">
                        <Target className="w-3 h-3" />
                        <span>{view.utmSource}</span>
                      </span>
                    ) : view.referrer ? (
                      <span className="text-gray-400 truncate block" title={view.referrer}>
                        {view.referrer.replace(/^https?:\/\//, '').slice(0, 24)}...
                      </span>
                    ) : (
                      <span className="text-gray-500">مباشر (Direct)</span>
                    )}
                  </td>

                  {/* Details Button */}
                  <td className="py-3 px-3.5 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setSelectedVisit(view)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                      title="عرض كامل بيانات الزيارة"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Visit Details Modal */}
      {selectedVisit && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#2ECC8F]" />
                <h3 className="text-sm font-black text-white">تفاصيل الزيارة والجلسة</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVisit(null)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-gray-300">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-[10px] text-gray-400 block font-bold">معرف الجلسة (Session ID)</span>
                <span className="font-mono text-white text-xs select-all break-all">{selectedVisit.sessionId}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] text-gray-400 block font-bold">الصفحة التي زارها</span>
                  <span className="font-mono text-[#2ECC8F] font-bold break-all">{selectedVisit.path}</span>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] text-gray-400 block font-bold">نوع الجهاز</span>
                  <span className="text-white font-bold">{selectedVisit.deviceType === 'mobile' ? 'هاتف ذكي (Mobile)' : 'كمبيوتر (Desktop)'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] text-gray-400 block font-bold">مدة البقاء في الصفحة</span>
                  <span className="font-mono text-amber-400 font-bold">{formatDuration(selectedVisit.durationSeconds || 0)}</span>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] text-gray-400 block font-bold">توقيت الزيارة</span>
                  <span className="font-mono text-gray-200">
                    {new Date(selectedVisit.createdAt).toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' })}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-[10px] text-gray-400 block font-bold">بيانات التتبع والإحالة (UTM / Referrer)</span>
                <div className="space-y-0.5 text-[11px]">
                  <div><b>UTM Source:</b> <span className="text-[#2ECC8F]">{selectedVisit.utmSource || '—'}</span></div>
                  <div><b>UTM Medium:</b> <span>{selectedVisit.utmMedium || '—'}</span></div>
                  <div><b>UTM Campaign:</b> <span>{selectedVisit.utmCampaign || '—'}</span></div>
                  <div><b>Referrer URL:</b> <span className="break-all text-gray-400">{selectedVisit.referrer || 'Direct'}</span></div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedVisit(null)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
