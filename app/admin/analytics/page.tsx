import React, { Suspense } from 'react';
import { getAnalyticsSummary } from '@/lib/queries/analytics';
import { AdvancedDateFilter } from './AdvancedDateFilter';
import { BarChart3, Eye, Users, Smartphone, Globe } from 'lucide-react';

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{
    range?: string;
    device?: string;
    path?: string;
    startDate?: string;
    startTime?: string;
    endDate?: string;
    endTime?: string;
  }>;
}) {
  const params = await searchParams;
  const range = params.range || 'all';
  const device = params.device || 'all';
  const path = params.path || 'all';
  const startDate = params.startDate;
  const startTime = params.startTime;
  const endDate = params.endDate;
  const endTime = params.endTime;

  const analytics = await getAnalyticsSummary({
    range,
    deviceType: device as any,
    path,
    startDate,
    startTime,
    endDate,
    endTime,
  });

  const mobileCount = analytics.deviceStats.find((d) => d.deviceType === 'mobile')?.views || 0;
  const desktopCount = analytics.deviceStats.find((d) => d.deviceType === 'desktop')?.views || 0;
  const totalDeviceCount = mobileCount + desktopCount || 1;
  const mobilePct = Math.round((mobileCount / totalDeviceCount) * 100);
  const desktopPct = Math.round((desktopCount / totalDeviceCount) * 100);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white mb-1 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-[#2ECC8F]" />
          <span>إحصائيات الترافيك والزيارات المتقدمة</span>
        </h1>
        <p className="text-xs text-gray-400">تحليل وتصفية زوار الموقع بحسب اليوم، التاريخ، الوقت، الأجهزة، والصفحات</p>
      </div>

      {/* Advanced Filter Control Bar */}
      <Suspense fallback={null}>
        <AdvancedDateFilter availablePaths={analytics.availablePaths} />
      </Suspense>

      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-[#0F172A] border border-white/10 flex items-center justify-between shadow-xl">
          <div>
            <span className="text-xs text-gray-400 font-semibold block mb-1">المشاهدات المفلترة (Page Views)</span>
            <span className="text-3xl font-black text-white">{analytics.totalViews}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Eye className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[#0F172A] border border-white/10 flex items-center justify-between shadow-xl">
          <div>
            <span className="text-xs text-gray-400 font-semibold block mb-1">الزوار الفريدين (Unique Sessions)</span>
            <span className="text-3xl font-black text-[#2ECC8F]">{analytics.uniqueSessions}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-[#2ECC8F] flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[#0F172A] border border-white/10 flex items-center justify-between shadow-xl">
          <div>
            <span className="text-xs text-gray-400 font-semibold block mb-1">نسبة الأجهزة (Device Ratio)</span>
            <span className="text-sm font-black text-white">📱 {mobilePct}% | 💻 {desktopPct}%</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Smartphone className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Top Visited Pages & Realtime Visits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 rounded-3xl bg-[#0F172A] border border-white/10 space-y-4 shadow-xl">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#2ECC8F]" />
            <span>أكثر الصفحات زيارة (حسب الفلترة)</span>
          </h2>

          {analytics.topPages.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">لا توجد زيارات تطابق فلاتر البحث الحالية</p>
          ) : (
            <div className="space-y-3">
              {analytics.topPages.map((page, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 text-xs">
                  <span className="font-mono text-gray-300 truncate max-w-xs">{page.path}</span>
                  <span className="font-bold text-[#2ECC8F] bg-[#2ECC8F]/10 px-2.5 py-1 rounded-md">
                    {page.views} مشاهدة
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Realtime Visits Table */}
        <div className="p-6 rounded-3xl bg-[#0F172A] border border-white/10 space-y-4 shadow-xl">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#2ECC8F]" />
            <span>سجل آخر الزيارات المتطابقة للفلتر</span>
          </h2>

          {analytics.recentViews.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">لا توجد زيارات حديثة</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {analytics.recentViews.map((view) => (
                <div key={view.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 text-[11px]">
                  <div>
                    <span className="font-mono font-bold text-white block">{view.path}</span>
                    <span className="text-gray-500 font-mono text-[10px]">
                      {view.deviceType} • {view.sessionId.slice(0, 8)}...
                    </span>
                  </div>
                  <span className="text-gray-400 text-[10px] font-mono">
                    {new Date(view.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
